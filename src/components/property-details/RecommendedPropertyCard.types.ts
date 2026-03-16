import type { PropertyResponseDto } from '@/types/property';

export interface RecommendedPropertyCardProps {
  property: PropertyResponseDto;
  isFavorite?: boolean;
}
