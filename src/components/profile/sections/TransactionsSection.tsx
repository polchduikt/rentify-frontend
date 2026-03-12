import { CalendarDays, CreditCard, FileText } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { WalletTransactionDto } from '@/types/wallet';
import { TRANSACTION_DIRECTION_STYLES } from '../constants';
import { formatDateTime, formatMoney } from '../formatters';
import {
  TRANSACTION_DIRECTION_BADGE_STYLES,
  TRANSACTION_DIRECTION_LABELS,
  TRANSACTION_TYPE_LABELS,
} from './transactions/constants';
import { TransactionReferenceInfo } from './transactions/TransactionReferenceInfo';
import {
  groupTransactionsByDate,
  matchesTransactionFilter,
  resolveTransactionTitle,
  type TransactionsFilter,
} from './transactions/utils';

interface TransactionsSectionProps {
  transactions: WalletTransactionDto[];
  transactionsLoading: boolean;
  transactionsError: string | null;
}

interface TabButtonProps {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}

const TabButton = ({ active, label, count, onClick }: TabButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
      active ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
    }`}
  >
    <span>{label}</span>
    <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px] text-slate-600">{count}</span>
  </button>
);

export const TransactionsSection = ({
  transactions,
  transactionsLoading,
  transactionsError,
}: TransactionsSectionProps) => {
  const [activeFilter, setActiveFilter] = useState<TransactionsFilter>('all');

  const filteredTransactions = useMemo(
    () => transactions.filter((transaction) => matchesTransactionFilter(transaction, activeFilter)),
    [activeFilter, transactions],
  );
  const groupedTransactions = useMemo(() => groupTransactionsByDate(filteredTransactions), [filteredTransactions]);

  const tabs = useMemo(
    () => ({
      all: transactions.length,
      paid: transactions.filter((transaction) => matchesTransactionFilter(transaction, 'paid')).length,
      cancelled: transactions.filter((transaction) => matchesTransactionFilter(transaction, 'cancelled')).length,
    }),
    [transactions],
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CreditCard size={18} className="text-slate-500" />
          <h2 className="text-xl font-bold text-slate-900">Транзакції</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          Усього: {transactions.length}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <TabButton active={activeFilter === 'all'} label="Усі" count={tabs.all} onClick={() => setActiveFilter('all')} />
        <TabButton active={activeFilter === 'paid'} label="Оплачені" count={tabs.paid} onClick={() => setActiveFilter('paid')} />
        <TabButton
          active={activeFilter === 'cancelled'}
          label="Скасовані"
          count={tabs.cancelled}
          onClick={() => setActiveFilter('cancelled')}
        />
      </div>

      {transactionsError ? (
        <p className="text-sm text-rose-700">{transactionsError}</p>
      ) : transactionsLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
      ) : filteredTransactions.length === 0 ? (
        <p className="text-sm text-slate-600">У вибраній категорії транзакцій поки немає.</p>
      ) : (
        <div className="space-y-5">
          {groupedTransactions.map((group) => (
            <section key={group.key} className="space-y-3">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                <CalendarDays size={12} />
                {group.label}
              </p>

              <div className="space-y-3">
                {group.items.map((transaction) => {
                  const isCredit = transaction.direction === 'CREDIT';

                  return (
                    <article key={transaction.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900">{resolveTransactionTitle(transaction)}</p>
                          <p className="text-xs text-slate-500">Дата транзакції: {formatDateTime(transaction.createdAt)}</p>
                        </div>
                        <p className={`text-sm font-bold ${TRANSACTION_DIRECTION_STYLES[transaction.direction]}`}>
                          {isCredit ? '+' : '-'}
                          {formatMoney(transaction.amount, transaction.currency)}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                            TRANSACTION_DIRECTION_BADGE_STYLES[transaction.direction]
                          }`}
                        >
                          {TRANSACTION_DIRECTION_LABELS[transaction.direction]}
                        </span>
                        <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          {TRANSACTION_TYPE_LABELS[transaction.type] || transaction.type}
                        </span>
                      </div>

                      {transaction.description ? (
                        <p className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                          <FileText size={12} className="mr-1.5 inline-block text-slate-400" />
                          {transaction.description}
                        </p>
                      ) : null}

                      <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Пов'язано з</p>
                        <TransactionReferenceInfo referenceType={transaction.referenceType} referenceId={transaction.referenceId} />
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
};
