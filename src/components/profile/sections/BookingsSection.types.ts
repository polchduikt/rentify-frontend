import type { ReactNode } from 'react';
import type { BookingDto } from '@/types/booking';
import type { PaymentStatus } from '@/types/enums';
import type { ProfileBookingsSection, SectionNotice } from '@/types/profile';

export type BookingAction = 'confirm' | 'reject' | 'cancel';
export type TenantTab = 'all' | 'paid' | 'awaiting' | 'cancelled';
export type HostTab = 'all' | 'new' | 'confirmed' | 'closed';
export type ViewMode = 'my' | 'incoming';
export type ParticipantType = 'host' | 'tenant';

export interface BookingsSectionProps {
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

export interface TabButtonProps {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}

export interface ParticipantCardProps {
  booking: BookingDto;
  participantType: ParticipantType;
  propertyId: number;
  hostId?: number;
}

export interface BookingCardProps {
  booking: BookingDto;
  paymentStatusFallback?: PaymentStatus;
  paymentStatusLoading?: boolean;
  actions: (paymentStatus?: PaymentStatus) => ReactNode;
  viewMode: ViewMode;
}
