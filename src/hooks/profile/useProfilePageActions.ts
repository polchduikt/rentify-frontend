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
        message: 'Р‘СЂРѕРЅСЋРІР°РЅРЅСЏ СЃРєР°СЃРѕРІР°РЅРѕ.',
      });
    } catch (error) {
      setBookingsNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ СЃРєР°СЃСѓРІР°С‚Рё Р±СЂРѕРЅСЋРІР°РЅРЅСЏ.'),
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
        message: 'Р‘СЂРѕРЅСЋРІР°РЅРЅСЏ РїС–РґС‚РІРµСЂРґР¶РµРЅРѕ.',
      });
    } catch (error) {
      setBookingsNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ РїС–РґС‚РІРµСЂРґРёС‚Рё Р±СЂРѕРЅСЋРІР°РЅРЅСЏ.'),
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
        message: 'Р‘СЂРѕРЅСЋРІР°РЅРЅСЏ РІС–РґС…РёР»РµРЅРѕ.',
      });
    } catch (error) {
      setBookingsNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ РІС–РґС…РёР»РёС‚Рё Р±СЂРѕРЅСЋРІР°РЅРЅСЏ.'),
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
        message: "Р†РјвЂ™СЏ С‚Р° РїСЂС–Р·РІРёС‰Рµ С” РѕР±РѕРІвЂ™СЏР·РєРѕРІРёРјРё.",
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
        message: 'РџСЂРѕС„С–Р»СЊ РѕРЅРѕРІР»РµРЅРѕ.',
      });
    } catch (error) {
      setProfileNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ Р·Р±РµСЂРµРіС‚Рё Р·РјС–РЅРё РїСЂРѕС„С–Р»СЋ.'),
      });
    }
  };

  const changePassword = async () => {
    setPasswordNotice(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordNotice({
        type: 'error',
        message: 'Р—Р°РїРѕРІРЅС–С‚СЊ СѓСЃС– РїРѕР»СЏ РґР»СЏ Р·РјС–РЅРё РїР°СЂРѕР»СЏ.',
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordNotice({
        type: 'error',
        message: 'РќРѕРІРёР№ РїР°СЂРѕР»СЊ РјР°С” РјС–СЃС‚РёС‚Рё С‰РѕРЅР°Р№РјРµРЅС€Рµ 8 СЃРёРјРІРѕР»С–РІ.',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordNotice({
        type: 'error',
        message: 'РџС–РґС‚РІРµСЂРґР¶РµРЅРЅСЏ РїР°СЂРѕР»СЏ РЅРµ СЃРїС–РІРїР°РґР°С”.',
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
        message: 'РџР°СЂРѕР»СЊ СѓСЃРїС–С€РЅРѕ Р·РјС–РЅРµРЅРѕ.',
      });
    } catch (error) {
      setPasswordNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ Р·РјС–РЅРёС‚Рё РїР°СЂРѕР»СЊ.'),
      });
    }
  };

  const uploadAvatar = async (file: File) => {
    setAvatarNotice(null);

    if (!file.type.startsWith('image/')) {
      setAvatarNotice({
        type: 'error',
        message: 'РћР±РµСЂС–С‚СЊ С„Р°Р№Р» Р·РѕР±СЂР°Р¶РµРЅРЅСЏ.',
      });
      return;
    }

    if (file.size > MAX_AVATAR_FILE_SIZE) {
      setAvatarNotice({
        type: 'error',
        message: 'Р РѕР·РјС–СЂ С„Р°Р№Р»Сѓ РјР°С” Р±СѓС‚Рё РґРѕ 5 MB.',
      });
      return;
    }

    try {
      await uploadAvatarMutation.mutateAsync(file);
      await Promise.all([refreshProfile(), refetchProfile()]);
      setAvatarNotice({
        type: 'success',
        message: 'РђРІР°С‚Р°СЂ РѕРЅРѕРІР»РµРЅРѕ.',
      });
    } catch (error) {
      setAvatarNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё Р°РІР°С‚Р°СЂ.'),
      });
    }
  };

  const deleteAvatar = async () => {
    setAvatarNotice(null);

    if (!profile?.avatarUrl) {
      setAvatarNotice({
        type: 'error',
        message: 'РђРІР°С‚Р°СЂ РІР¶Рµ РІС–РґСЃСѓС‚РЅС–Р№.',
      });
      return;
    }

    try {
      await deleteAvatarMutation.mutateAsync();
      await Promise.all([refreshProfile(), refetchProfile()]);
      setAvatarNotice({
        type: 'success',
        message: 'РђРІР°С‚Р°СЂ РІРёРґР°Р»РµРЅРѕ.',
      });
    } catch (error) {
      setAvatarNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ РІРёРґР°Р»РёС‚Рё Р°РІР°С‚Р°СЂ.'),
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
      throw new Error(getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ РІРёРґР°Р»РёС‚Рё Р°РєР°СѓРЅС‚.'));
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
