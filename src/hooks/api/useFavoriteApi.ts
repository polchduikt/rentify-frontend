import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoriteService } from '@/services/favoriteService';
import { queryKeys } from './queryKeys';

export const useMyFavoritesQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.favorites.mine(),
    queryFn: () => favoriteService.getMyFavorites(),
    enabled,
  });

export const useAddToFavoritesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: number) => favoriteService.addToFavorites(propertyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites.mine() });
    },
  });
};

export const useRemoveFromFavoritesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: number) => favoriteService.removeFromFavorites(propertyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites.mine() });
    },
  });
};
