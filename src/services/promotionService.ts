import { API_ENDPOINTS } from '@/config/apiEndpoints';
import type {
  PurchaseSubscriptionRequestDto,
  PurchaseTopPromotionRequestDto,
  SubscriptionPackageDto,
  SubscriptionPurchaseResponseDto,
  TopPromotionPackageDto,
  TopPromotionPurchaseResponseDto,
} from '@/types/promotion';
import api from './api';

export const promotionService = {
  async getTopPromotionPackages(): Promise<TopPromotionPackageDto[]> {
    const { data } = await api.get<TopPromotionPackageDto[]>(API_ENDPOINTS.promotions.topPackages);
    return data;
  },

  async getSubscriptionPackages(): Promise<SubscriptionPackageDto[]> {
    const { data } = await api.get<SubscriptionPackageDto[]>(API_ENDPOINTS.promotions.subscriptionPackages);
    return data;
  },

  async purchaseTopPromotion(
    propertyId: number,
    payload: PurchaseTopPromotionRequestDto
  ): Promise<TopPromotionPurchaseResponseDto> {
    const { data } = await api.post<TopPromotionPurchaseResponseDto>(
      API_ENDPOINTS.promotions.purchaseTopForProperty(propertyId),
      payload
    );
    return data;
  },

  async purchaseSubscription(
    payload: PurchaseSubscriptionRequestDto
  ): Promise<SubscriptionPurchaseResponseDto> {
    const { data } = await api.post<SubscriptionPurchaseResponseDto>(
      API_ENDPOINTS.promotions.purchaseSubscription,
      payload
    );
    return data;
  },
};
