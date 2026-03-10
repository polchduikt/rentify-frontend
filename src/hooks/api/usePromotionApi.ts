import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { promotionService } from '@/services/promotionService';
import type { PurchaseSubscriptionRequestDto, PurchaseTopPromotionRequestDto } from '@/types/promotion';
import { queryKeys } from './queryKeys';

export const useTopPromotionPackagesQuery = () =>
  useQuery({
    queryKey: queryKeys.promotions.topPackages(),
    queryFn: () => promotionService.getTopPromotionPackages(),
  });

export const useSubscriptionPackagesQuery = () =>
  useQuery({
    queryKey: queryKeys.promotions.subscriptionPackages(),
    queryFn: () => promotionService.getSubscriptionPackages(),
  });

export const usePurchaseTopPromotionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, payload }: { propertyId: number; payload: PurchaseTopPromotionRequestDto }) =>
      promotionService.purchaseTopPromotion(propertyId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
      void queryClient.invalidateQueries({ queryKey: ['properties'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.properties.byId(variables.propertyId) });
    },
  });
};

export const usePurchaseSubscriptionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PurchaseSubscriptionRequestDto) => promotionService.purchaseSubscription(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
    },
  });
};
