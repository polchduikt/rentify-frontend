import type { SubscriptionPlan } from '@/types/enums';
import type { PropertyResponseDto } from '@/types/property';
import type { ProfilePromotionsSection } from '@/types/profile';

export type TopFlowStep = 'packages' | 'properties' | 'checkout';
export type SubscriptionFlowStep = 'packages' | 'checkout';

export interface PromotionsSectionProps {
  mode: ProfilePromotionsSection;
  properties: PropertyResponseDto[];
  propertiesLoading: boolean;
  propertiesError: string | null;
  walletBalance: number;
  walletCurrency: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionActiveUntil?: string;
}
