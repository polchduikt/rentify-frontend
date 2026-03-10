import type { ZonedDateTimeString } from './scalars';

export interface ReviewDto {
  id: number;
  propertyId: number;
  authorId: number;
  rating: number;
  authorFirstName: string;
  comment: string;
  createdAt: ZonedDateTimeString;
}

export interface ReviewRequestDto {
  propertyId: number;
  bookingId: number;
  rating: number;
  comment?: string;
}
