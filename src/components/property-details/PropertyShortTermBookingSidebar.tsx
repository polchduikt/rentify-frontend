import { CalendarDays, MessageCircle, Phone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateBookingMutation } from '@/hooks/api';
import type { UnavailableDateRangeDto } from '@/types/property';
import { diffNights } from '@/utils/bookingDates';
import { getApiErrorMessage } from '@/utils/errors';
import { formatPropertyCreatedAt, formatPropertyPrice } from '@/utils/propertyDetails';
import type { PropertyShortTermBookingSidebarProps } from './PropertyShortTermBookingSidebar.types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const isRangeUnavailable = (dateFrom: string, dateTo: string, ranges: UnavailableDateRangeDto[]): boolean =>
  ranges.some((range) => {
    if (!range.dateFrom || !range.dateTo) {
      return false;
    }

    if (range.source === 'BLOCK') {
      return dateFrom <= range.dateTo && dateTo >= range.dateFrom;
    }

    return dateFrom < range.dateTo && dateTo > range.dateFrom;
  });

export const PropertyShortTermBookingSidebar = ({
  property,
  dateFrom,
  dateTo,
  guests,
  maxGuests,
  todayIso,
  maxDateIso,
  nightlyPrice,
  currency,
  unavailableRanges,
  unavailableLoading,
  owner,
  ownerLoading,
  ownerName,
  ownerInitial,
  ownerPhone,
  isPhoneVisible,
  onDateFromChange,
  onDateToChange,
  onGuestsChange,
  onContactHost,
  onShowPhone,
  disableContactHost = false,
}: PropertyShortTermBookingSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [formError, setFormError] = useState<string | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);

  const createBookingMutation = useCreateBookingMutation();

  const nights = useMemo(() => diffNights(dateFrom, dateTo), [dateFrom, dateTo]);
  const estimatedTotal = useMemo(() => Math.round(nightlyPrice * nights), [nightlyPrice, nights]);

  const validationError = useMemo(() => {
    if (!dateFrom || !dateTo) {
      return 'Оберіть дати заїзду та виїзду.';
    }
    if (dateFrom < todayIso) {
      return 'Дата заїзду не може бути в минулому.';
    }
    if (dateFrom >= dateTo) {
      return 'Дата виїзду має бути пізніше за дату заїзду.';
    }
    if (guests < 1 || guests > maxGuests) {
      return `Кількість гостей має бути від 1 до ${maxGuests}.`;
    }
    if (nightlyPrice <= 0) {
      return 'Для цього оголошення не вказана коректна ціна за ніч.';
    }
    if (isRangeUnavailable(dateFrom, dateTo, unavailableRanges)) {
      return 'Обрані дати заброньовані або заблоковані. Виберіть інший період.';
    }
    return null;
  }, [dateFrom, dateTo, guests, maxGuests, nightlyPrice, todayIso, unavailableRanges]);

  const isBookingDisabled =
    createBookingMutation.isPending ||
    unavailableLoading ||
    !dateFrom ||
    !dateTo ||
    Boolean(validationError) ||
    createdBookingId != null;

  const handleGuestsChange = (nextValue: number) => {
    onGuestsChange(clamp(nextValue, 1, maxGuests));
    setFormError(null);
    setCreatedBookingId(null);
  };

  const handleBook = async () => {
    setFormError(null);

    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: location } });
      return;
    }

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const booking = await createBookingMutation.mutateAsync({
        propertyId: property.id,
        dateFrom,
        dateTo,
        guests,
      });
      setCreatedBookingId(booking.id);
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Не вдалося відправити запит на бронювання. Спробуйте ще раз.'));
    }
  };

  return (
    <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Короткострокове бронювання</p>
        <p className="mt-2 text-4xl font-black text-slate-900">{formatPropertyPrice(nightlyPrice, currency)}</p>
        <p className="mt-1 text-sm text-slate-500">за ніч</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Заїзд</span>
            <input
              type="date"
              min={todayIso}
              max={maxDateIso}
              value={dateFrom}
              onChange={(event) => {
                onDateFromChange(event.target.value);
                setFormError(null);
                setCreatedBookingId(null);
              }}
              className="h-11 w-full rounded-xl border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Виїзд</span>
            <input
              type="date"
              min={dateFrom || todayIso}
              max={maxDateIso}
              value={dateTo}
              onChange={(event) => {
                onDateToChange(event.target.value);
                setFormError(null);
                setCreatedBookingId(null);
              }}
              className="h-11 w-full rounded-xl border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>

        <div className="mt-3 space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Гості</span>
          <div className="flex items-center rounded-xl border border-slate-300 px-2 py-1">
            <button
              type="button"
              onClick={() => handleGuestsChange(guests - 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100"
              aria-label="Зменшити кількість гостей"
            >
              -
            </button>
            <input
              type="number"
              min={1}
              max={maxGuests}
              value={guests}
              onChange={(event) => handleGuestsChange(Number(event.target.value))}
              className="h-9 w-full border-0 bg-transparent text-center font-semibold text-slate-900 outline-none"
            />
            <button
              type="button"
              onClick={() => handleGuestsChange(guests + 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100"
              aria-label="Збільшити кількість гостей"
            >
              +
            </button>
          </div>
          <p className="text-xs text-slate-500">Максимум гостей: {maxGuests}</p>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-100 p-4">
          <div className="flex items-center justify-between text-sm text-slate-700">
            <span>{nights} ночей</span>
            <strong>{formatPropertyPrice(estimatedTotal, currency)}</strong>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-slate-700">
            <span>Статус</span>
            <strong className={createdBookingId ? 'text-amber-700' : 'text-emerald-700'}>
              {createdBookingId ? 'В обробці' : 'Готово до відправки запиту'}
            </strong>
          </div>
        </div>

        {validationError ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">{validationError}</p>
        ) : null}
        {formError ? (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{formError}</p>
        ) : null}

        {createdBookingId ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <p className="font-semibold">Запит на бронювання #{createdBookingId} відправлено.</p>
            <p className="mt-1">Після підтвердження власником ви зможете оплатити бронювання у профілі.</p>
            <Link
              to={`${ROUTES.profile}?section=bookings-my`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
            >
              Перейти до моїх бронювань
            </Link>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleBook}
          disabled={isBookingDisabled}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <CalendarDays size={16} />
          {createBookingMutation.isPending ? 'Відправляю запит...' : 'Надіслати запит на бронювання'}
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Власник</p>
        {ownerLoading ? (
          <div className="mt-3 h-16 animate-pulse rounded-xl bg-slate-200" />
        ) : (
          <div className="mt-3 flex items-center gap-3">
            {owner?.avatarUrl ? (
              <img src={owner.avatarUrl} alt={ownerName} className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                {ownerInitial}
              </span>
            )}
            <div>
              <Link
                to={ROUTES.publicProfile(property.hostId)}
                className="font-bold text-slate-900 transition hover:text-blue-700 hover:underline"
              >
                {ownerName}
              </Link>
              <p className="text-sm text-slate-500">На платформі з {formatPropertyCreatedAt(owner?.createdAt)}</p>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={onContactHost}
            disabled={disableContactHost}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <MessageCircle size={16} />
            {disableContactHost ? 'Це ваше оголошення' : 'Написати власнику'}
          </button>
          <button
            type="button"
            onClick={onShowPhone}
            disabled={!ownerPhone}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            <Phone size={16} />
            {ownerPhone ? (isPhoneVisible ? ownerPhone : 'Показати телефон') : 'Телефон не вказано'}
          </button>
        </div>
      </section>
    </aside>
  );
};
