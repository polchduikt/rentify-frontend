import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBookingByIdQuery, useMockPayBookingMutation, usePaymentsByBookingQuery, usePropertyByIdQuery } from '@/hooks/api';
import { diffNights } from '@/utils/bookingDates';
import { getApiErrorMessage } from '@/utils/errors';
import { getLatestPayment } from '@/utils/payments';

type Notice = { type: 'success' | 'error'; message: string } | null;

export const useBookingPaymentPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const numericBookingId = Number(bookingId);
  const isValidBookingId = Number.isFinite(numericBookingId) && numericBookingId > 0;

  const bookingQuery = useBookingByIdQuery(numericBookingId, isValidBookingId);
  const booking = bookingQuery.data ?? null;

  const paymentsQuery = usePaymentsByBookingQuery(numericBookingId, isValidBookingId);
  const payments = paymentsQuery.data ?? [];
  const latestPayment = useMemo(() => getLatestPayment(payments), [payments]);

  const propertyQuery = usePropertyByIdQuery(booking?.propertyId ?? 0, Boolean(booking?.propertyId));
  const property = propertyQuery.data ?? null;

  const bookingSummary = useMemo(() => {
    const currency = property?.pricing?.currency || 'UAH';
    const totalPrice = Number(booking?.totalPrice || 0);
    const nights = booking ? diffNights(booking.dateFrom, booking.dateTo) : 0;
    const propertyAddress = [
      property?.address?.city,
      property?.address?.region,
      property?.address?.street ? `вул. ${property.address.street}` : null,
      property?.address?.houseNumber ? `буд. ${property.address.houseNumber}` : null,
      property?.address?.apartment ? `кв. ${property.address.apartment}` : null,
    ]
      .filter(Boolean)
      .join(', ');

    return {
      currency,
      totalPrice,
      nights,
      propertyAddress,
    };
  }, [
    booking?.dateFrom,
    booking?.dateTo,
    booking?.totalPrice,
    property?.address?.apartment,
    property?.address?.houseNumber,
    property?.address?.city,
    property?.address?.region,
    property?.address?.street,
    property?.pricing?.currency,
  ]);

  const payMutation = useMockPayBookingMutation();
  const [notice, setNotice] = useState<Notice>(null);

  const hasPaidPayment = latestPayment?.status === 'PAID';
  const canPay = booking != null && !hasPaidPayment && booking.status === 'CONFIRMED' && !payMutation.isPending;
  const requiresHostConfirmation = booking != null && booking.status === 'CREATED' && !hasPaidPayment;

  const payBooking = async () => {
    if (!booking) {
      return;
    }

    setNotice(null);

    try {
      await payMutation.mutateAsync(booking.id);
      setNotice({
        type: 'success',
        message: 'Оплату проведено успішно.',
      });
    } catch (error) {
      setNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'Не вдалося провести оплату. Спробуйте ще раз.'),
      });
    }
  };

  return {
    numericBookingId,
    isValidBookingId,
    booking,
    property,
    currency: bookingSummary.currency,
    totalPrice: bookingSummary.totalPrice,
    nights: bookingSummary.nights,
    propertyAddress: bookingSummary.propertyAddress,
    payments,
    latestPayment,
    hasPaidPayment,
    canPay,
    requiresHostConfirmation,
    notice,
    isInitialLoading: bookingQuery.isLoading,
    bookingError: bookingQuery.error ? getApiErrorMessage(bookingQuery.error, 'Не вдалося завантажити бронювання.') : null,
    paymentsLoading: paymentsQuery.isLoading,
    paymentsError: paymentsQuery.error ? getApiErrorMessage(paymentsQuery.error, 'Не вдалося завантажити платежі.') : null,
    propertyLoading: propertyQuery.isLoading,
    payPending: payMutation.isPending,
    payBooking,
  };
};

export type BookingPaymentPageModel = ReturnType<typeof useBookingPaymentPage>;

