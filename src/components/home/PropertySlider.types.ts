import type { PropertyResponseDto } from '@/types/property';

export interface PropertySliderProps {
  items: PropertyResponseDto[];
  loading: boolean;
  favoriteIds?: Set<number>;
}
