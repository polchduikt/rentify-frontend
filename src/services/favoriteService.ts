import { API_ENDPOINTS } from '@/config/apiEndpoints';
import type { FavoriteResponseDto } from '@/types/favorite';
import api from './api';

export const favoriteService = {
  async addToFavorites(propertyId: number): Promise<FavoriteResponseDto> {
    const { data } = await api.put<FavoriteResponseDto>(API_ENDPOINTS.favorites.byProperty(propertyId));
    return data;
  },

  async removeFromFavorites(propertyId: number): Promise<void> {
    await api.delete(API_ENDPOINTS.favorites.byProperty(propertyId));
  },

  async getMyFavorites(): Promise<FavoriteResponseDto[]> {
    const { data } = await api.get<FavoriteResponseDto[]>(API_ENDPOINTS.favorites.root);
    return data;
  },
};
