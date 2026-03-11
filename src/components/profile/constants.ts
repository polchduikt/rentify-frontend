import type { PropertyStatus, WalletTransactionDirection } from '@/types/enums';

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
