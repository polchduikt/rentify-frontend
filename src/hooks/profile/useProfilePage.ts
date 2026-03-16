import { useQueries } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { queryKeys } from '@/api/queryKeys';
import { useAuth } from '@/contexts/AuthContext';
import {
  useIncomingBookingsQuery,
  useMyBookingsQuery,
  useMyFavoritesQuery,
  useMyPaymentsQuery,
  useMyProfileQuery,
  useMyPropertiesQuery,
  useWalletBalanceQuery,
  useWalletTopUpOptionsQuery,
  useWalletTransactionsQuery,
} from '@/hooks/api';
import { useProfilePageActions } from '@/hooks/profile/useProfilePageActions';
import {
  dedupePaymentsById,
  mergeFinancialTransactions,
  normalizeProfileValue,
  resolveProfileFullName,
  resolveProfileInitials,
  resolveProfileTotalCount,
  toProfileForm,
  toSyntheticPaymentTransactions,
} from '@/services/adapters/profileAdapter';
import { paymentService } from '@/services/paymentService';
import type { PasswordFormState, ProfileFormState } from '@/types/profile';
import { getApiErrorMessage } from '@/utils/errors';
import { buildLatestPaymentStatusByBookingId } from '@/utils/payments';

const PROFILE_PROPERTIES_PAGE_SIZE = 300;
const PROFILE_PROPERTIES_METRICS_PAGE_SIZE = 300;
const PROFILE_PUBLISHED_PROPERTIES_PAGE_SIZE = 10;
const PROFILE_TRANSACTIONS_PAGE_SIZE = 5;
const PROFILE_BOOKINGS_PAGE_SIZE = 24;
const TENANT_PAYMENT_TRANSACTION_ID_OFFSET = 1_000_000_000;
const HOST_PAYMENT_TRANSACTION_ID_OFFSET = 2_000_000_000;

