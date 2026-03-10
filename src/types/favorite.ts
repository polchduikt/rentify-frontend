import type { PropertyResponseDto } from './property';
import type { ZonedDateTimeString } from './scalars';

export interface FavoriteResponseDto {
  id: number;
  propertyId: number;
  createdAt: ZonedDateTimeString;
  property: PropertyResponseDto;
}
