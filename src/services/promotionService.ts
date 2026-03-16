import { API_ENDPOINTS } from '@/config/apiEndpoints';
import type {
  PurchaseSubscriptionRequestDto,
  PurchaseTopPromotionRequestDto,
  SubscriptionPackageDto,
  SubscriptionPurchaseResponseDto,
  TopPromotionPackageDto,
  TopPromotionPurchaseResponseDto,
} from '@/types/promotion';
import type { SubscriptionPackageType, SubscriptionPlan, TopPromotionPackageType } from '@/types/enums';
import type { Decimal, ZonedDateTimeString } from '@/types/scalars';
import api from './api';

type RawTopPromotionPackageDto = {
  packageType?: TopPromotionPackageType;
  package_type?: TopPromotionPackageType;
  durationDays?: number;
  duration_days?: number;
  price?: Decimal;
  currency?: string;
};

type RawSubscriptionPackageDto = {
  packageType?: SubscriptionPackageType;
  package_type?: SubscriptionPackageType;
  plan?: SubscriptionPlan;
  durationDays?: number;
  duration_days?: number;
  price?: Decimal;
  currency?: string;
};

type RawTopPromotionPurchaseResponseDto = {
  propertyId?: number;
  property_id?: number;
  isTopPromoted?: boolean;
  is_top_promoted?: boolean;
  topPromotedUntil?: ZonedDateTimeString;
  top_promoted_until?: ZonedDateTimeString;
  chargedAmount?: Decimal;
  charged_amount?: Decimal;
  balanceAfter?: Decimal;
  balance_after?: Decimal;
  currency?: string;
};

type RawSubscriptionPurchaseResponseDto = {
  subscriptionPlan?: SubscriptionPlan;
  subscription_plan?: SubscriptionPlan;
  subscriptionActiveUntil?: ZonedDateTimeString;
  subscription_active_until?: ZonedDateTimeString;
  chargedAmount?: Decimal;
  charged_amount?: Decimal;
  balanceAfter?: Decimal;
  balance_after?: Decimal;
  currency?: string;
};

const normalizeTopPackage = (raw: RawTopPromotionPackageDto): TopPromotionPackageDto | null => {
  const packageType = raw.packageType ?? raw.package_type;
  if (!packageType) {
    return null;
  }

  return {
    packageType,
    durationDays: Number(raw.durationDays ?? raw.duration_days ?? 0),
    price: raw.price ?? 0,
    currency: raw.currency ?? 'UAH',
  };
};

const normalizeSubscriptionPackage = (raw: RawSubscriptionPackageDto): SubscriptionPackageDto | null => {
  const packageType = raw.packageType ?? raw.package_type;
  if (!packageType || !raw.plan) {
    return null;
  }

  return {
    packageType,
    plan: raw.plan,
    durationDays: Number(raw.durationDays ?? raw.duration_days ?? 0),
    price: raw.price ?? 0,
    currency: raw.currency ?? 'UAH',
  };
};

const normalizeTopPurchaseResponse = (
  raw: RawTopPromotionPurchaseResponseDto
): TopPromotionPurchaseResponseDto => ({
  propertyId: Number(raw.propertyId ?? raw.property_id ?? 0),
  isTopPromoted: Boolean(raw.isTopPromoted ?? raw.is_top_promoted),
  topPromotedUntil: (raw.topPromotedUntil ?? raw.top_promoted_until ?? '') as ZonedDateTimeString,
  chargedAmount: raw.chargedAmount ?? raw.charged_amount ?? 0,
  balanceAfter: raw.balanceAfter ?? raw.balance_after ?? 0,
  currency: raw.currency ?? 'UAH',
});

const normalizeSubscriptionPurchaseResponse = (
  raw: RawSubscriptionPurchaseResponseDto
): SubscriptionPurchaseResponseDto => ({
  subscriptionPlan: (raw.subscriptionPlan ?? raw.subscription_plan ?? 'FREE') as SubscriptionPlan,
  subscriptionActiveUntil: (raw.subscriptionActiveUntil ?? raw.subscription_active_until ?? '') as ZonedDateTimeString,
  chargedAmount: raw.chargedAmount ?? raw.charged_amount ?? 0,
  balanceAfter: raw.balanceAfter ?? raw.balance_after ?? 0,
  currency: raw.currency ?? 'UAH',
});

export const promotionService = {
  async getTopPromotionPackages(): Promise<TopPromotionPackageDto[]> {
    const { data } = await api.get<RawTopPromotionPackageDto[]>(API_ENDPOINTS.promotions.topPackages);
    return data.map(normalizeTopPackage).filter((item): item is TopPromotionPackageDto => item !== null);
  },

  async getSubscriptionPackages(): Promise<SubscriptionPackageDto[]> {
    const { data } = await api.get<RawSubscriptionPackageDto[]>(API_ENDPOINTS.promotions.subscriptionPackages);
    return data.map(normalizeSubscriptionPackage).filter((item): item is SubscriptionPackageDto => item !== null);
  },

  async purchaseTopPromotion(
    propertyId: number,
    payload: PurchaseTopPromotionRequestDto
  ): Promise<TopPromotionPurchaseResponseDto> {
    const { data } = await api.post<RawTopPromotionPurchaseResponseDto>(
      API_ENDPOINTS.promotions.purchaseTopForProperty(propertyId),
      { package_type: payload.packageType }
    );
    return normalizeTopPurchaseResponse(data);
  },

  async purchaseSubscription(
    payload: PurchaseSubscriptionRequestDto
  ): Promise<SubscriptionPurchaseResponseDto> {
    const { data } = await api.post<RawSubscriptionPurchaseResponseDto>(
      API_ENDPOINTS.promotions.purchaseSubscription,
      { package_type: payload.packageType }
    );
    return normalizeSubscriptionPurchaseResponse(data);
  },
};