export const useProfilePage = () => {
  const { user: authUser, refreshProfile } = useAuth();
  const [publishedPropertiesPage, setPublishedPropertiesPage] = useState(0);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(() => toProfileForm(authUser ?? undefined));
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const profileQuery = useMyProfileQuery();
  const propertiesQuery = useMyPropertiesQuery({
    page: 0,
    size: PROFILE_PROPERTIES_PAGE_SIZE,
    sort: 'createdAt,desc',
  });
  const propertiesMetricsQuery = useMyPropertiesQuery({
    page: 0,
    size: PROFILE_PROPERTIES_METRICS_PAGE_SIZE,
    sort: 'createdAt,desc',
  });
  const publishedPropertiesQuery = useMyPropertiesQuery(
    {
      page: publishedPropertiesPage,
      size: PROFILE_PUBLISHED_PROPERTIES_PAGE_SIZE,
      sort: 'createdAt,desc',
    },
    ['ACTIVE'],
  );
  const favoritesQuery = useMyFavoritesQuery();
  const walletQuery = useWalletBalanceQuery();
  const topUpOptionsQuery = useWalletTopUpOptionsQuery();
  const myBookingsQuery = useMyBookingsQuery({
    page: 0,
    size: PROFILE_BOOKINGS_PAGE_SIZE,
    sort: 'createdAt,desc',
  });
  const incomingBookingsQuery = useIncomingBookingsQuery({
    page: 0,
    size: PROFILE_BOOKINGS_PAGE_SIZE,
    sort: 'createdAt,desc',
  });
  const myPaymentsQuery = useMyPaymentsQuery();
  const transactionsQuery = useWalletTransactionsQuery({
    page: 0,
    size: PROFILE_TRANSACTIONS_PAGE_SIZE,
    sort: 'createdAt,desc',
  });

  const profile = profileQuery.data ?? authUser;

  useEffect(() => {
    setProfileForm(toProfileForm(profile ?? undefined));
  }, [profile?.id, profile?.firstName, profile?.lastName, profile?.phone]);

  useEffect(() => {
    const publishedPageData = publishedPropertiesQuery.data;
    if (!publishedPageData || publishedPropertiesPage === 0) {
      return;
    }
    if (publishedPageData.totalElements > 0 && publishedPageData.content.length === 0) {
      setPublishedPropertiesPage((prev) => Math.max(0, prev - 1));
    }
  }, [publishedPropertiesPage, publishedPropertiesQuery.data]);

  const isProfileDirty = useMemo(() => {
    if (!profile) {
      return false;
    }
    return (
      normalizeProfileValue(profileForm.firstName) !== normalizeProfileValue(profile.firstName) ||
      normalizeProfileValue(profileForm.lastName) !== normalizeProfileValue(profile.lastName) ||
      normalizeProfileValue(profileForm.phone) !== normalizeProfileValue(profile.phone)
    );
  }, [profile, profileForm.firstName, profileForm.lastName, profileForm.phone]);

  const fullName = useMemo(() => resolveProfileFullName(profile ?? undefined), [profile]);
  const initials = useMemo(() => resolveProfileInitials(profile ?? undefined), [profile]);

  const properties = propertiesQuery.data?.content ?? [];
  const propertiesForMetrics = propertiesMetricsQuery.data?.content ?? properties;
  const publishedProperties = publishedPropertiesQuery.data?.content ?? [];
  const favorites = favoritesQuery.data ?? [];
  const myBookings = myBookingsQuery.data?.content ?? [];
  const incomingBookings = incomingBookingsQuery.data?.content ?? [];
  const myPayments = myPaymentsQuery.data ?? [];
  const walletTransactions = transactionsQuery.data?.content ?? [];

  const incomingBookingPaymentsState = useQueries({
    queries: incomingBookings.map((booking) => ({
      queryKey: queryKeys.payments.byBooking(booking.id),
      queryFn: () => paymentService.getPaymentsByBooking(booking.id),
      enabled: booking.id > 0,
    })),
    combine: (results) => ({
      payments: dedupePaymentsById(results.flatMap((query) => query.data ?? [])),
      isLoading: results.some((query) => query.isLoading || query.isFetching),
      firstError: results.find((query) => query.error)?.error ?? null,
    }),
  });

  const syntheticTenantPaymentTransactions = useMemo(
    () =>
      toSyntheticPaymentTransactions(
        dedupePaymentsById(myPayments),
        Number(profile?.id ?? authUser?.id ?? 0),
        'tenant',
        TENANT_PAYMENT_TRANSACTION_ID_OFFSET,
      ),
    [authUser?.id, myPayments, profile?.id],
  );

  const syntheticHostPaymentTransactions = useMemo(
    () =>
      toSyntheticPaymentTransactions(
        incomingBookingPaymentsState.payments,
        Number(profile?.id ?? authUser?.id ?? 0),
        'host',
        HOST_PAYMENT_TRANSACTION_ID_OFFSET,
      ),
    [authUser?.id, incomingBookingPaymentsState.payments, profile?.id],
  );

  const transactions = useMemo(
    () =>
      mergeFinancialTransactions(walletTransactions, [
        ...syntheticTenantPaymentTransactions,
        ...syntheticHostPaymentTransactions,
      ]),
    [syntheticHostPaymentTransactions, syntheticTenantPaymentTransactions, walletTransactions],
  );

  const activePropertiesInPreview = propertiesForMetrics.filter((property) => String(property.status).toUpperCase() === 'ACTIVE').length;
  const promotedPropertiesInPreview = properties.filter((property) => property.isTopPromoted).length;

  const paymentStatusByBookingId = useMemo(() => buildLatestPaymentStatusByBookingId(myPayments), [myPayments]);
  const paidBookingsCount = useMemo(
    () => Object.values(paymentStatusByBookingId).filter((status) => status === 'PAID').length,
    [paymentStatusByBookingId],
  );

  const propertiesCount = resolveProfileTotalCount(propertiesMetricsQuery.data?.totalElements, propertiesForMetrics.length);
  const myBookingsCount = resolveProfileTotalCount(myBookingsQuery.data?.totalElements, myBookings.length);
  const incomingBookingsCount = resolveProfileTotalCount(incomingBookingsQuery.data?.totalElements, incomingBookings.length);

  const walletBalance = Number(walletQuery.data?.balance ?? profile?.balance ?? 0);
  const walletCurrency = walletQuery.data?.currency ?? 'UAH';

  const actions = useProfilePageActions({
    profile,
    profileForm,
    passwordForm,
    setPasswordForm,
    refreshProfile,
    refetchProfile: profileQuery.refetch,
  });

  const transactionsError = transactionsQuery.error
    ? getApiErrorMessage(transactionsQuery.error, 'Не вдалося завантажити транзакції')
    : myPaymentsQuery.error
      ? getApiErrorMessage(myPaymentsQuery.error, 'Не вдалося завантажити платежі бронювань.')
      : incomingBookingPaymentsState.firstError
        ? getApiErrorMessage(incomingBookingPaymentsState.firstError, 'Не вдалося завантажити платежі за вашими оголошеннями.')
        : null;

  const isInitialLoading = profileQuery.isLoading && !profile;
  const criticalError = !profile && profileQuery.error ? getApiErrorMessage(profileQuery.error, 'Не вдалося завантажити профіль') : null;

  return {
    profile,
    fullName,
    initials,
    profileForm,
    passwordForm,
    profileNotice: actions.profileNotice,
    passwordNotice: actions.passwordNotice,
    avatarNotice: actions.avatarNotice,
    bookingsNotice: actions.bookingsNotice,
    isProfileDirty,
    isInitialLoading,
    criticalError,
    properties,
    publishedProperties,
    publishedPropertiesPage,
    publishedPropertiesTotalPages: Math.max(1, publishedPropertiesQuery.data?.totalPages ?? 1),
    publishedPropertiesTotalElements: publishedPropertiesQuery.data?.totalElements ?? publishedProperties.length,
    publishedPropertiesError: publishedPropertiesQuery.error
      ? getApiErrorMessage(publishedPropertiesQuery.error, 'Не вдалося завантажити опубліковані оголошення.')
      : null,
    propertiesForPromotions: propertiesForMetrics,
    favorites,
    myBookings,
    incomingBookings,
    myPayments,
    paymentStatusByBookingId,
    transactions,
    propertiesCount,
    favoritesCount: favorites.length,
    bookingsCount: myBookingsCount + incomingBookingsCount,
    myBookingsCount,
    incomingBookingsCount,
    paidBookingsCount,
    activePropertiesInPreview,
    promotedPropertiesInPreview,
    walletBalance,
    walletCurrency,
    topUpOptions: topUpOptionsQuery.data ?? [],
    subscriptionPlan: walletQuery.data?.subscriptionPlan ?? profile?.subscriptionPlan ?? 'FREE',
    subscriptionActiveUntil: walletQuery.data?.subscriptionActiveUntil ?? profile?.subscriptionActiveUntil,
    propertiesLoading: propertiesQuery.isLoading,
    publishedPropertiesLoading: publishedPropertiesQuery.isLoading,
    favoritesLoading: favoritesQuery.isLoading,
    bookingsLoading: myBookingsQuery.isLoading || incomingBookingsQuery.isLoading,
    myBookingsLoading: myBookingsQuery.isLoading,
    incomingBookingsLoading: incomingBookingsQuery.isLoading,
    paymentsForBookingsLoading: myPaymentsQuery.isLoading,
    topUpOptionsLoading: topUpOptionsQuery.isLoading,
    walletTopUpPending: actions.walletTopUpPending,
    transactionsLoading:
      transactionsQuery.isLoading || myPaymentsQuery.isLoading || incomingBookingPaymentsState.isLoading,
    profileSaving: actions.profileSaving,
    passwordSaving: actions.passwordSaving,
    accountDeleting: actions.accountDeleting,
    avatarUploading: actions.avatarUploading,
    avatarDeleting: actions.avatarDeleting,
    propertiesForPromotionsLoading: propertiesMetricsQuery.isLoading,
    propertiesForPromotionsError: propertiesMetricsQuery.error
      ? getApiErrorMessage(propertiesMetricsQuery.error, 'Не вдалося завантажити оголошення для просування.')
      : null,
    propertiesError: propertiesQuery.error ? getApiErrorMessage(propertiesQuery.error, 'Не вдалося завантажити оголошення') : null,
    favoritesError: favoritesQuery.error ? getApiErrorMessage(favoritesQuery.error, 'Не вдалося завантажити обране') : null,
    myBookingsError: myBookingsQuery.error ? getApiErrorMessage(myBookingsQuery.error, 'Не вдалося завантажити ваші бронювання.') : null,
    incomingBookingsError: incomingBookingsQuery.error
      ? getApiErrorMessage(incomingBookingsQuery.error, 'Не вдалося завантажити вхідні бронювання.')
      : null,
    paymentsForBookingsError: myPaymentsQuery.error
      ? getApiErrorMessage(myPaymentsQuery.error, 'Не вдалося завантажити статуси оплат.')
      : null,
    topUpOptionsError: topUpOptionsQuery.error
      ? getApiErrorMessage(topUpOptionsQuery.error, 'Не вдалося завантажити рекомендовані суми поповнення.')
      : null,
    transactionsError,
    isBookingActionPending: actions.isBookingActionPending,
    setProfileField: (field: keyof ProfileFormState, value: string) =>
      setProfileForm((prev) => ({
        ...prev,
        [field]: value,
      })),
    setPasswordField: (field: keyof PasswordFormState, value: string) =>
      setPasswordForm((prev) => ({
        ...prev,
        [field]: value,
      })),
    resetProfileForm: () => setProfileForm(toProfileForm(profile ?? undefined)),
    saveProfile: actions.saveProfile,
    changePassword: actions.changePassword,
    deleteAccount: actions.deleteAccount,
    uploadAvatar: actions.uploadAvatar,
    deleteAvatar: actions.deleteAvatar,
    setPublishedPropertiesPage,
    topUpWallet: actions.topUpWallet,
    cancelBooking: actions.cancelBooking,
    confirmIncomingBooking: actions.confirmIncomingBooking,
    rejectIncomingBooking: actions.rejectIncomingBooking,
  };
};

export type ProfilePageModel = ReturnType<typeof useProfilePage>;
