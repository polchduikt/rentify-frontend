import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services/reviewService';
import type { PageQuery } from '@/types/api';
import type { ReviewRequestDto } from '@/types/review';
import { queryKeys } from '@/api/queryKeys';

export const usePropertyReviewsQuery = (propertyId: number, page?: PageQuery, enabled = true) =>
  useQuery({
    queryKey: queryKeys.reviews.byProperty(propertyId, page),
    queryFn: () => reviewService.getPropertyReviews(propertyId, page),
    enabled: enabled && Number.isFinite(propertyId) && propertyId > 0,
  });

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReviewRequestDto) => reviewService.createReview(payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.byProperty(variables.propertyId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.properties.byId(variables.propertyId) });
    },
  });
};
