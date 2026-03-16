import type { WalletTransactionDto } from '@/types/wallet';

export interface TransactionsSectionProps {
  transactions: WalletTransactionDto[];
  transactionsLoading: boolean;
  transactionsError: string | null;
}

export interface TabButtonProps {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}
