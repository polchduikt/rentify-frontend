import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FALLBACK_TOP_UP_OPTIONS, MIN_TOP_UP_AMOUNT } from '@/constants/profileUi';
import { getApiErrorMessage } from '@/utils/errors';
import { formatMoney } from '@/utils/profileFormatters';
import type { TopUpModalProps } from './TopUpModal.types';


const normalizeOptions = (options: number[]): number[] => {
  const unique = new Set<number>();
  for (const amount of options) {
    const normalized = Number(amount);
    if (Number.isFinite(normalized) && normalized > 0) {
      unique.add(normalized);
    }
  }
  return Array.from(unique).sort((left, right) => left - right);
};

export const TopUpModal = ({
  isOpen,
  currency,
  options,
  optionsLoading,
  optionsError,
  isSubmitting,
  onClose,
  onSubmit,
}: TopUpModalProps) => {
  const [amountInput, setAmountInput] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setAmountInput('');
    setSubmitError(null);
  }, [isOpen]);

  const preparedOptions = useMemo(() => {
    const normalized = normalizeOptions(options);
    return normalized.length > 0 ? normalized : FALLBACK_TOP_UP_OPTIONS;
  }, [options]);

  const parsedAmount = Number(amountInput);
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount >= MIN_TOP_UP_AMOUNT;

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!isAmountValid) {
      setSubmitError(`Вкажіть коректну суму від ${MIN_TOP_UP_AMOUNT} ${currency}.`);
      return;
    }

    try {
      await onSubmit(parsedAmount);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Не вдалося поповнити рахунок.'));
    }
  };

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Поповнення балансу</h3>
            <p className="mt-1 text-sm text-slate-600">Оберіть суму або введіть свою.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Закрити"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Рекомендовані суми</p>
            {optionsError ? <p className="mb-2 text-xs text-amber-700">{optionsError}</p> : null}
            {optionsLoading ? (
              <div className="h-10 animate-pulse rounded-xl bg-slate-200" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {preparedOptions.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setAmountInput(String(amount))}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      Number(amountInput) === amount
                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {formatMoney(amount, currency)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Сума поповнення</span>
            <div className="relative">
              <input
                type="number"
                min={MIN_TOP_UP_AMOUNT}
                step="1"
                value={amountInput}
                onChange={(event) => setAmountInput(event.target.value)}
                placeholder={`Наприклад, 500`}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 pr-14 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <span className="pointer-events-none absolute right-3 top-2 text-sm font-semibold text-slate-500">{currency}</span>
            </div>
          </label>

          {submitError ? <p className="text-sm text-rose-700">{submitError}</p> : null}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Скасувати
            </button>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting || !isAmountValid}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isSubmitting ? 'Поповнення...' : 'Поповнити'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
