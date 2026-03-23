import type { PropertyResponseDto } from '@/types/property.ts';

export interface PropertyCardProps {
  property: PropertyResponseDto;
  isFavorite?: boolean;
}
