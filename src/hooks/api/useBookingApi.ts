import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/services/bookingService';
import type { PageQuery } from '@/types/api';
import type { BookingRequestDto } from '@/types/booking';
import { queryKeys } from '@/api/queryKeys';

export const useMyBookingsQuery = (page?: PageQuery, enabled = true) =>
  useQuery({
    queryKey: queryKeys.bookings.my(page),
    queryFn: () => bookingService.getMyBookings(page),
    enabled,
  });

export const useIncomingBookingsQuery = (page?: PageQuery) =>
  useQuery({
    queryKey: queryKeys.bookings.incoming(page),
    queryFn: () => bookingService.getIncomingBookings(page),
  });

export const useBookingByIdQuery = (id: number, enabled = true) =>
  useQuery({
    queryKey: queryKeys.bookings.byId(id),
    queryFn: () => bookingService.getBookingById(id),
    enabled: enabled && Number.isFinite(id) && id > 0,
  });

export const useCreateBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BookingRequestDto) => bookingService.createBooking(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

const useBookingStatusMutation = (action: (id: number) => Promise<unknown>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => action(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.byId(id) });
    },
  });
};

export const useCancelBookingMutation = () => useBookingStatusMutation(bookingService.cancelBooking);
export const useConfirmBookingMutation = () => useBookingStatusMutation(bookingService.confirmBooking);
export const useRejectBookingMutation = () => useBookingStatusMutation(bookingService.rejectBooking);
