export type AmenityCategory =
  | 'BASIC'
  | 'VERIFICATION'
  | 'RENOVATION'
  | 'ACCESSIBILITY'
  | 'BLACKOUT_SUPPORT'
  | 'LIVING_CONDITIONS'
  | 'LAYOUT'
  | 'WALL_TYPE'
  | 'HEATING'
  | 'OFFER_TYPE'
  | 'RENTAL_TERMS'
  | 'OTHER';

export type BookingStatus =
  | 'CREATED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type LocationSuggestionType = 'CITY' | 'DISTRICT' | 'METRO' | 'RESIDENTIAL_COMPLEX';

export type MessageType = 'TEXT' | 'IMAGE' | 'SYSTEM';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export type PropertyMarketType = 'SECONDARY' | 'NEW_BUILD';

export type PropertyStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export type RentalType = 'LONG_TERM' | 'SHORT_TERM';

export type SubscriptionPackageType =
  | 'BASIC_30_DAYS'
  | 'BASIC_90_DAYS'
  | 'PREMIUM_30_DAYS'
  | 'PREMIUM_90_DAYS';

export type SubscriptionPlan = 'FREE' | 'BASIC' | 'PREMIUM';

export type TopPromotionPackageType = 'TOP_7_DAYS' | 'TOP_14_DAYS' | 'TOP_30_DAYS';

export type WalletTransactionDirection = 'CREDIT' | 'DEBIT';

export type WalletTransactionType = 'TOP_UP' | 'TOP_PROMOTION' | 'SUBSCRIPTION';
