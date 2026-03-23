import { useMemo, useState } from 'react';
import { useBookingPaymentStatuses } from '@/hooks/profile/useBookingPaymentStatuses';
import type { BookingDto } from '@/types/booking';
import type { PaymentStatus } from '@/types/enums';
import type { HostTab, TenantTab } from '@/components/profile/sections/BookingsSection.types';

interface UseBookingsSectionModelParams {
  myBookings: BookingDto[];
  incomingBookings: BookingDto[];
  paymentStatusByBookingId: Partial<Record<number, PaymentStatus>>;
}

const toTimestampOrZero = (value: string | null | undefined): number => {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 0;
};

export const useBookingsSectionModel = ({
  myBookings,
  incomingBookings,
  paymentStatusByBookingId,
}: UseBookingsSectionModelParams) => {
  const [tenantTab, setTenantTab] = useState<TenantTab>('all');
  const [hostTab, setHostTab] = useState<HostTab>('all');

  const sortedMyBookings = useMemo(
    () =>
      [...myBookings].sort((a, b) => {
        const left = toTimestampOrZero(a.createdAt);
        const right = toTimestampOrZero(b.createdAt);
        return right - left;
      }),
    [myBookings],
  );

  const sortedIncomingBookings = useMemo(
    () =>
      [...incomingBookings].sort((a, b) => {
        const left = toTimestampOrZero(a.createdAt);
        const right = toTimestampOrZero(b.createdAt);
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

  return {
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
  };
};
