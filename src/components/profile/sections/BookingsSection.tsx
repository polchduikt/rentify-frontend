import { useMemo, useState, type ReactNode } from 'react';
import { CalendarDays, Clock3, CreditCard, LoaderCircle, MapPin, MessageCircle, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_STYLES,
  FALLBACK_PROPERTY_IMAGE,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_STYLES,
} from '@/constants/bookingUi';
import { ROUTES } from '@/config/routes';
import {
  useMyConversationsQuery,
  usePropertyByIdQuery,
  usePublicProfileQuery,
  useReplyToConversationMutation,
  useSendMessageToPropertyMutation,
} from '@/hooks/api';
import type { BookingDto } from '@/types/booking';
import type { BookingStatus, PaymentStatus } from '@/types/enums';
import type { PropertyResponseDto } from '@/types/property';
import type { ProfileBookingsSection, SectionNotice } from '@/types/profile';
import { resolveAvatarUrl } from '@/utils/avatar';
import { getApiErrorMessage } from '@/utils/errors';
import { formatLocalTime } from '@/utils/time';
import { useBookingPaymentStatuses } from './bookings/useBookingPaymentStatuses';
import { formatDate, formatDateTime, formatMoney } from '../formatters';

type TenantTab = 'all' | 'paid' | 'awaiting' | 'cancelled';
type HostTab = 'all' | 'new' | 'confirmed' | 'closed';
type BookingAction = 'cancel' | 'confirm' | 'reject';
type ViewMode = 'my' | 'incoming';
type ParticipantType = 'host' | 'tenant';

interface BookingsSectionProps {
  mode: ProfileBookingsSection;
  myBookings: BookingDto[];
  incomingBookings: BookingDto[];
  myBookingsCount: number;
  incomingBookingsCount: number;
  paymentStatusByBookingId: Partial<Record<number, PaymentStatus>>;
  myBookingsLoading: boolean;
  incomingBookingsLoading: boolean;
  myBookingsError: string | null;
  incomingBookingsError: string | null;
  paymentsForBookingsError: string | null;
  bookingsNotice: SectionNotice;
  isActionPending: (bookingId: number, action: BookingAction) => boolean;
  onCancelBooking: (bookingId: number) => Promise<void>;
  onConfirmIncomingBooking: (bookingId: number) => Promise<void>;
  onRejectIncomingBooking: (bookingId: number) => Promise<void>;
}

interface TabButtonProps {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}

const TabButton = ({ active, label, count, onClick }: TabButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
      active ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
    }`}
  >
    <span>{label}</span>
    <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px] text-slate-600">{count}</span>
  </button>
);

const renderBookingStatus = (status: BookingStatus) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${BOOKING_STATUS_STYLES[status]}`}>{BOOKING_STATUS_LABELS[status]}</span>
);

const renderPaymentStatus = (status?: PaymentStatus) =>
  status ? (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PAYMENT_STATUS_STYLES[status]}`}>{PAYMENT_STATUS_LABELS[status]}</span>
  ) : null;

const toFiniteNumber = (value: unknown): number | null => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const buildPropertyAddress = (property?: PropertyResponseDto): { primary: string; secondary: string; fullText: string } => {
  const location = property?.address?.location;
  const primary = [location?.city, location?.region].filter(Boolean).join(', ') || 'Локацію не вказано';

  const details: string[] = [];
  if (property?.address?.street) details.push(`вул. ${property.address.street}`);
  if (property?.address?.houseNumber) details.push(`буд. ${property.address.houseNumber}`);
  if (property?.address?.apartment) details.push(`кв. ${property.address.apartment}`);
  if (property?.address?.districtName) details.push(`район: ${property.address.districtName}`);
  if (property?.address?.metroStationName) details.push(`метро: ${property.address.metroStationName}`);
  if (property?.address?.residentialComplexName) details.push(`ЖК: ${property.address.residentialComplexName}`);

  const secondary = details.join(' • ') || 'Без детальної адреси';
  const fullText = [primary, details.length > 0 ? secondary : null].filter(Boolean).join(', ');
  return { primary, secondary, fullText };
};

const getPropertyMapUrl = (property?: PropertyResponseDto): string | null => {
  const lat = toFiniteNumber(property?.address?.lat);
  const lng = toFiniteNumber(property?.address?.lng);
  if (lat != null && lng != null) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  const fallbackAddress = buildPropertyAddress(property).fullText;
  return fallbackAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackAddress)}` : null;
};

