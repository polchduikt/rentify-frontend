import { LoaderCircle } from 'lucide-react';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_STYLES, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_STYLES } from '@/constants/bookingUi';
import type { BookingStatus, PaymentStatus } from '@/types/enums';
import type { BookingCardProps } from '../BookingsSection.types';
import { formatDate, formatDateTime, formatMoney } from '@/utils/profileFormatters';
import { BookingDetailsBlock } from './BookingDetailsBlock';

const renderBookingStatus = (status: BookingStatus) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${BOOKING_STATUS_STYLES[status]}`}>{BOOKING_STATUS_LABELS[status]}</span>
);

const renderPaymentStatus = (status?: PaymentStatus) =>
  status ? (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PAYMENT_STATUS_STYLES[status]}`}>{PAYMENT_STATUS_LABELS[status]}</span>
  ) : null;

export const BookingCard = ({
  booking,
  paymentStatusFallback,
  paymentStatusLoading = false,
  actions,
  viewMode,
}: BookingCardProps) => {
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
