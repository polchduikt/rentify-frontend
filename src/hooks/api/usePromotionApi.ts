import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { promotionService } from '@/services/promotionService';
import type { PurchaseSubscriptionRequestDto, PurchaseTopPromotionRequestDto } from '@/types/promotion';
import { queryKeys } from '@/api/queryKeys';

const PACKAGES_STALE_TIME_MS = 15 * 60_000;
const PACKAGES_GC_TIME_MS = 60 * 60_000;

export const useTopPromotionPackagesQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.promotions.topPackages(),
    queryFn: () => promotionService.getTopPromotionPackages(),
    enabled,
    staleTime: PACKAGES_STALE_TIME_MS,
    gcTime: PACKAGES_GC_TIME_MS,
  });

export const useSubscriptionPackagesQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.promotions.subscriptionPackages(),
    queryFn: () => promotionService.getSubscriptionPackages(),
    enabled,
    staleTime: PACKAGES_STALE_TIME_MS,
    gcTime: PACKAGES_GC_TIME_MS,
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
    },
  });
};
