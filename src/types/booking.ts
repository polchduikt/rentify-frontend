import type { BookingStatus } from './enums';
import type { Decimal, LocalDateString, ZonedDateTimeString } from './scalars';

export interface BookingDto {
  id: number;
  propertyId: number;
  tenantId: number;
  dateFrom: LocalDateString;
  dateTo: LocalDateString;
  guests: number;
  totalPrice: Decimal;
  status: BookingStatus;
  createdAt: ZonedDateTimeString;
  updatedAt: ZonedDateTimeString;
}

export interface BookingRequestDto {
  propertyId: number;
  dateFrom: LocalDateString;
  dateTo: LocalDateString;
  guests: number;
}

export type BookingMutableStatus = Extract<BookingStatus, 'CANCELLED' | 'CONFIRMED' | 'REJECTED'>;

export interface BookingStatusUpdateRequestDto {
  status: BookingMutableStatus;
}
