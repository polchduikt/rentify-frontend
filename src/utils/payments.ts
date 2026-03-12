import type { PaymentStatus } from '@/types/enums';
import type { PaymentResponseDto } from '@/types/payment';

export const toTimestamp = (value?: string): number => {
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export const getPaymentTimestamp = (payment: PaymentResponseDto): number =>
  Math.max(toTimestamp(payment.updatedAt), toTimestamp(payment.createdAt));

export const getLatestPayment = (payments?: PaymentResponseDto[]): PaymentResponseDto | null => {
  if (!payments || payments.length === 0) {
    return null;
  }

  let latestPayment = payments[0];

  for (let index = 1; index < payments.length; index += 1) {
    const currentPayment = payments[index];
    const currentTimestamp = getPaymentTimestamp(currentPayment);
    const latestTimestamp = getPaymentTimestamp(latestPayment);

    if (currentTimestamp > latestTimestamp || (currentTimestamp === latestTimestamp && currentPayment.id > latestPayment.id)) {
      latestPayment = currentPayment;
    }
  }

  return latestPayment;
};

export const getLatestPaymentStatus = (payments?: PaymentResponseDto[]): PaymentStatus | undefined =>
  getLatestPayment(payments)?.status;

export const buildLatestPaymentStatusByBookingId = (
  payments: PaymentResponseDto[],
): Partial<Record<number, PaymentStatus>> => {
  const latestPaymentByBooking: Record<number, PaymentResponseDto> = {};

  for (const payment of payments) {
    const existing = latestPaymentByBooking[payment.bookingId];
    if (!existing) {
      latestPaymentByBooking[payment.bookingId] = payment;
      continue;
    }

    const paymentTimestamp = getPaymentTimestamp(payment);
    const existingTimestamp = getPaymentTimestamp(existing);

    if (paymentTimestamp > existingTimestamp || (paymentTimestamp === existingTimestamp && payment.id > existing.id)) {
      latestPaymentByBooking[payment.bookingId] = payment;
    }
  }

  const statusByBookingId: Partial<Record<number, PaymentStatus>> = {};

  for (const [bookingId, payment] of Object.entries(latestPaymentByBooking)) {
    statusByBookingId[Number(bookingId)] = payment.status;
  }

  return statusByBookingId;
};
