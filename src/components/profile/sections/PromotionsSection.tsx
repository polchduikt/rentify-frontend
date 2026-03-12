import { CheckCircle2, Crown, Sparkles, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  usePurchaseSubscriptionMutation,
  usePurchaseTopPromotionMutation,
  useSubscriptionPackagesQuery,
  useTopPromotionPackagesQuery,
} from '@/hooks/api';
import type { SubscriptionPackageType, SubscriptionPlan, TopPromotionPackageType } from '@/types/enums';
import type { PropertyResponseDto } from '@/types/property';
import type { ProfilePromotionsSection, SectionNotice } from '@/types/profile';
import { getApiErrorMessage } from '@/utils/errors';
import { Notice } from '../Notice';
import { formatDateTime, formatMoney } from '../formatters';

type TopFlowStep = 'packages' | 'properties' | 'checkout';
type SubscriptionFlowStep = 'packages' | 'checkout';

interface PromotionsSectionProps {
  mode: ProfilePromotionsSection;
  properties: PropertyResponseDto[];
  propertiesLoading: boolean;
  propertiesError: string | null;
  walletBalance: number;
  walletCurrency: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionActiveUntil?: string;
}

const toAmount = (value: number | string | undefined): number => Number(value ?? 0);

const resolveSubscriptionPlanLabel = (plan: SubscriptionPlan): string => {
  if (plan === 'PREMIUM') return 'Premium';
  if (plan === 'BASIC') return 'Basic';
  return 'Free';
};

