import { useQueries } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  useCancelBookingMutation,
  useChangePasswordMutation,
  useConfirmBookingMutation,
  useDeleteAvatarMutation,
  useIncomingBookingsQuery,
  useMyBookingsQuery,
  useMyFavoritesQuery,
  useMyPaymentsQuery,
  useMyProfileQuery,
  useMyPropertiesQuery,
  useRejectBookingMutation,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useWalletBalanceQuery,
  useWalletTopUpMutation,
  useWalletTopUpOptionsQuery,
  useWalletTransactionsQuery,
} from '@/hooks/api';
import { queryKeys } from '@/hooks/api/queryKeys';
import { paymentService } from '@/services/paymentService';
import type { PaymentResponseDto } from '@/types/payment';
import type { PasswordFormState, ProfileFormState, SectionNotice } from '@/types/profile';
import type { WalletTransactionDto } from '@/types/wallet';
import { getApiErrorMessage } from '@/utils/errors';
import { buildLatestPaymentStatusByBookingId } from '@/utils/payments';

const PROFILE_PROPERTIES_PAGE_SIZE = 6;
const PROFILE_PROPERTIES_METRICS_PAGE_SIZE = 300;
const PROFILE_TRANSACTIONS_PAGE_SIZE = 5;
const PROFILE_BOOKINGS_PAGE_SIZE = 24;
const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;
const TENANT_PAYMENT_TRANSACTION_ID_OFFSET = 1_000_000_000;
const HOST_PAYMENT_TRANSACTION_ID_OFFSET = 2_000_000_000;

const normalizeValue = (value: string | null | undefined) => value?.trim() ?? '';
const resolveTotalCount = (totalElements: unknown, fallbackLength: number): number => {
  const normalizedTotal = Number(totalElements);
  if (!Number.isFinite(normalizedTotal) || normalizedTotal < 0) {
    return fallbackLength;
  }
  return Math.max(normalizedTotal, fallbackLength);
};

type PaymentRawShape = PaymentResponseDto & {
  booking_id?: unknown;
  bookingID?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
  booking?: { id?: unknown } | null;
};

const normalizePositiveId = (value: unknown): number | null => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
};

const resolvePaymentBookingId = (payment: PaymentResponseDto): number | null => {
  const raw = payment as PaymentRawShape;
  return (
    normalizePositiveId(raw.bookingId) ??
    normalizePositiveId(raw.bookingID) ??
    normalizePositiveId(raw.booking_id) ??
    normalizePositiveId(raw.booking?.id)
  );
};

const resolvePaymentDateTime = (payment: PaymentResponseDto): string => {
  const raw = payment as PaymentRawShape;
  const value = raw.createdAt ?? raw.created_at ?? raw.updatedAt ?? raw.updated_at;
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return new Date().toISOString();
};

const dedupePaymentsById = (payments: PaymentResponseDto[]): PaymentResponseDto[] => {
  const byId = new Map<number, PaymentResponseDto>();
  for (const payment of payments) {
    const paymentId = Number(payment.id);
    if (Number.isFinite(paymentId) && paymentId > 0) {
      byId.set(paymentId, payment);
    }
  }
  return Array.from(byId.values());
};

type PaymentTransactionRole = 'tenant' | 'host';

