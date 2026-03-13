import { API_ENDPOINTS } from '@/config/apiEndpoints';
import type {
  ChangePasswordRequestDto,
  DeleteAccountRequestDto,
  PublicUserProfileDto,
  UpdateUserRequestDto,
  UserResponseDto,
} from '@/types/user';
import { normalizeUserProfile } from './adapters/userAdapter';
import api from './api';
import { getGoogleAvatarUrl, isGoogleAvatarFallbackDisabled } from './storage';

const resolveGoogleAvatarFallback = (user: UserResponseDto): string | undefined => {
  const userId = Number(user.id);
  const hasValidUserId = Number.isFinite(userId) && userId > 0;
  if (isGoogleAvatarFallbackDisabled(hasValidUserId ? userId : undefined)) {
    return undefined;
  }
  return getGoogleAvatarUrl() ?? undefined;
};

export const userService = {
  async getMyProfile(): Promise<UserResponseDto> {
    const { data } = await api.get<UserResponseDto>(API_ENDPOINTS.users.profile);
    return normalizeUserProfile(data, resolveGoogleAvatarFallback(data));
  },

  async getPublicProfile(userId: number): Promise<PublicUserProfileDto> {
    const { data } = await api.get<PublicUserProfileDto>(API_ENDPOINTS.users.publicProfile(userId));
    return data;
  },

  async updateProfile(payload: UpdateUserRequestDto): Promise<UserResponseDto> {
    const { data } = await api.put<UserResponseDto>(API_ENDPOINTS.users.profile, payload);
    return normalizeUserProfile(data, resolveGoogleAvatarFallback(data));
  },

  async changePassword(payload: ChangePasswordRequestDto): Promise<void> {
    await api.patch(API_ENDPOINTS.users.changePassword, payload);
  },

  async deleteCurrentAccount(payload: DeleteAccountRequestDto): Promise<void> {
    await api.delete(API_ENDPOINTS.users.profile, { data: payload });
  },

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<string>(API_ENDPOINTS.users.avatar, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async deleteAvatar(): Promise<void> {
    await api.delete(API_ENDPOINTS.users.avatar);
  },
};
