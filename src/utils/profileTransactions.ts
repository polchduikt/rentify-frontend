import type { WalletTransactionDto } from '@/types/wallet';
import { REFERENCE_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from '@/constants/profileTransactions';

export type TransactionsFilter = 'all' | 'paid' | 'cancelled';

interface TransactionsByDateGroup {
  key: string;
  label: string;
  items: WalletTransactionDto[];
}

const toDayKey = (value: string): string => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return 'unknown';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDayLabel = (value: string): string => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return 'Без дати';
  }
  return date.toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' });
};

export const normalizeReferenceType = (value?: string | null): string => String(value || '').trim().toUpperCase();

export const isPropertyReference = (referenceType?: string | null): boolean => {
  const normalized = normalizeReferenceType(referenceType);
  return normalized.includes('PROPERTY');
};

export const isBookingReference = (referenceType?: string | null): boolean => {
  const normalized = normalizeReferenceType(referenceType);
  return normalized.includes('BOOKING');
};

export const resolveReferenceTypeLabel = (referenceType?: string | null): string => {
  const normalized = normalizeReferenceType(referenceType);
  for (const [key, label] of Object.entries(REFERENCE_TYPE_LABELS)) {
    if (normalized.includes(key)) {
      return label;
    }
  }
  return normalized || 'Операція';
};

export const resolveTransactionTitle = (transaction: WalletTransactionDto): string =>
  TRANSACTION_TYPE_LABELS[transaction.type] || transaction.description || transaction.type;

const normalizeText = (value?: string | null): string => String(value || '').trim().toUpperCase();

const isCancelledTransaction = (transaction: WalletTransactionDto): boolean => {
  if (transaction.type === 'BOOKING_REFUND') {
    return true;
  }

  const description = normalizeText(transaction.description);
  if (
    description.includes('СКАС') ||
    description.includes('ПОВЕРН') ||
    description.includes('REFUND') ||
    description.includes('CANCEL')
  ) {
    return true;
  }

  const referenceType = normalizeReferenceType(transaction.referenceType);
  return referenceType.includes('BOOKING') && transaction.direction === 'CREDIT';
};

const isPaidTransaction = (transaction: WalletTransactionDto): boolean => {
  if (isCancelledTransaction(transaction)) {
    return false;
  }

  if (
    transaction.type === 'BOOKING_PAYMENT' ||
    transaction.type === 'TOP_PROMOTION' ||
    transaction.type === 'SUBSCRIPTION'
  ) {
    return true;
  }

  const referenceType = normalizeReferenceType(transaction.referenceType);
  return referenceType.includes('BOOKING') && transaction.direction === 'DEBIT';
};

export const matchesTransactionFilter = (transaction: WalletTransactionDto, filter: TransactionsFilter): boolean => {
  if (filter === 'all') {
    return true;
  }
  if (filter === 'paid') {
    return isPaidTransaction(transaction);
  }
  return isCancelledTransaction(transaction);
};

export const groupTransactionsByDate = (transactions: WalletTransactionDto[]): TransactionsByDateGroup[] => {
  const groups = new Map<string, TransactionsByDateGroup>();

  transactions.forEach((transaction) => {
    const key = toDayKey(transaction.createdAt);
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(transaction);
      return;
    }

    groups.set(key, {
      key,
      label: key === 'unknown' ? 'Без дати' : formatDayLabel(transaction.createdAt),
      items: [transaction],
    });
  });

  return Array.from(groups.values());
};
