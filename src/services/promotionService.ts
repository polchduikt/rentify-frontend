import { API_ENDPOINTS } from '@/config/apiEndpoints';
import type {
  PurchaseSubscriptionRequestDto,
  PurchaseTopPromotionRequestDto,
  SubscriptionPackageDto,
  SubscriptionPurchaseResponseDto,
  TopPromotionPackageDto,
  TopPromotionPurchaseResponseDto,
} from '@/types/promotion';
import { asDecimal, asZonedDateTimeString } from '@/types/scalars';
import api from './api';

const normalizeTopPackage = (raw: Partial<TopPromotionPackageDto>): TopPromotionPackageDto | null => {
  if (!raw.packageType) {
    return null;
  }

  return {
    packageType: raw.packageType,
    durationDays: Number(raw.durationDays ?? 0),
    price: asDecimal(Number(raw.price ?? 0)),
    currency: raw.currency ?? 'UAH',
  };
};

const normalizeSubscriptionPackage = (raw: Partial<SubscriptionPackageDto>): SubscriptionPackageDto | null => {
  if (!raw.packageType || !raw.plan) {
    return null;
  }

  return {
    packageType: raw.packageType,
    plan: raw.plan,
    durationDays: Number(raw.durationDays ?? 0),
    price: asDecimal(Number(raw.price ?? 0)),
    currency: raw.currency ?? 'UAH',
  };
};

const normalizeTopPurchaseResponse = (raw: Partial<TopPromotionPurchaseResponseDto>): TopPromotionPurchaseResponseDto => ({
  propertyId: Number(raw.propertyId ?? 0),
  isTopPromoted: Boolean(raw.isTopPromoted),
  topPromotedUntil: raw.topPromotedUntil ?? asZonedDateTimeString(''),
  chargedAmount: asDecimal(Number(raw.chargedAmount ?? 0)),
  balanceAfter: asDecimal(Number(raw.balanceAfter ?? 0)),
  currency: raw.currency ?? 'UAH',
});

const normalizeSubscriptionPurchaseResponse = (
  raw: Partial<SubscriptionPurchaseResponseDto>,
): SubscriptionPurchaseResponseDto => ({
  subscriptionPlan: raw.subscriptionPlan ?? 'FREE',
  subscriptionActiveUntil: raw.subscriptionActiveUntil ?? asZonedDateTimeString(''),
  chargedAmount: asDecimal(Number(raw.chargedAmount ?? 0)),
  balanceAfter: asDecimal(Number(raw.balanceAfter ?? 0)),
  currency: raw.currency ?? 'UAH',
});

export const promotionService = {
  async getTopPromotionPackages(): Promise<TopPromotionPackageDto[]> {
    const { data } = await api.get<Partial<TopPromotionPackageDto>[]>(API_ENDPOINTS.promotions.topPackages);
    return data.map(normalizeTopPackage).filter((item): item is TopPromotionPackageDto => item !== null);
  },

  async getSubscriptionPackages(): Promise<SubscriptionPackageDto[]> {
    const { data } = await api.get<Partial<SubscriptionPackageDto>[]>(API_ENDPOINTS.promotions.subscriptionPackages);
    return data.map(normalizeSubscriptionPackage).filter((item): item is SubscriptionPackageDto => item !== null);
  },

  async purchaseTopPromotion(
    propertyId: number,
    payload: PurchaseTopPromotionRequestDto,
  ): Promise<TopPromotionPurchaseResponseDto> {
    const { data } = await api.post<Partial<TopPromotionPurchaseResponseDto>>(
      API_ENDPOINTS.promotions.purchaseTopForProperty(propertyId),
      { packageType: payload.packageType, package_type: payload.packageType },
    );
    return normalizeTopPurchaseResponse(data);
  },

  async purchaseSubscription(
    payload: PurchaseSubscriptionRequestDto,
  ): Promise<SubscriptionPurchaseResponseDto> {
    const { data } = await api.post<Partial<SubscriptionPurchaseResponseDto>>(
      API_ENDPOINTS.promotions.purchaseSubscription,
      { packageType: payload.packageType, package_type: payload.packageType },
    );
    return normalizeSubscriptionPurchaseResponse(data);
  },
};
