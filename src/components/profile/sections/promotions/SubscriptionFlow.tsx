import { CheckCircle2, Sparkles } from 'lucide-react';
import { resolveSubscriptionPlanLabel, type PromotionsSectionModel } from '@/hooks/profile/usePromotionsSectionModel';
import { getApiErrorMessage } from '@/utils/errors';
import { formatDateTime, formatMoney } from '@/utils/profileFormatters';

interface SubscriptionFlowProps {
  model: PromotionsSectionModel;
}

export const SubscriptionFlow = ({ model }: SubscriptionFlowProps) => (
  <div className="mt-4 space-y-5">
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-900">Поточний план: {resolveSubscriptionPlanLabel(model.subscriptionPlan)}</p>
      <p className="mt-1 text-xs text-slate-600">
        Активний до: {model.subscriptionActiveUntil ? formatDateTime(model.subscriptionActiveUntil) : 'немає активної підписки'}
      </p>
    </div>

    {model.subscriptionFlowStep === 'packages' ? (
      <>
        {model.subscriptionPackagesQuery.error ? (
          <p className="text-sm text-rose-700">
            {getApiErrorMessage(model.subscriptionPackagesQuery.error, 'Не вдалося завантажити пакети підписок.')}
          </p>
        ) : model.subscriptionPackagesQuery.isLoading ? (
          <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {model.subscriptionPackages.map((pkg) => {
              const selected = pkg.packageType === model.selectedSubscriptionPackageType;
              return (
                <button
                  key={pkg.packageType}
                  type="button"
                  onClick={() => model.setSelectedSubscriptionPackageType(pkg.packageType)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selected
                      ? 'border-blue-300 bg-blue-50 text-blue-900'
                      : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
                    <Sparkles size={14} />
                    {resolveSubscriptionPlanLabel(pkg.plan)}
                  </p>
                  <p className="mt-1 text-2xl font-black">{pkg.durationDays} днів</p>
                  <p className="mt-3 text-sm font-semibold">{formatMoney(pkg.price, pkg.currency)}</p>
                </button>
              );
            })}
          </div>
        )}
      </>
    ) : null}

    {model.subscriptionFlowStep === 'checkout' ? (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        {!model.selectedSubscriptionPackage ? (
          <p className="text-sm text-slate-600">Оберіть пакет підписки для оплати.</p>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-900">Підтвердження оплати підписки</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>
                <span className="text-slate-500">План:</span> {resolveSubscriptionPlanLabel(model.selectedSubscriptionPackage.plan)}
              </p>
              <p>
                <span className="text-slate-500">Тривалість:</span> {model.selectedSubscriptionPackage.durationDays} днів
              </p>
              <p>
                <span className="text-slate-500">До списання:</span>{' '}
                {formatMoney(model.selectedSubscriptionPackage.price, model.selectedSubscriptionPackage.currency)}
              </p>
              <p>
                <span className="text-slate-500">Буде після оплати:</span> {formatMoney(model.subscriptionBalanceAfterPurchase, model.walletCurrency)}
              </p>
            </div>

            {!model.hasSubscriptionFunds ? (
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Недостатньо коштів на балансі для оплати цього пакету.
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={model.goSubscriptionBack}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Назад
              </button>
              <button
                type="button"
                onClick={() => void model.handleSubscriptionPayment()}
                disabled={!model.hasSubscriptionFunds || model.purchaseSubscriptionMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                <CheckCircle2 size={15} />
                {model.purchaseSubscriptionMutation.isPending ? 'Оплата...' : 'Оплатити і активувати'}
              </button>
            </div>
          </>
        )}
      </div>
    ) : null}

    {model.subscriptionFlowStep !== 'checkout' ? (
      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={model.goSubscriptionBack}
          disabled={model.subscriptionFlowStep === 'packages'}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-55"
        >
          Назад
        </button>
        <button
          type="button"
          onClick={model.goSubscriptionNext}
          disabled={!model.canGoSubscriptionNext}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          Далі
        </button>
      </div>
    ) : null}
  </div>
);
