import { useMemo, useState } from 'react';
import {
  usePurchaseSubscriptionMutation,
  usePurchaseTopPromotionMutation,
  useSubscriptionPackagesQuery,
  useTopPromotionPackagesQuery,
} from '@/hooks/api';
import type { SectionNotice } from '@/types/profile';
import type { PromotionsSectionProps, SubscriptionFlowStep, TopFlowStep } from '@/components/profile/sections/PromotionsSection.types';
import { getApiErrorMessage } from '@/utils/errors';
import { formatDateTime } from '@/utils/profileFormatters';

const toAmount = (value: number | string | undefined): number => Number(value ?? 0);

export const resolveSubscriptionPlanLabel = (plan: PromotionsSectionProps['subscriptionPlan']): string => {
  if (plan === 'PREMIUM') return 'Premium';
  if (plan === 'BASIC') return 'Basic';
  return 'Free';
};

export const usePromotionsSectionModel = ({
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
  const [selectedTopPackageType, setSelectedTopPackageType] = useState<string | null>(null);
  const [selectedTopPropertyId, setSelectedTopPropertyId] = useState<number | null>(null);
  const [selectedSubscriptionPackageType, setSelectedSubscriptionPackageType] = useState<string | null>(null);

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

  return {
    mode,
    notice,
    topFlowStep,
    subscriptionFlowStep,
    topPackagesQuery,
    subscriptionPackagesQuery,
    purchaseTopMutation,
    purchaseSubscriptionMutation,
    topPackages,
    subscriptionPackages,
    selectedTopPackageType,
    selectedTopPropertyId,
    selectedSubscriptionPackageType,
    selectedTopPackage,
    selectedSubscriptionPackage,
    selectedTopProperty,
    activeProperties,
    propertiesLoading,
    propertiesError,
    walletBalance,
    walletCurrency,
    subscriptionPlan,
    subscriptionActiveUntil,
    selectedTopPrice,
    topBalanceAfterPurchase,
    hasTopFunds,
    subscriptionBalanceAfterPurchase,
    hasSubscriptionFunds,
    canGoTopNext,
    canGoSubscriptionNext,
    headerTitle,
    headerDescription,
    setSelectedTopPackageType,
    setSelectedTopPropertyId,
    setSelectedSubscriptionPackageType,
    goTopBack,
    goTopNext,
    goSubscriptionBack,
    goSubscriptionNext,
    handleTopPayment,
    handleSubscriptionPayment,
  };
};

export type PromotionsSectionModel = ReturnType<typeof usePromotionsSectionModel>;