export const PromotionsSection = ({
  mode,
  properties,
  propertiesLoading,
  propertiesError,
  walletBalance,
  walletCurrency,
  subscriptionPlan,
  subscriptionActiveUntil,
}: PromotionsSectionProps) => {
  const [notice, setNotice] = useState<SectionNotice>(null);
  const [topFlowStep, setTopFlowStep] = useState<TopFlowStep>('packages');
  const [subscriptionFlowStep, setSubscriptionFlowStep] = useState<SubscriptionFlowStep>('packages');
  const [selectedTopPackageType, setSelectedTopPackageType] = useState<TopPromotionPackageType | null>(null);
  const [selectedTopPropertyId, setSelectedTopPropertyId] = useState<number | null>(null);
  const [selectedSubscriptionPackageType, setSelectedSubscriptionPackageType] = useState<SubscriptionPackageType | null>(null);

  const topPackagesQuery = useTopPromotionPackagesQuery(mode === 'promotions-top');
  const subscriptionPackagesQuery = useSubscriptionPackagesQuery(mode === 'promotions-subscriptions');
  const purchaseTopMutation = usePurchaseTopPromotionMutation();
  const purchaseSubscriptionMutation = usePurchaseSubscriptionMutation();

  const topPackages = useMemo(
    () => [...(topPackagesQuery.data ?? [])].sort((left, right) => Number(left.durationDays) - Number(right.durationDays)),
    [topPackagesQuery.data],
  );
  const subscriptionPackages = useMemo(
    () => [...(subscriptionPackagesQuery.data ?? [])].sort((left, right) => Number(left.durationDays) - Number(right.durationDays)),
    [subscriptionPackagesQuery.data],
  );

  const selectedTopPackage = useMemo(
    () => topPackages.find((pkg) => pkg.packageType === selectedTopPackageType) ?? null,
    [selectedTopPackageType, topPackages],
  );
  const selectedSubscriptionPackage = useMemo(
    () => subscriptionPackages.find((pkg) => pkg.packageType === selectedSubscriptionPackageType) ?? null,
    [selectedSubscriptionPackageType, subscriptionPackages],
  );
  const selectedTopProperty = useMemo(
    () => properties.find((property) => property.id === selectedTopPropertyId) ?? null,
    [properties, selectedTopPropertyId],
  );
  const activeProperties = useMemo(
    () => properties.filter((property) => String(property.status).toUpperCase() === 'ACTIVE'),
    [properties],
  );

  const selectedTopPrice = toAmount(selectedTopPackage?.price);
  const topBalanceAfterPurchase = walletBalance - selectedTopPrice;
  const hasTopFunds = selectedTopPrice > 0 && topBalanceAfterPurchase >= 0;

  const selectedSubscriptionPrice = toAmount(selectedSubscriptionPackage?.price);
  const subscriptionBalanceAfterPurchase = walletBalance - selectedSubscriptionPrice;
  const hasSubscriptionFunds = selectedSubscriptionPrice > 0 && subscriptionBalanceAfterPurchase >= 0;

  const canGoTopNext = topFlowStep === 'packages' ? !!selectedTopPackage : !!selectedTopProperty;
  const canGoSubscriptionNext = !!selectedSubscriptionPackage;

  const goTopBack = () => {
    if (topFlowStep === 'properties') {
      setTopFlowStep('packages');
      return;
    }
    if (topFlowStep === 'checkout') {
      setTopFlowStep('properties');
    }
  };

  const goTopNext = () => {
    if (topFlowStep === 'packages' && selectedTopPackage) {
      setTopFlowStep('properties');
      return;
    }
    if (topFlowStep === 'properties' && selectedTopProperty) {
      setTopFlowStep('checkout');
    }
  };

  const goSubscriptionBack = () => {
    if (subscriptionFlowStep === 'checkout') {
      setSubscriptionFlowStep('packages');
    }
  };

  const goSubscriptionNext = () => {
    if (subscriptionFlowStep === 'packages' && selectedSubscriptionPackage) {
      setSubscriptionFlowStep('checkout');
    }
  };

  const handleTopPayment = async () => {
    if (!selectedTopPackage?.packageType || !selectedTopProperty) {
      return;
    }

    setNotice(null);
    try {
      const response = await purchaseTopMutation.mutateAsync({
        propertyId: selectedTopProperty.id,
        payload: { packageType: selectedTopPackage.packageType },
      });
      setNotice({
        type: 'success',
        message: `Оголошення піднято в топ до ${formatDateTime(response.topPromotedUntil)}.`,
      });
      setSelectedTopPropertyId(null);
      setTopFlowStep('properties');
    } catch (error) {
      setNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'Не вдалося оплатити просування оголошення.'),
      });
    }
  };

  const handleSubscriptionPayment = async () => {
    if (!selectedSubscriptionPackage?.packageType) {
      return;
    }

    setNotice(null);
    try {
      const response = await purchaseSubscriptionMutation.mutateAsync({
        packageType: selectedSubscriptionPackage.packageType,
      });
      setNotice({
        type: 'success',
        message: `Підписку активовано до ${formatDateTime(response.subscriptionActiveUntil)}.`,
      });
      setSubscriptionFlowStep('packages');
    } catch (error) {
      setNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'Не вдалося оплатити підписку.'),
      });
    }
  };

  const headerTitle = mode === 'promotions-top' ? 'Просування оголошень' : 'Підписки';
  const headerDescription =
    mode === 'promotions-top'
      ? 'Оберіть пакет, потім оголошення і підтвердьте оплату.'
      : 'Оберіть пакет підписки та підтвердьте оплату.';

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{headerTitle}</h2>
          <p className="mt-1 text-sm text-slate-600">{headerDescription}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          <Wallet size={13} />
          Баланс: {formatMoney(walletBalance, walletCurrency)}
        </span>
      </div>

      {notice ? <Notice type={notice.type} message={notice.message} /> : null}

      {mode === 'promotions-top' ? (
        <div className="mt-4 space-y-5">
          {topFlowStep === 'packages' ? (
            <>
              {topPackagesQuery.error ? (
                <p className="text-sm text-rose-700">
                  {getApiErrorMessage(topPackagesQuery.error, 'Не вдалося завантажити промо-пакети.')}
                </p>
              ) : topPackagesQuery.isLoading ? (
                <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
              ) : (
                <div className="grid gap-3 md:grid-cols-3">
                  {topPackages.map((pkg) => {
                    const selected = pkg.packageType === selectedTopPackageType;
                    return (
                      <button
                        key={pkg.packageType}
                        type="button"
                        onClick={() => {
                          setSelectedTopPackageType(pkg.packageType);
                          setSelectedTopPropertyId(null);
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

          {topFlowStep === 'properties' ? (
            <>
              {!selectedTopPackage ? (
                <p className="text-sm text-slate-600">Спочатку оберіть пакет просування.</p>
              ) : propertiesError ? (
                <p className="text-sm text-rose-700">{propertiesError}</p>
              ) : propertiesLoading ? (
                <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
              ) : activeProperties.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                  Немає активних оголошень для просування.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeProperties.map((property) => {
                    const isSelected = selectedTopPropertyId === property.id;
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
                              Ціна: {formatMoney(price, property.pricing?.currency || walletCurrency)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedTopPropertyId(property.id)}
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

          {topFlowStep === 'checkout' ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              {!selectedTopPackage || !selectedTopProperty ? (
                <p className="text-sm text-slate-600">Оберіть пакет і оголошення для оплати.</p>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-900">Підтвердження оплати просування</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <p>
                      <span className="text-slate-500">Оголошення:</span> {selectedTopProperty.title}
                    </p>
                    <p>
                      <span className="text-slate-500">Пакет:</span> TOP на {selectedTopPackage.durationDays} днів
                    </p>
                    <p>
                      <span className="text-slate-500">До списання:</span>{' '}
                      {formatMoney(selectedTopPackage.price, selectedTopPackage.currency)}
                    </p>
                    <p>
                      <span className="text-slate-500">Буде після оплати:</span>{' '}
                      {formatMoney(topBalanceAfterPurchase, walletCurrency)}
                    </p>
                  </div>

                  {!hasTopFunds ? (
                    <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      Недостатньо коштів на балансі для оплати цього пакету.
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={goTopBack}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Назад
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleTopPayment()}
                      disabled={!hasTopFunds || purchaseTopMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                    >
                      <Crown size={15} />
                      {purchaseTopMutation.isPending ? 'Оплата...' : 'Оплатити і підняти в топ'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : null}

          {topFlowStep !== 'checkout' ? (
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={goTopBack}
                disabled={topFlowStep === 'packages'}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-55"
              >
                Назад
              </button>
              <button
                type="button"
                onClick={goTopNext}
                disabled={!canGoTopNext}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                Далі
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {mode === 'promotions-subscriptions' ? (
        <div className="mt-4 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Поточний план: {resolveSubscriptionPlanLabel(subscriptionPlan)}</p>
            <p className="mt-1 text-xs text-slate-600">
              Активний до: {subscriptionActiveUntil ? formatDateTime(subscriptionActiveUntil) : 'немає активної підписки'}
            </p>
          </div>

          {subscriptionFlowStep === 'packages' ? (
            <>
              {subscriptionPackagesQuery.error ? (
                <p className="text-sm text-rose-700">
                  {getApiErrorMessage(subscriptionPackagesQuery.error, 'Не вдалося завантажити пакети підписок.')}
                </p>
              ) : subscriptionPackagesQuery.isLoading ? (
                <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {subscriptionPackages.map((pkg) => {
                    const selected = pkg.packageType === selectedSubscriptionPackageType;
                    return (
                      <button
                        key={pkg.packageType}
                        type="button"
                        onClick={() => setSelectedSubscriptionPackageType(pkg.packageType)}
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

          {subscriptionFlowStep === 'checkout' ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              {!selectedSubscriptionPackage ? (
                <p className="text-sm text-slate-600">Оберіть пакет підписки для оплати.</p>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-900">Підтвердження оплати підписки</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <p>
                      <span className="text-slate-500">План:</span> {resolveSubscriptionPlanLabel(selectedSubscriptionPackage.plan)}
                    </p>
                    <p>
                      <span className="text-slate-500">Тривалість:</span> {selectedSubscriptionPackage.durationDays} днів
                    </p>
                    <p>
                      <span className="text-slate-500">До списання:</span>{' '}
                      {formatMoney(selectedSubscriptionPackage.price, selectedSubscriptionPackage.currency)}
                    </p>
                    <p>
                      <span className="text-slate-500">Буде після оплати:</span>{' '}
                      {formatMoney(subscriptionBalanceAfterPurchase, walletCurrency)}
                    </p>
                  </div>

                  {!hasSubscriptionFunds ? (
                    <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      Недостатньо коштів на балансі для оплати цього пакету.
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={goSubscriptionBack}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Назад
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSubscriptionPayment()}
                      disabled={!hasSubscriptionFunds || purchaseSubscriptionMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                    >
                      <CheckCircle2 size={15} />
                      {purchaseSubscriptionMutation.isPending ? 'Оплата...' : 'Оплатити і активувати'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : null}

          {subscriptionFlowStep !== 'checkout' ? (
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={goSubscriptionBack}
                disabled={subscriptionFlowStep === 'packages'}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-55"
              >
                Назад
              </button>
              <button
                type="button"
                onClick={goSubscriptionNext}
                disabled={!canGoSubscriptionNext}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                Далі
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};
