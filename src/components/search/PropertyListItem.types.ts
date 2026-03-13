import type { PropertyResponseDto } from '@/types/property';

export interface PropertyListItemProps {
  property: PropertyResponseDto;
  variant?: 'single' | 'double';
  isFavorite?: boolean;
}
