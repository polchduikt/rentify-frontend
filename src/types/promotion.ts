import type { SubscriptionPackageType, SubscriptionPlan, TopPromotionPackageType } from './enums';
import type { Decimal, ZonedDateTimeString } from './scalars';

export interface PurchaseSubscriptionRequestDto {
  packageType: SubscriptionPackageType;
}

export interface PurchaseTopPromotionRequestDto {
  packageType: TopPromotionPackageType;
}

export interface SubscriptionPackageDto {
  packageType: SubscriptionPackageType;
  plan: SubscriptionPlan;
  durationDays: number;
  price: Decimal;
  currency: string;
}

export interface SubscriptionPurchaseResponseDto {
  subscriptionPlan: SubscriptionPlan;
  subscriptionActiveUntil: ZonedDateTimeString;
  chargedAmount: Decimal;
  balanceAfter: Decimal;
  currency: string;
}

export interface TopPromotionPackageDto {
  packageType: TopPromotionPackageType;
  durationDays: number;
  price: Decimal;
  currency: string;
}

export interface TopPromotionPurchaseResponseDto {
  propertyId: number;
  isTopPromoted: boolean;
  topPromotedUntil: ZonedDateTimeString;
  chargedAmount: Decimal;
  balanceAfter: Decimal;
  currency: string;
}
