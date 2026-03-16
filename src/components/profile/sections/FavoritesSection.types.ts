import type { FavoriteResponseDto } from '@/types/favorite';

export interface FavoritesSectionProps {
  favorites: FavoriteResponseDto[];
  favoritesCount: number;
  favoritesLoading: boolean;
  favoritesError: string | null;
}
