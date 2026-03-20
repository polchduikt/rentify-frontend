import type { SubscriptionPlan, WalletTransactionDirection, WalletTransactionType } from './enums';
import type { Decimal, ZonedDateTimeString } from './scalars';

export interface WalletBalanceDto {
  balance: Decimal;
  currency: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionActiveUntil: ZonedDateTimeString;
}

export interface WalletTopUpRequestDto {
  amount: Decimal;
}

export interface TopUpOptionDto {
  amount: Decimal;
  currency: string;
}

export interface WalletTransactionDto {
  id: number;
  userId: number;
  direction: WalletTransactionDirection;
  type: WalletTransactionType;
  amount: Decimal;
  currency: string;
  description: string;
  referenceType: string;
  referenceId: number;
  createdAt: ZonedDateTimeString;
}
