import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  useChangePasswordMutation,
  useDeleteAvatarMutation,
  useMyBookingsQuery,
  useMyFavoritesQuery,
  useMyProfileQuery,
  useMyPropertiesQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useWalletBalanceQuery,
  useWalletTransactionsQuery,
} from '@/hooks/api';
import type { PasswordFormState, ProfileFormState, SectionNotice } from '@/types/profile';
import { getApiErrorMessage } from '@/utils/errors';

const PROFILE_PROPERTIES_PAGE_SIZE = 6;
const PROFILE_TRANSACTIONS_PAGE_SIZE = 5;
const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;

const normalizeValue = (value: string | null | undefined) => value?.trim() ?? '';

const toProfileForm = (source?: { firstName?: string; lastName?: string; phone?: string }): ProfileFormState => ({
  firstName: source?.firstName ?? '',
  lastName: source?.lastName ?? '',
  phone: source?.phone ?? '',
});

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

  const profileQuery = useMyProfileQuery();
  const propertiesQuery = useMyPropertiesQuery({
    page: 0,
    size: PROFILE_PROPERTIES_PAGE_SIZE,
    sort: 'createdAt,desc',
  });
  const favoritesQuery = useMyFavoritesQuery();
  const walletQuery = useWalletBalanceQuery();
  const bookingsQuery = useMyBookingsQuery({
    page: 0,
    size: 1,
    sort: 'createdAt,desc',
  });
  const transactionsQuery = useWalletTransactionsQuery({
    page: 0,
    size: PROFILE_TRANSACTIONS_PAGE_SIZE,
    sort: 'createdAt,desc',
  });

  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();
  const deleteAvatarMutation = useDeleteAvatarMutation();

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
  const favorites = favoritesQuery.data ?? [];
  const transactions = transactionsQuery.data?.content ?? [];

  const activePropertiesInPreview = properties.filter((property) => property.status === 'ACTIVE').length;
  const promotedPropertiesInPreview = properties.filter((property) => property.isTopPromoted).length;

  const walletBalance = Number(walletQuery.data?.balance ?? profile?.balance ?? 0);
  const walletCurrency = walletQuery.data?.currency ?? 'UAH';

  const isInitialLoading = profileQuery.isLoading && !profile;
  const criticalError = !profile && profileQuery.error ? getApiErrorMessage(profileQuery.error, 'Не вдалося завантажити профіль') : null;

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

  return {
    profile,
    fullName,
    initials,
    profileForm,
    passwordForm,
    profileNotice,
    passwordNotice,
    avatarNotice,
    isProfileDirty,
    isInitialLoading,
    criticalError,
    properties,
    favorites,
    transactions,
    propertiesCount: propertiesQuery.data?.totalElements ?? 0,
    favoritesCount: favorites.length,
    bookingsCount: bookingsQuery.data?.totalElements ?? 0,
    activePropertiesInPreview,
    promotedPropertiesInPreview,
    walletBalance,
    walletCurrency,
    subscriptionPlan: walletQuery.data?.subscriptionPlan ?? profile?.subscriptionPlan ?? 'FREE',
    subscriptionActiveUntil: walletQuery.data?.subscriptionActiveUntil ?? profile?.subscriptionActiveUntil,
    propertiesLoading: propertiesQuery.isLoading,
    favoritesLoading: favoritesQuery.isLoading,
    transactionsLoading: transactionsQuery.isLoading,
    profileSaving: updateProfileMutation.isPending,
    passwordSaving: changePasswordMutation.isPending,
    avatarUploading: uploadAvatarMutation.isPending,
    avatarDeleting: deleteAvatarMutation.isPending,
    propertiesError: propertiesQuery.error ? getApiErrorMessage(propertiesQuery.error, 'Не вдалося завантажити оголошення') : null,
    favoritesError: favoritesQuery.error ? getApiErrorMessage(favoritesQuery.error, 'Не вдалося завантажити обране') : null,
    transactionsError: transactionsQuery.error
      ? getApiErrorMessage(transactionsQuery.error, 'Не вдалося завантажити транзакції')
      : null,
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
  };
};

export type ProfilePageModel = ReturnType<typeof useProfilePage>;