const toSyntheticPaymentTransactions = (
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

const mergeFinancialTransactions = (
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

const toProfileForm = (source?: { firstName?: string; lastName?: string; phone?: string }): ProfileFormState => ({
  firstName: source?.firstName ?? '',
  lastName: source?.lastName ?? '',
  phone: source?.phone ?? '',
});

type BookingActionType = 'cancel' | 'confirm' | 'reject';

export const useProfilePage = () => {
  const { user: authUser, refreshProfile } = useAuth();
  const [profileForm, setProfileForm] = useState<ProfileFormState>(() => toProfileForm(authUser ?? undefined));
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileNotice, setProfileNotice] = useState<SectionNotice>(null);
  const [passwordNotice, setPasswordNotice] = useState<SectionNotice>(null);
  const [avatarNotice, setAvatarNotice] = useState<SectionNotice>(null);
  const [bookingsNotice, setBookingsNotice] = useState<SectionNotice>(null);
  const [bookingAction, setBookingAction] = useState<{ bookingId: number; action: BookingActionType } | null>(null);

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

  const cancelBookingMutation = useCancelBookingMutation();
  const confirmBookingMutation = useConfirmBookingMutation();
  const rejectBookingMutation = useRejectBookingMutation();
  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();
  const deleteAvatarMutation = useDeleteAvatarMutation();
  const walletTopUpMutation = useWalletTopUpMutation();

  const profile = profileQuery.data ?? authUser;

  useEffect(() => {
    setProfileForm(toProfileForm(profile ?? undefined));
  }, [profile?.id, profile?.firstName, profile?.lastName, profile?.phone]);

  const isProfileDirty = useMemo(() => {
    if (!profile) {
      return false;
    }
    return (
      normalizeValue(profileForm.firstName) !== normalizeValue(profile.firstName) ||
      normalizeValue(profileForm.lastName) !== normalizeValue(profile.lastName) ||
      normalizeValue(profileForm.phone) !== normalizeValue(profile.phone)
    );
  }, [profile, profileForm.firstName, profileForm.lastName, profileForm.phone]);

  const fullName = useMemo(() => {
    const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();
    return name || profile?.email || 'Користувач';
  }, [profile?.email, profile?.firstName, profile?.lastName]);

  const initials = useMemo(() => {
    const first = profile?.firstName?.trim().charAt(0) ?? '';
    const last = profile?.lastName?.trim().charAt(0) ?? '';
    const combined = `${first}${last}`.toUpperCase();
    return combined || profile?.email?.trim().charAt(0).toUpperCase() || 'U';
  }, [profile?.email, profile?.firstName, profile?.lastName]);

  const properties = propertiesQuery.data?.content ?? [];
  const propertiesForMetrics = propertiesMetricsQuery.data?.content ?? properties;
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
  const propertiesCount = resolveTotalCount(propertiesMetricsQuery.data?.totalElements, propertiesForMetrics.length);
  const myBookingsCount = resolveTotalCount(myBookingsQuery.data?.totalElements, myBookings.length);
  const incomingBookingsCount = resolveTotalCount(incomingBookingsQuery.data?.totalElements, incomingBookings.length);

  const walletBalance = Number(walletQuery.data?.balance ?? profile?.balance ?? 0);
  const walletCurrency = walletQuery.data?.currency ?? 'UAH';
  const transactionsError = transactionsQuery.error
    ? getApiErrorMessage(transactionsQuery.error, 'Не вдалося завантажити транзакції')
    : myPaymentsQuery.error
      ? getApiErrorMessage(myPaymentsQuery.error, 'Не вдалося завантажити платежі бронювань.')
      : incomingBookingPaymentsState.firstError
        ? getApiErrorMessage(
            incomingBookingPaymentsState.firstError,
            'Не вдалося завантажити платежі за вашими оголошеннями.',
          )
        : null;

  const isInitialLoading = profileQuery.isLoading && !profile;
  const criticalError = !profile && profileQuery.error ? getApiErrorMessage(profileQuery.error, 'Не вдалося завантажити профіль') : null;

  const cancelBooking = async (bookingId: number) => {
    setBookingsNotice(null);
    setBookingAction({ bookingId, action: 'cancel' });

    try {
      await cancelBookingMutation.mutateAsync(bookingId);
      setBookingsNotice({
        type: 'success',
        message: 'Бронювання скасовано.',
      });
    } catch (error) {
      setBookingsNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'Не вдалося скасувати бронювання.'),
      });
    } finally {
      setBookingAction((prev) => (prev?.bookingId === bookingId && prev.action === 'cancel' ? null : prev));
    }
  };

  const confirmIncomingBooking = async (bookingId: number) => {
    setBookingsNotice(null);
    setBookingAction({ bookingId, action: 'confirm' });

    try {
      await confirmBookingMutation.mutateAsync(bookingId);
      setBookingsNotice({
        type: 'success',
        message: 'Бронювання підтверджено.',
      });
    } catch (error) {
      setBookingsNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'Не вдалося підтвердити бронювання.'),
      });
    } finally {
      setBookingAction((prev) => (prev?.bookingId === bookingId && prev.action === 'confirm' ? null : prev));
    }
  };

  const rejectIncomingBooking = async (bookingId: number) => {
    setBookingsNotice(null);
    setBookingAction({ bookingId, action: 'reject' });

    try {
      await rejectBookingMutation.mutateAsync(bookingId);
      setBookingsNotice({
        type: 'success',
        message: 'Бронювання відхилено.',
      });
    } catch (error) {
      setBookingsNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'Не вдалося відхилити бронювання.'),
      });
    } finally {
      setBookingAction((prev) => (prev?.bookingId === bookingId && prev.action === 'reject' ? null : prev));
    }
  };

  const saveProfile = async () => {
    if (!profile) {
      return;
    }

    setProfileNotice(null);
    const firstName = profileForm.firstName.trim();
    const lastName = profileForm.lastName.trim();
    const phone = profileForm.phone.trim();

    if (!firstName || !lastName) {
      setProfileNotice({
        type: 'error',
        message: "Ім'я та прізвище є обов'язковими.",
      });
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        firstName,
        lastName,
        phone: phone || undefined,
      });
      await Promise.all([refreshProfile(), profileQuery.refetch()]);
      setProfileNotice({
        type: 'success',
        message: 'Профіль оновлено.',
      });
    } catch (error) {
      setProfileNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'Не вдалося зберегти зміни профілю.'),
      });
    }
  };

  const changePassword = async () => {
    setPasswordNotice(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordNotice({
        type: 'error',
        message: 'Заповніть усі поля для зміни пароля.',
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordNotice({
        type: 'error',
        message: 'Новий пароль має містити щонайменше 8 символів.',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordNotice({
        type: 'error',
        message: 'Підтвердження пароля не співпадає.',
      });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordNotice({
        type: 'success',
        message: 'Пароль успішно змінено.',
      });
    } catch (error) {
      setPasswordNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'Не вдалося змінити пароль.'),
      });
    }
  };

  const uploadAvatar = async (file: File) => {
    setAvatarNotice(null);

    if (!file.type.startsWith('image/')) {
      setAvatarNotice({
        type: 'error',
        message: 'Оберіть файл зображення.',
      });
      return;
    }

    if (file.size > MAX_AVATAR_FILE_SIZE) {
      setAvatarNotice({
        type: 'error',
        message: 'Розмір файлу має бути до 5 MB.',
      });
      return;
    }

    try {
      await uploadAvatarMutation.mutateAsync(file);
      await Promise.all([refreshProfile(), profileQuery.refetch()]);
      setAvatarNotice({
        type: 'success',
        message: 'Аватар оновлено.',
      });
    } catch (error) {
      setAvatarNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'Не вдалося завантажити аватар.'),
      });
    }
  };

  const deleteAvatar = async () => {
    setAvatarNotice(null);

    if (!profile?.avatarUrl) {
      setAvatarNotice({
        type: 'error',
        message: 'Аватар вже відсутній.',
      });
      return;
    }

    try {
      await deleteAvatarMutation.mutateAsync();
      await Promise.all([refreshProfile(), profileQuery.refetch()]);
      setAvatarNotice({
        type: 'success',
        message: 'Аватар видалено.',
      });
    } catch (error) {
      setAvatarNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'Не вдалося видалити аватар.'),
      });
    }
  };

  const topUpWallet = async (amount: number) => {
    await walletTopUpMutation.mutateAsync({ amount });
  };

  return {
    profile,
    fullName,
    initials,
    profileForm,
    passwordForm,
    profileNotice,
    passwordNotice,
    avatarNotice,
    bookingsNotice,
    isProfileDirty,
    isInitialLoading,
    criticalError,
    properties,
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
    favoritesLoading: favoritesQuery.isLoading,
    bookingsLoading: myBookingsQuery.isLoading || incomingBookingsQuery.isLoading,
    myBookingsLoading: myBookingsQuery.isLoading,
    incomingBookingsLoading: incomingBookingsQuery.isLoading,
    paymentsForBookingsLoading: myPaymentsQuery.isLoading,
    topUpOptionsLoading: topUpOptionsQuery.isLoading,
    walletTopUpPending: walletTopUpMutation.isPending,
    transactionsLoading:
      transactionsQuery.isLoading || myPaymentsQuery.isLoading || incomingBookingPaymentsState.isLoading,
    profileSaving: updateProfileMutation.isPending,
    passwordSaving: changePasswordMutation.isPending,
    avatarUploading: uploadAvatarMutation.isPending,
    avatarDeleting: deleteAvatarMutation.isPending,
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
      ? getApiErrorMessage(topUpOptionsQuery.error, 'РќРµ РІРґР°Р»РѕСЃСЏ Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё СЂРµРєРѕРјРµРЅРґРѕРІР°РЅС– СЃСѓРјРё РїРѕРїРѕРІРЅРµРЅРЅСЏ.')
      : null,
    transactionsError,
    isBookingActionPending: (bookingId: number, action: BookingActionType) =>
      bookingAction?.bookingId === bookingId && bookingAction?.action === action,
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
    saveProfile,
    changePassword,
    uploadAvatar,
    deleteAvatar,
    topUpWallet,
    cancelBooking,
    confirmIncomingBooking,
    rejectIncomingBooking,
  };
};

export type ProfilePageModel = ReturnType<typeof useProfilePage>;
