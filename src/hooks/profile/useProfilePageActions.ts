import { useState, type Dispatch, type SetStateAction } from 'react';
import {
  useCancelBookingMutation,
  useChangePasswordMutation,
  useConfirmBookingMutation,
  useDeleteAccountMutation,
  useDeleteAvatarMutation,
  useRejectBookingMutation,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useWalletTopUpMutation,
} from '@/hooks/api';
import type { PasswordFormState, ProfileFormState, SectionNotice } from '@/types/profile';
import { getApiErrorMessage } from '@/utils/errors';

const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;

type BookingActionType = 'cancel' | 'confirm' | 'reject';

interface UseProfilePageActionsParams {
  profile?: {
    avatarUrl?: string;
  } | null;
  profileForm: ProfileFormState;
  passwordForm: PasswordFormState;
  setPasswordForm: Dispatch<SetStateAction<PasswordFormState>>;
  refreshProfile: () => Promise<void>;
  refetchProfile: () => Promise<unknown>;
}

export const useProfilePageActions = ({
  profile,
  profileForm,
  passwordForm,
  setPasswordForm,
  refreshProfile,
  refetchProfile,
}: UseProfilePageActionsParams) => {
  const [profileNotice, setProfileNotice] = useState<SectionNotice>(null);
  const [passwordNotice, setPasswordNotice] = useState<SectionNotice>(null);
  const [avatarNotice, setAvatarNotice] = useState<SectionNotice>(null);
  const [bookingsNotice, setBookingsNotice] = useState<SectionNotice>(null);
  const [bookingAction, setBookingAction] = useState<{ bookingId: number; action: BookingActionType } | null>(null);

  const cancelBookingMutation = useCancelBookingMutation();
  const confirmBookingMutation = useConfirmBookingMutation();
  const rejectBookingMutation = useRejectBookingMutation();
  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const deleteAccountMutation = useDeleteAccountMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();
  const deleteAvatarMutation = useDeleteAvatarMutation();
  const walletTopUpMutation = useWalletTopUpMutation();

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
      await Promise.all([refreshProfile(), refetchProfile()]);
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
      await Promise.all([refreshProfile(), refetchProfile()]);
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
      await Promise.all([refreshProfile(), refetchProfile()]);
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

  const deleteAccount = async () => {
    try {
      await deleteAccountMutation.mutateAsync({});
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Не вдалося видалити акаунт.'));
    }
  };

  return {
    profileNotice,
    passwordNotice,
    avatarNotice,
    bookingsNotice,
    walletTopUpPending: walletTopUpMutation.isPending,
    profileSaving: updateProfileMutation.isPending,
    passwordSaving: changePasswordMutation.isPending,
    accountDeleting: deleteAccountMutation.isPending,
    avatarUploading: uploadAvatarMutation.isPending,
    avatarDeleting: deleteAvatarMutation.isPending,
    saveProfile,
    changePassword,
    uploadAvatar,
    deleteAvatar,
    topUpWallet,
    deleteAccount,
    cancelBooking,
    confirmIncomingBooking,
    rejectIncomingBooking,
    isBookingActionPending: (bookingId: number, action: BookingActionType) =>
      bookingAction?.bookingId === bookingId && bookingAction?.action === action,
  };
};