const resolveParticipantName = (firstName?: string, lastName?: string) => {
  const full = [firstName, lastName].filter(Boolean).join(' ').trim();
  return full || 'Користувач';
};

const resolveParticipantInitial = (firstName?: string, lastName?: string) => {
  const initial = `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
  return initial || firstName?.charAt(0)?.toUpperCase() || 'U';
};

const ParticipantCard = ({
  booking,
  participantType,
  propertyId,
  hostId,
}: {
  booking: BookingDto;
  participantType: ParticipantType;
  propertyId: number;
  hostId?: number;
}) => {
  const participantId = participantType === 'tenant' ? booking.tenantId : Number(hostId || 0);
  const profileQuery = usePublicProfileQuery(participantId, participantId > 0);
  const conversationsQuery = useMyConversationsQuery();
  const sendToPropertyMutation = useSendMessageToPropertyMutation();
  const replyMutation = useReplyToConversationMutation();
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const existingConversation = useMemo(
    () =>
      conversationsQuery.data?.find(
        (conversation) => conversation.propertyId === propertyId && conversation.tenantId === booking.tenantId,
      ),
    [booking.tenantId, conversationsQuery.data, propertyId],
  );

  const canSendMessage = participantType === 'host' || Boolean(existingConversation);
  const isSending = sendToPropertyMutation.isPending || replyMutation.isPending;

  const sendMessage = async () => {
    setNotice(null);
    const templateText =
      participantType === 'host'
        ? `Доброго дня! Пишу щодо бронювання #${booking.id}.`
        : `Доброго дня! Пишу вам щодо бронювання #${booking.id}.`;

    try {
      if (participantType === 'host') {
        await sendToPropertyMutation.mutateAsync({
          propertyId,
          payload: { text: templateText },
        });
      } else {
        if (!existingConversation) {
          setNotice({
            type: 'error',
            message: 'Орендар ще не створив діалог по цьому оголошенню.',
          });
          return;
        }
        await replyMutation.mutateAsync({
          conversationId: existingConversation.id,
          payload: { text: templateText },
        });
      }

      setNotice({ type: 'success', message: 'Повідомлення надіслано.' });
    } catch (error) {
      setNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'Не вдалося надіслати повідомлення.'),
      });
    }
  };

  const participantLabel = participantType === 'tenant' ? 'Орендар' : 'Власник';
  const participant = profileQuery.data;
  const participantName = resolveParticipantName(participant?.firstName, participant?.lastName);
  const participantInitial = resolveParticipantInitial(participant?.firstName, participant?.lastName);
  const avatarSrc = resolveAvatarUrl(participant?.avatarUrl);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{participantLabel}</p>

      {profileQuery.isLoading ? (
        <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
      ) : participant ? (
        <div className="flex items-center gap-3">
          {avatarSrc ? (
            <img src={avatarSrc} alt={participantName} className="h-11 w-11 rounded-full border border-slate-200 object-cover" />
          ) : (
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {participantInitial}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{participantName}</p>
            <p className="text-xs text-slate-500">На платформі з {formatDate(participant.createdAt)}</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500">Не вдалося завантажити дані користувача.</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canSendMessage || isSending}
          onClick={() => void sendMessage()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSending ? <LoaderCircle size={12} className="animate-spin" /> : <MessageCircle size={12} />}
          Зв'язатися
        </button>
        <Link
          to={`${ROUTES.profile}?section=chat`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          Відкрити чат
        </Link>
      </div>

      {participantType === 'tenant' && !existingConversation ? (
        <p className="mt-2 text-[11px] text-slate-500">Хост може писати тільки в існуючому діалозі.</p>
      ) : null}

      {notice ? (
        <p
          className={`mt-2 rounded-lg border px-2 py-1 text-[11px] ${
            notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {notice.message}
        </p>
      ) : null}
    </div>
  );
};

const BookingDetailsBlock = ({ booking, viewMode }: { booking: BookingDto; viewMode: ViewMode }) => {
  const propertyQuery = usePropertyByIdQuery(booking.propertyId);
  const property = propertyQuery.data;
  const address = buildPropertyAddress(property);
  const mapUrl = getPropertyMapUrl(property);
  const hasCoords = toFiniteNumber(property?.address?.lat) != null && toFiniteNumber(property?.address?.lng) != null;

  if (propertyQuery.isLoading) {
    return <div className="h-36 animate-pulse rounded-xl bg-slate-100" />;
  }

  if (propertyQuery.error || !property) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-sm font-semibold text-slate-900">Оголошення #{booking.propertyId}</p>
        <p className="mt-1 text-xs text-slate-500">Не вдалося завантажити деталі оголошення.</p>
        <Link to={ROUTES.propertyDetails(booking.propertyId)} className="mt-2 inline-flex text-xs font-semibold text-blue-700 hover:underline">
          Відкрити оголошення
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="grid gap-3 md:grid-cols-[150px_minmax(0,1fr)]">
        <img
          src={property.photos?.[0]?.url || FALLBACK_PROPERTY_IMAGE}
          alt={property.title}
          className="h-28 w-full rounded-lg object-cover md:h-full"
        />

        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-bold text-slate-900">{property.title}</p>
          <p className="mt-1 text-xs font-semibold text-slate-700">{address.primary}</p>
          <p className="mt-1 text-xs text-slate-500">{address.secondary}</p>
          {hasCoords ? (
            <p className="mt-1 text-[11px] text-slate-400">
              Координати: {property.address.lat}, {property.address.lng}
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1">
              <Users size={12} />
              до {property.maxGuests || booking.guests} гостей
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={12} />
              {formatLocalTime(property.checkInTime)} / {formatLocalTime(property.checkOutTime)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          to={ROUTES.propertyDetails(booking.propertyId)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          <MapPin size={12} />
          Деталі оголошення
        </Link>
        {mapUrl ? (
          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            <MapPin size={12} />
            Показати на карті
          </a>
        ) : null}
      </div>

      <ParticipantCard
        booking={booking}
        participantType={viewMode === 'my' ? 'host' : 'tenant'}
        propertyId={booking.propertyId}
        hostId={property.hostId}
      />
    </div>
  );
};

const BookingCard = ({
  booking,
  paymentStatusFallback,
  paymentStatusLoading = false,
  actions,
  viewMode,
}: {
  booking: BookingDto;
  paymentStatusFallback?: PaymentStatus;
  paymentStatusLoading?: boolean;
  actions: (paymentStatus?: PaymentStatus) => ReactNode;
  viewMode: ViewMode;
}) => {
  const paymentStatus = paymentStatusFallback;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-base font-bold text-slate-900">Бронювання #{booking.id}</h4>
          {renderBookingStatus(booking.status)}
          {renderPaymentStatus(paymentStatus)}
          {paymentStatusLoading ? <LoaderCircle size={12} className="animate-spin text-slate-400" /> : null}
        </div>
        <p className="text-xs text-slate-500">{formatDateTime(booking.createdAt)}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-slate-100 p-3">
          <p className="text-xs text-slate-500">Період</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {formatDate(booking.dateFrom)} - {formatDate(booking.dateTo)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-100 p-3">
          <p className="text-xs text-slate-500">Гості</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{booking.guests}</p>
        </div>
        <div className="rounded-xl bg-slate-100 p-3">
          <p className="text-xs text-slate-500">Сума</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{formatMoney(Number(booking.totalPrice || 0), 'UAH')}</p>
        </div>
      </div>

      <div className="mt-3">
        <BookingDetailsBlock booking={booking} viewMode={viewMode} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">{actions(paymentStatus)}</div>
    </article>
  );
};

export const BookingsSection = ({
  mode,
  myBookings,
  incomingBookings,
  myBookingsCount,
  incomingBookingsCount,
  paymentStatusByBookingId,
  myBookingsLoading,
  incomingBookingsLoading,
  myBookingsError,
  incomingBookingsError,
  paymentsForBookingsError,
  bookingsNotice,
  isActionPending,
  onCancelBooking,
  onConfirmIncomingBooking,
  onRejectIncomingBooking,
}: BookingsSectionProps) => {
  const [tenantTab, setTenantTab] = useState<TenantTab>('all');
  const [hostTab, setHostTab] = useState<HostTab>('all');

  const sortedMyBookings = useMemo(
    () =>
      [...myBookings].sort((a, b) => {
        const left = new Date(a.createdAt).getTime();
        const right = new Date(b.createdAt).getTime();
        return right - left;
      }),
    [myBookings],
  );

  const sortedIncomingBookings = useMemo(
    () =>
      [...incomingBookings].sort((a, b) => {
        const left = new Date(a.createdAt).getTime();
        const right = new Date(b.createdAt).getTime();
        return right - left;
      }),
    [incomingBookings],
  );

  const {
    paymentStatusByBookingId: myBookingPaymentStatusById,
    paymentLoadingByBookingId: myBookingPaymentLoadingById,
  } = useBookingPaymentStatuses({
    bookings: sortedMyBookings,
    fallbackStatusByBookingId: paymentStatusByBookingId,
  });

  const {
    paymentStatusByBookingId: incomingBookingPaymentStatusById,
    paymentLoadingByBookingId: incomingBookingPaymentLoadingById,
  } = useBookingPaymentStatuses({
    bookings: sortedIncomingBookings,
    fallbackStatusByBookingId: paymentStatusByBookingId,
  });

  const tenantTabCounts = useMemo(() => {
    const paid = sortedMyBookings.filter((booking) => myBookingPaymentStatusById[booking.id] === 'PAID').length;
    const awaiting = sortedMyBookings.filter((booking) => booking.status === 'CREATED' || booking.status === 'CONFIRMED').length;
    const cancelled = sortedMyBookings.filter((booking) => booking.status === 'CANCELLED' || booking.status === 'REJECTED').length;
    return { all: sortedMyBookings.length, paid, awaiting, cancelled };
  }, [myBookingPaymentStatusById, sortedMyBookings]);

  const hostTabCounts = useMemo(() => {
    const fresh = sortedIncomingBookings.filter((booking) => booking.status === 'CREATED').length;
    const confirmed = sortedIncomingBookings.filter((booking) => booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS').length;
    const closed = sortedIncomingBookings.filter(
      (booking) => booking.status === 'COMPLETED' || booking.status === 'CANCELLED' || booking.status === 'REJECTED',
    ).length;
    return { all: sortedIncomingBookings.length, new: fresh, confirmed, closed };
  }, [sortedIncomingBookings]);

  const filteredMyBookings = useMemo(() => {
    if (tenantTab === 'all') return sortedMyBookings;
    if (tenantTab === 'paid') return sortedMyBookings.filter((booking) => myBookingPaymentStatusById[booking.id] === 'PAID');
    if (tenantTab === 'awaiting') return sortedMyBookings.filter((booking) => booking.status === 'CREATED' || booking.status === 'CONFIRMED');
    return sortedMyBookings.filter((booking) => booking.status === 'CANCELLED' || booking.status === 'REJECTED');
  }, [myBookingPaymentStatusById, sortedMyBookings, tenantTab]);

  const filteredIncomingBookings = useMemo(() => {
    if (hostTab === 'all') return sortedIncomingBookings;
    if (hostTab === 'new') return sortedIncomingBookings.filter((booking) => booking.status === 'CREATED');
    if (hostTab === 'confirmed') return sortedIncomingBookings.filter((booking) => booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS');
    return sortedIncomingBookings.filter(
      (booking) => booking.status === 'COMPLETED' || booking.status === 'CANCELLED' || booking.status === 'REJECTED',
    );
  }, [hostTab, sortedIncomingBookings]);

  const showMyBookings = mode === 'bookings-my';

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{showMyBookings ? 'Мої бронювання' : 'Бронювання моїх оголошень'}</h2>
          <p className="text-sm text-slate-600">
            {showMyBookings
              ? 'Повна інформація по обʼєкту, статусах і оплаті.'
              : 'Деталі заявок, статуси оплат і керування бронюваннями орендарів.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">Мої: {myBookingsCount}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">Вхідні: {incomingBookingsCount}</span>
        </div>
      </div>

      {bookingsNotice ? (
        <p
          className={`mb-4 rounded-xl border px-3 py-2 text-sm ${
            bookingsNotice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {bookingsNotice.message}
        </p>
      ) : null}

      {paymentsForBookingsError ? <p className="mb-4 text-sm text-rose-700">{paymentsForBookingsError}</p> : null}

      {showMyBookings ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <TabButton active={tenantTab === 'all'} label="Усі" count={tenantTabCounts.all} onClick={() => setTenantTab('all')} />
            <TabButton active={tenantTab === 'paid'} label="Оплачені" count={tenantTabCounts.paid} onClick={() => setTenantTab('paid')} />
            <TabButton active={tenantTab === 'awaiting'} label="В обробці" count={tenantTabCounts.awaiting} onClick={() => setTenantTab('awaiting')} />
            <TabButton active={tenantTab === 'cancelled'} label="Скасовані" count={tenantTabCounts.cancelled} onClick={() => setTenantTab('cancelled')} />
          </div>

          {myBookingsError ? (
            <p className="text-sm text-rose-700">{myBookingsError}</p>
          ) : myBookingsLoading ? (
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-600">
              <LoaderCircle size={15} className="animate-spin" />
              Завантаження бронювань...
            </div>
          ) : filteredMyBookings.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">Немає бронювань у вибраному фільтрі.</p>
          ) : (
            <div className="space-y-4">
              {filteredMyBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  paymentStatusFallback={myBookingPaymentStatusById[booking.id]}
                  paymentStatusLoading={myBookingPaymentLoadingById[booking.id]}
                  viewMode="my"
                  actions={(paymentStatus) => {
                    const isCancelledBooking = booking.status === 'CANCELLED' || booking.status === 'REJECTED';
                    const canCancel = booking.status === 'CREATED' || booking.status === 'CONFIRMED';
                    const canPay = booking.status === 'CONFIRMED' && paymentStatus !== 'PAID';
                    const paymentActionLabel =
                      paymentStatus === 'PAID' ? 'Оплачено' : isCancelledBooking ? 'Скасовано' : canPay ? 'Оплатити' : 'Очікує підтвердження';

                    return (
                      <>
                        <Link
                          to={ROUTES.bookingPayment(booking.id)}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white ${
                            paymentStatus === 'PAID'
                              ? 'bg-emerald-600 hover:bg-emerald-700'
                              : isCancelledBooking
                                ? 'bg-slate-500 hover:bg-slate-600'
                              : canPay
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-amber-600 hover:bg-amber-700'
                          }`}
                        >
                          <CreditCard size={14} />
                          {paymentActionLabel}
                        </Link>
                        {canCancel ? (
                          <button
                            type="button"
                            disabled={isActionPending(booking.id, 'cancel')}
                            onClick={() => void onCancelBooking(booking.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isActionPending(booking.id, 'cancel') ? <LoaderCircle size={14} className="animate-spin" /> : <CalendarDays size={14} />}
                            Скасувати бронювання
                          </button>
                        ) : null}
                      </>
                    );
                  }}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <TabButton active={hostTab === 'all'} label="Усі" count={hostTabCounts.all} onClick={() => setHostTab('all')} />
            <TabButton active={hostTab === 'new'} label="Нові" count={hostTabCounts.new} onClick={() => setHostTab('new')} />
            <TabButton
              active={hostTab === 'confirmed'}
              label="Підтверджені"
              count={hostTabCounts.confirmed}
              onClick={() => setHostTab('confirmed')}
            />
            <TabButton active={hostTab === 'closed'} label="Завершені" count={hostTabCounts.closed} onClick={() => setHostTab('closed')} />
          </div>

          {incomingBookingsError ? (
            <p className="text-sm text-rose-700">{incomingBookingsError}</p>
          ) : incomingBookingsLoading ? (
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-600">
              <LoaderCircle size={15} className="animate-spin" />
              Завантаження вхідних бронювань...
            </div>
          ) : filteredIncomingBookings.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">Поки немає заявок у вибраному фільтрі.</p>
          ) : (
            <div className="space-y-4">
              {filteredIncomingBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  paymentStatusFallback={incomingBookingPaymentStatusById[booking.id]}
                  paymentStatusLoading={incomingBookingPaymentLoadingById[booking.id]}
                  viewMode="incoming"
                  actions={() => {
                    const canConfirm = booking.status === 'CREATED';
                    const canReject = booking.status === 'CREATED';
                    const canHostCancel = booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS';

                    return (
                      <>
                        {canConfirm ? (
                          <button
                            type="button"
                            disabled={isActionPending(booking.id, 'confirm')}
                            onClick={() => void onConfirmIncomingBooking(booking.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            {isActionPending(booking.id, 'confirm') ? (
                              <LoaderCircle size={14} className="animate-spin" />
                            ) : (
                              <ShieldCheck size={14} />
                            )}
                            Підтвердити
                          </button>
                        ) : null}
                        {canReject ? (
                          <button
                            type="button"
                            disabled={isActionPending(booking.id, 'reject')}
                            onClick={() => void onRejectIncomingBooking(booking.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isActionPending(booking.id, 'reject') ? <LoaderCircle size={14} className="animate-spin" /> : <CalendarDays size={14} />}
                            Відхилити
                          </button>
                        ) : null}
                        {canHostCancel ? (
                          <button
                            type="button"
                            disabled={isActionPending(booking.id, 'cancel')}
                            onClick={() => void onCancelBooking(booking.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isActionPending(booking.id, 'cancel') ? <LoaderCircle size={14} className="animate-spin" /> : <CalendarDays size={14} />}
                            Скасувати і повернути кошти
                          </button>
                        ) : null}
                      </>
                    );
                  }}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  );
};
