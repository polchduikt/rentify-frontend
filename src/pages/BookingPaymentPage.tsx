import { ArrowLeft, CalendarDays, CheckCircle2, CreditCard, LoaderCircle, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_STYLES,
  FALLBACK_PROPERTY_IMAGE,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_STYLES,
} from '@/constants/bookingUi';
import { ROUTES } from '@/config/routes';
import { useBookingPaymentPage } from '@/hooks';
import {
  formatBookingPaymentDate,
  formatBookingPaymentDateTime,
  formatBookingPaymentMoney,
} from '@/utils/bookingPayment';
import { formatLocalTime } from '@/utils/time';

const BookingPaymentPage = () => {
  const model = useBookingPaymentPage();

  if (!model.isValidBookingId) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">Некоректний ID бронювання.</div>
      </div>
    );
  }

  if (model.isInitialLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-64 animate-pulse rounded-3xl bg-slate-200" />
      </div>
    );
  }

  if (model.bookingError || !model.booking) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{model.bookingError}</div>
      </div>
    );
  }

  const booking = model.booking;
  const property = model.property;
  const latestPayment = model.latestPayment;

  return (
    <div className="bg-slate-50 pb-12">
      <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
        <Link
          to={property ? ROUTES.propertyDetails(property.id) : ROUTES.search}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Повернутися до оголошення
        </Link>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-4">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-black text-slate-900">Бронювання #{booking.id}</h1>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    BOOKING_STATUS_STYLES[booking.status] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                </span>
              </div>

              {model.requiresHostConfirmation ? (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Запит на бронювання відправлено. Оплата доступна після підтвердження орендодавцем.
                </p>
              ) : null}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Період</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatBookingPaymentDate(booking.dateFrom)} - {formatBookingPaymentDate(booking.dateTo)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Гості</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{booking.guests}</p>
                </div>
              </div>

              {property ? (
                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                  <img src={property.photos?.[0]?.url || FALLBACK_PROPERTY_IMAGE} alt={property.title} className="h-52 w-full object-cover" />
                  <div className="space-y-2 p-4">
                    <p className="text-lg font-bold text-slate-900">{property.title}</p>
                    <p className="text-sm text-slate-600">
                      <MapPin size={14} className="mr-1 inline-block text-slate-400" />
                      {model.propertyAddress || 'Адресу не вказано'}
                    </p>
                    <p className="text-sm text-slate-500">
                      <Users size={14} className="mr-1 inline-block text-slate-400" />
                      до {property.maxGuests || booking.guests} гостей
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="rounded-full bg-slate-100 px-2 py-1">{property.propertyType}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        {property.rooms || 0} кімн. • {property.areaSqm || 0} м²
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        Заїзд {formatLocalTime(property.checkInTime)} / Виїзд {formatLocalTime(property.checkOutTime)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </article>

            {!model.hasPaidPayment ? (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-900">Історія платежів</h2>
                  {model.paymentsLoading ? <LoaderCircle size={16} className="animate-spin text-slate-400" /> : null}
                </div>

                {model.paymentsError ? (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{model.paymentsError}</p>
                ) : model.payments.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">Платежів ще немає.</p>
                ) : (
                  <div className="space-y-2">
                    {model.payments.map((payment) => (
                      <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-100 px-3 py-2.5">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatBookingPaymentMoney(Number(payment.amount || 0), payment.currency || model.currency)}
                          </p>
                          <p className="text-xs text-slate-500">{formatBookingPaymentDateTime(payment.createdAt)}</p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            PAYMENT_STATUS_STYLES[payment.status] || 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {PAYMENT_STATUS_LABELS[payment.status] || payment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ) : null}
          </section>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">До оплати</p>
              <p className="mt-2 text-4xl font-black text-slate-900">
                {formatBookingPaymentMoney(model.totalPrice, model.currency)}
              </p>

              <div className="mt-5 space-y-2 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={14} />
                    {model.nights} ночей
                  </span>
                  <strong>{formatBookingPaymentMoney(model.totalPrice, model.currency)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Статус бронювання</span>
                  <strong>{BOOKING_STATUS_LABELS[booking.status] || booking.status}</strong>
                </div>
                {latestPayment ? (
                  <div className="flex items-center justify-between">
                    <span>Статус платежу</span>
                    <strong>{PAYMENT_STATUS_LABELS[latestPayment.status] || latestPayment.status}</strong>
                  </div>
                ) : null}
              </div>

              {model.notice ? (
                <p
                  className={`mt-4 rounded-xl border px-3 py-2 text-sm ${
                    model.notice.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
                  }`}
                >
                  {model.notice.message}
                </p>
              ) : null}

              {!model.hasPaidPayment ? (
                <button
                  type="button"
                  onClick={model.payBooking}
                  disabled={!model.canPay}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {model.payPending ? <LoaderCircle size={16} className="animate-spin" /> : <CreditCard size={16} />}
                  {model.requiresHostConfirmation ? 'Очікує підтвердження' : model.payPending ? 'Проведення оплати...' : 'Оплатити зараз'}
                </button>
              ) : (
                <Link
                  to={`${ROUTES.profile}?section=bookings-my`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <CheckCircle2 size={16} />
                  Перейти до моїх бронювань
                </Link>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BookingPaymentPage;

