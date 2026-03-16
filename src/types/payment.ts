import type { BookingStatus, PaymentStatus } from './enums';
import type { Decimal, ZonedDateTimeString } from './scalars';

export interface PaymentResponseDto {
  id: number;
  bookingId: number;
  amount: Decimal;
  currency: string;
  status: PaymentStatus;
  provider: string;
  providerPaymentId: string;
  bookingStatus: BookingStatus;
  createdAt: ZonedDateTimeString;
  updatedAt: ZonedDateTimeString;
}
