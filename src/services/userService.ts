import { API_ENDPOINTS } from '@/config/apiEndpoints';
import type {
  ChangePasswordRequestDto,
  DeleteAccountRequestDto,
  PublicUserProfileDto,
  UpdateUserRequestDto,
  UserResponseDto,
  UserSessionDto,
} from '@/types/user';
import { normalizeUserProfile } from './adapters/userAdapter';
import api from './api';
import { getGoogleAvatarUrl, isGoogleAvatarFallbackDisabled } from './storage';

const resolveGoogleAvatarFallback = (userId: number | null | undefined): string | undefined => {
  const normalizedUserId = Number(userId ?? 0);
  const hasValidUserId = Number.isFinite(normalizedUserId) && normalizedUserId > 0;
  if (isGoogleAvatarFallbackDisabled(hasValidUserId ? normalizedUserId : undefined)) {
    return undefined;
  }
  return getGoogleAvatarUrl() ?? undefined;
};

export const userService = {
  async getMySession(): Promise<UserSessionDto> {
    const { data } = await api.get<UserSessionDto>(API_ENDPOINTS.users.session);
    return normalizeUserProfile(data, resolveGoogleAvatarFallback(data.id));
  },

  async getMyProfile(): Promise<UserResponseDto> {
    const { data } = await api.get<UserResponseDto>(API_ENDPOINTS.users.profile);
    return normalizeUserProfile(data, resolveGoogleAvatarFallback(data.id));
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
