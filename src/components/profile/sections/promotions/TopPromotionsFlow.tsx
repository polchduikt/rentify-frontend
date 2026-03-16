import { Crown } from 'lucide-react';
import type { PromotionsSectionModel } from '@/hooks/profile/usePromotionsSectionModel';
import { getApiErrorMessage } from '@/utils/errors';
import { formatMoney } from '@/utils/profileFormatters';

interface TopPromotionsFlowProps {
  model: PromotionsSectionModel;
}

export const TopPromotionsFlow = ({ model }: TopPromotionsFlowProps) => (
  <div className="mt-4 space-y-5">
    {model.topFlowStep === 'packages' ? (
      <>
        {model.topPackagesQuery.error ? (
          <p className="text-sm text-rose-700">
            {getApiErrorMessage(model.topPackagesQuery.error, 'Не вдалося завантажити промо-пакети.')}
          </p>
        ) : model.topPackagesQuery.isLoading ? (
          <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {model.topPackages.map((pkg) => {
              const selected = pkg.packageType === model.selectedTopPackageType;
              return (
                <button
                  key={pkg.packageType}
                  type="button"
                  onClick={() => {
                    model.setSelectedTopPackageType(pkg.packageType);
                    model.setSelectedTopPropertyId(null);
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selected
                      ? 'border-blue-300 bg-blue-50 text-blue-900'
                      : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-semibold">Пакет TOP</p>
                  <p className="mt-1 text-2xl font-black">{pkg.durationDays} днів</p>
                  <p className="mt-3 text-sm font-semibold">{formatMoney(pkg.price, pkg.currency)}</p>
                </button>
              );
            })}
          </div>
        )}
      </>
    ) : null}

    {model.topFlowStep === 'properties' ? (
      <>
        {!model.selectedTopPackage ? (
          <p className="text-sm text-slate-600">Спочатку оберіть пакет просування.</p>
        ) : model.propertiesError ? (
          <p className="text-sm text-rose-700">{model.propertiesError}</p>
        ) : model.propertiesLoading ? (
          <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
        ) : model.activeProperties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            Немає активних оголошень для просування.
          </div>
        ) : (
          <div className="space-y-3">
            {model.activeProperties.map((property) => {
              const isSelected = model.selectedTopPropertyId === property.id;
              const price =
                property.rentalType === 'SHORT_TERM'
                  ? property.pricing?.pricePerNight || property.pricing?.pricePerMonth
                  : property.pricing?.pricePerMonth || property.pricing?.pricePerNight;

              return (
                <article
                  key={property.id}
                  className={`rounded-2xl border p-4 ${isSelected ? 'border-blue-300 bg-blue-50/60' : 'border-slate-200 bg-slate-50'}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{property.title}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        ID #{property.id} • {property.address?.location?.city || 'Місто не вказано'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Ціна: {formatMoney(price, property.pricing?.currency || model.walletCurrency)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => model.setSelectedTopPropertyId(property.id)}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                        isSelected
                          ? 'border-blue-300 bg-blue-100 text-blue-700'
                          : 'border-blue-300 bg-white text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      {isSelected ? 'Обрано' : 'Обрати'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </>
    ) : null}

    {model.topFlowStep === 'checkout' ? (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        {!model.selectedTopPackage || !model.selectedTopProperty ? (
          <p className="text-sm text-slate-600">Оберіть пакет і оголошення для оплати.</p>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-900">Підтвердження оплати просування</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>
                <span className="text-slate-500">Оголошення:</span> {model.selectedTopProperty.title}
              </p>
              <p>
                <span className="text-slate-500">Пакет:</span> TOP на {model.selectedTopPackage.durationDays} днів
              </p>
              <p>
                <span className="text-slate-500">До списання:</span> {formatMoney(model.selectedTopPackage.price, model.selectedTopPackage.currency)}
              </p>
              <p>
                <span className="text-slate-500">Буде після оплати:</span> {formatMoney(model.topBalanceAfterPurchase, model.walletCurrency)}
              </p>
            </div>

            {!model.hasTopFunds ? (
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Недостатньо коштів на балансі для оплати цього пакету.
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={model.goTopBack}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Назад
              </button>
              <button
                type="button"
                onClick={() => void model.handleTopPayment()}
                disabled={!model.hasTopFunds || model.purchaseTopMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                <Crown size={15} />
                {model.purchaseTopMutation.isPending ? 'Оплата...' : 'Оплатити і підняти в топ'}
              </button>
            </div>
          </>
        )}
      </div>
    ) : null}

    {model.topFlowStep !== 'checkout' ? (
      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={model.goTopBack}
          disabled={model.topFlowStep === 'packages'}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-55"
        >
          Назад
        </button>
        <button
          type="button"
          onClick={model.goTopNext}
          disabled={!model.canGoTopNext}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          Далі
        </button>
      </div>
    ) : null}
  </div>
);
