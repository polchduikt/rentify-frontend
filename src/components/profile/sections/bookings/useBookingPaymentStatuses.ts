import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { queryKeys } from '@/hooks/api/queryKeys';
import { paymentService } from '@/services/paymentService';
import type { BookingDto } from '@/types/booking';
import type { PaymentStatus } from '@/types/enums';
import { getLatestPaymentStatus } from '@/utils/payments';

interface UseBookingPaymentStatusesParams {
  bookings: BookingDto[];
  fallbackStatusByBookingId: Partial<Record<number, PaymentStatus>>;
}

export const useBookingPaymentStatuses = ({
  bookings,
  fallbackStatusByBookingId,
}: UseBookingPaymentStatusesParams) => {
  const paymentQueries = useQueries({
    queries: bookings.map((booking) => ({
      queryKey: queryKeys.payments.byBooking(booking.id),
      queryFn: () => paymentService.getPaymentsByBooking(booking.id),
      enabled: booking.id > 0,
    })),
  });

  const paymentStatusByBookingId = useMemo(() => {
    const statusByBookingId: Partial<Record<number, PaymentStatus>> = {};

    bookings.forEach((booking, index) => {
      const resolvedStatus = getLatestPaymentStatus(paymentQueries[index]?.data) ?? fallbackStatusByBookingId[booking.id];
      if (resolvedStatus) {
        statusByBookingId[booking.id] = resolvedStatus;
      }
    });

    return statusByBookingId;
  }, [bookings, fallbackStatusByBookingId, paymentQueries]);

  const paymentLoadingByBookingId = useMemo(() => {
    const loadingByBookingId: Record<number, boolean> = {};

    bookings.forEach((booking, index) => {
      const query = paymentQueries[index];
      loadingByBookingId[booking.id] = Boolean(query?.isLoading || query?.isFetching);
    });

    return loadingByBookingId;
  }, [bookings, paymentQueries]);

  return {
    paymentStatusByBookingId,
    paymentLoadingByBookingId,
  };
};
