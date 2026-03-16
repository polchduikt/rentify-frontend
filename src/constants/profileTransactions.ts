import type { WalletTransactionDirection, WalletTransactionType } from '@/types/enums';

export const TRANSACTION_TYPE_LABELS: Record<WalletTransactionType, string> = {
  TOP_UP: 'Поповнення балансу',
  TOP_PROMOTION: 'Просування оголошення',
  SUBSCRIPTION: 'Оплата підписки',
  BOOKING_PAYMENT: 'Оплата бронювання',
  BOOKING_REFUND: 'Повернення за бронювання',
};

export const TRANSACTION_DIRECTION_LABELS: Record<WalletTransactionDirection, string> = {
  CREDIT: 'Зарахування',
  DEBIT: 'Списання',
};

export const TRANSACTION_DIRECTION_BADGE_STYLES: Record<WalletTransactionDirection, string> = {
  CREDIT: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  DEBIT: 'border-rose-200 bg-rose-50 text-rose-700',
};

export const REFERENCE_TYPE_LABELS: Record<string, string> = {
  PROPERTY: 'Оголошення',
  BOOKING: 'Бронювання',
  SUBSCRIPTION: 'Підписка',
  WALLET: 'Гаманець',
};
