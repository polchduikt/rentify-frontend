import { CreditCard } from 'lucide-react';
import type { WalletTransactionDto } from '@/types/wallet';
import { TRANSACTION_DIRECTION_STYLES } from '../constants';
import { formatDateTime, formatMoney } from '../formatters';

interface TransactionsSectionProps {
  transactions: WalletTransactionDto[];
  transactionsLoading: boolean;
  transactionsError: string | null;
}

export const TransactionsSection = ({
  transactions,
  transactionsLoading,
  transactionsError,
}: TransactionsSectionProps) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-center gap-2">
      <CreditCard size={18} className="text-slate-500" />
      <h2 className="text-xl font-bold text-slate-900">Останні транзакції</h2>
    </div>

    {transactionsError ? (
      <p className="text-sm text-rose-700">{transactionsError}</p>
    ) : transactionsLoading ? (
      <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
    ) : transactions.length === 0 ? (
      <p className="text-sm text-slate-600">Транзакцій поки немає.</p>
    ) : (
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        {transactions.map((transaction, index) => {
          const isCredit = transaction.direction === 'CREDIT';
          return (
            <div
              key={transaction.id}
              className={`flex flex-wrap items-center justify-between gap-2 px-4 py-3 ${index !== 0 ? 'border-t border-slate-200' : ''}`}
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{transaction.description || transaction.type}</p>
                <p className="text-xs text-slate-500">{formatDateTime(transaction.createdAt)}</p>
              </div>
              <p className={`text-sm font-bold ${TRANSACTION_DIRECTION_STYLES[transaction.direction]}`}>
                {isCredit ? '+' : '-'}
                {formatMoney(transaction.amount, transaction.currency)}
              </p>
            </div>
          );
        })}
      </div>
    )}
  </section>
);
