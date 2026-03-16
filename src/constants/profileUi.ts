import type { PropertyStatus, WalletTransactionDirection } from '@/types/enums';

export const MIN_TOP_UP_AMOUNT = 1;
export const FALLBACK_TOP_UP_OPTIONS = [200, 500, 1000] as const;

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  DRAFT: 'Чернетка',
  ACTIVE: 'Активне',
  INACTIVE: 'Неактивне',
  BLOCKED: 'Заблоковане',
};

export const TRANSACTION_DIRECTION_STYLES: Record<WalletTransactionDirection, string> = {
  CREDIT: 'text-emerald-700',
  DEBIT: 'text-rose-700',
};
