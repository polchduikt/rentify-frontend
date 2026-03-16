import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/paymentService';
import { queryKeys } from '@/api/queryKeys';

export const useMyPaymentsQuery = () =>
  useQuery({
    queryKey: queryKeys.payments.mine(),
    queryFn: () => paymentService.getMyPayments(),
  });

export const usePaymentsByBookingQuery = (bookingId: number, enabled = true) =>
  useQuery({
    queryKey: queryKeys.payments.byBooking(bookingId),
    queryFn: () => paymentService.getPaymentsByBooking(bookingId),
    enabled: enabled && Number.isFinite(bookingId) && bookingId > 0,
  });

export const useMockPayBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: number) => paymentService.mockPayBooking(bookingId),
    onSuccess: (_, bookingId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.mine() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.byBooking(bookingId) });
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};
