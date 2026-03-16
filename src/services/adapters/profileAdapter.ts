import type { PaymentResponseDto } from '@/types/payment';
import type { ProfileFormState } from '@/types/profile';
import type { WalletTransactionDto } from '@/types/wallet';

type PaymentRawShape = PaymentResponseDto & {
  booking_id?: unknown;
  bookingID?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
  booking?: { id?: unknown } | null;
};

type ProfileIdentitySource = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

type PaymentTransactionRole = 'tenant' | 'host';

export const normalizeProfileValue = (value: string | null | undefined) => value?.trim() ?? '';

export const resolveProfileTotalCount = (totalElements: unknown, fallbackLength: number): number => {
  const normalizedTotal = Number(totalElements);
  if (!Number.isFinite(normalizedTotal) || normalizedTotal < 0) {
    return fallbackLength;
  }
  return Math.max(normalizedTotal, fallbackLength);
};

const normalizePositiveId = (value: unknown): number | null => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
};

export const resolvePaymentBookingId = (payment: PaymentResponseDto): number | null => {
  const raw = payment as PaymentRawShape;
  return (
    normalizePositiveId(raw.bookingId) ??
    normalizePositiveId(raw.bookingID) ??
    normalizePositiveId(raw.booking_id) ??
    normalizePositiveId(raw.booking?.id)
  );
};

export const resolvePaymentDateTime = (payment: PaymentResponseDto): string => {
  const raw = payment as PaymentRawShape;
  const value = raw.createdAt ?? raw.created_at ?? raw.updatedAt ?? raw.updated_at;
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return new Date().toISOString();
};

export const dedupePaymentsById = (payments: PaymentResponseDto[]): PaymentResponseDto[] => {
  const byId = new Map<number, PaymentResponseDto>();
  for (const payment of payments) {
    const paymentId = Number(payment.id);
    if (Number.isFinite(paymentId) && paymentId > 0) {
      byId.set(paymentId, payment);
    }
  }
  return Array.from(byId.values());
};

export const toSyntheticPaymentTransactions = (
  payments: PaymentResponseDto[],
  userId: number,
  role: PaymentTransactionRole,
  idOffset: number,
): WalletTransactionDto[] =>
  payments
    .filter((payment) => payment.status === 'PAID' || payment.status === 'REFUNDED')
    .map((payment) => {
      const isRefund = payment.status === 'REFUNDED';
      const bookingId = resolvePaymentBookingId(payment);
      const createdAt = resolvePaymentDateTime(payment);
      const bookingLabel = bookingId != null ? `#${bookingId}` : '';
      const isHostRole = role === 'host';
      const direction = isHostRole ? (isRefund ? 'DEBIT' : 'CREDIT') : isRefund ? 'CREDIT' : 'DEBIT';

      const description = isHostRole
        ? isRefund
          ? `Повернення орендарю за бронювання ${bookingLabel}`.trim()
          : `Надходження за бронювання ${bookingLabel}`.trim()
        : isRefund
          ? `Повернення за бронювання ${bookingLabel}`.trim()
          : `Оплата бронювання ${bookingLabel}`.trim();

      return {
        id: idOffset + payment.id,
        userId,
        direction,
        type: isRefund ? 'BOOKING_REFUND' : 'BOOKING_PAYMENT',
        amount: payment.amount,
        currency: payment.currency,
        description,
        referenceType: bookingId != null ? 'BOOKING' : 'PAYMENT',
        referenceId: bookingId ?? 0,
        createdAt,
      };
    });

export const mergeFinancialTransactions = (
  walletTransactions: WalletTransactionDto[],
  paymentTransactions: WalletTransactionDto[],
): WalletTransactionDto[] => {
  const knownWalletSignatures = new Set(
    walletTransactions.map(
      (transaction) =>
        `${transaction.referenceType}|${transaction.referenceId}|${transaction.direction}|${transaction.amount}|${transaction.createdAt}`,
    ),
  );

  const filteredPaymentTransactions = paymentTransactions.filter((transaction) => {
    const signature =
      `${transaction.referenceType}|${transaction.referenceId}|${transaction.direction}|${transaction.amount}|${transaction.createdAt}`;
    return !knownWalletSignatures.has(signature);
  });

  return [...walletTransactions, ...filteredPaymentTransactions].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
};

export const toProfileForm = (source?: ProfileIdentitySource): ProfileFormState => ({
  firstName: source?.firstName ?? '',
  lastName: source?.lastName ?? '',
  phone: source?.phone ?? '',
});

export const resolveProfileFullName = (source?: ProfileIdentitySource): string => {
  const name = [source?.firstName, source?.lastName].filter(Boolean).join(' ').trim();
  return name || source?.email || 'Користувач';
};

export const resolveProfileInitials = (source?: ProfileIdentitySource): string => {
  const first = source?.firstName?.trim().charAt(0) ?? '';
  const last = source?.lastName?.trim().charAt(0) ?? '';
  const combined = `${first}${last}`.toUpperCase();
  return combined || source?.email?.trim().charAt(0).toUpperCase() || 'U';
};
