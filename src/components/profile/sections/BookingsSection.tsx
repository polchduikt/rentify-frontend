import { CalendarDays, CreditCard, LoaderCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useBookingsSectionModel } from '@/hooks/profile';
import type { BookingsSectionProps } from './BookingsSection.types';
import { BookingCard } from './bookings/BookingCard';
import { TabButton } from './bookings/TabButton';

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
  const {
    tenantTab,
    setTenantTab,
    hostTab,
    setHostTab,
    tenantTabCounts,
    hostTabCounts,
    filteredMyBookings,
    filteredIncomingBookings,
    myBookingPaymentStatusById,
    myBookingPaymentLoadingById,
    incomingBookingPaymentStatusById,
    incomingBookingPaymentLoadingById,
  } = useBookingsSectionModel({
    myBookings,
    incomingBookings,
    paymentStatusByBookingId,
  });

  const showMyBookings = mode === 'bookings-my';

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{showMyBookings ? 'Мої бронювання' : 'Бронювання моїх оголошень'}</h2>
          <p className="text-sm text-slate-600">
            {showMyBookings
              ? "Повна інформація по об'єкту, статусах і оплаті."
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
