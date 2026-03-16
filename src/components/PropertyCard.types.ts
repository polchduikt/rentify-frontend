import type { PropertyResponseDto } from '@/types/property';

export interface PropertyCardProps {
  property: PropertyResponseDto;
  isFavorite?: boolean;
}
