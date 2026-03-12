import { API_ENDPOINTS } from '@/config/apiEndpoints';
import type {
  AuthSession,
  AuthenticationRequestDto,
  AuthenticationResponseDto,
  GoogleOAuthRequestDto,
  RegisterRequestDto,
} from '@/types/auth';
import type { UserResponseDto } from '@/types/user';
import api from './api';
import {
  clearAuthToken,
  clearGoogleAvatarUrl,
  getAuthToken,
  getGoogleAvatarUrl,
  setGoogleAvatarUrl,
} from './storage';

let profileRequest: Promise<UserResponseDto> | null = null;
let profileRequestToken: string | null = null;

interface GoogleIdTokenPayload {
  picture?: string;
}

const sanitizeAvatarValue = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim().replace(/^["']+|["']+$/g, '');
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
    return '';
  }
  return trimmed;
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const getGooglePictureFromIdToken = (idToken: string): string | undefined => {
  try {
    const parts = idToken.split('.');
    if (parts.length < 2) {
      return undefined;
    }
    const payload = JSON.parse(decodeBase64Url(parts[1])) as GoogleIdTokenPayload;
    const picture = sanitizeAvatarValue(payload.picture);
    return picture || undefined;
  } catch {
    return undefined;
  }
};

const extractAvatar = (user: UserResponseDto): string => {
  const raw = user as unknown as Record<string, unknown>;
  const candidates = [raw.avatarUrl, raw.avatar, raw.avatar_url, raw.imageUrl, raw.picture];
  for (const candidate of candidates) {
    const sanitized = sanitizeAvatarValue(candidate);
    if (sanitized) {
      return sanitized;
    }
  }
  return '';
};

const normalizeUserProfile = (user: UserResponseDto, fallbackAvatar?: string): UserResponseDto => {
  const avatarUrl = extractAvatar(user) || sanitizeAvatarValue(fallbackAvatar) || '';
  return {
    ...user,
    avatarUrl,
  };
};

export const authService = {
  async login(data: AuthenticationRequestDto): Promise<AuthenticationResponseDto> {
    const response = await api.post<AuthenticationResponseDto>(API_ENDPOINTS.auth.login, data);
    return response.data;
  },

  async register(data: RegisterRequestDto): Promise<AuthenticationResponseDto> {
    const response = await api.post<AuthenticationResponseDto>(API_ENDPOINTS.auth.register, data);
    return response.data;
  },

  async loginWithGoogle(data: GoogleOAuthRequestDto): Promise<AuthenticationResponseDto> {
    const response = await api.post<AuthenticationResponseDto>(API_ENDPOINTS.auth.google, data);
    return response.data;
  },

  async fetchProfile(token?: string): Promise<UserResponseDto> {
    const resolvedToken = token ?? getAuthToken();
    if (!resolvedToken) {
      return Promise.reject(new Error('Auth token is missing'));
    }

    if (profileRequest && profileRequestToken === resolvedToken) {
      return profileRequest;
    }

    profileRequestToken = resolvedToken;
    profileRequest = api
      .get<UserResponseDto>(API_ENDPOINTS.users.profile, {
        headers: { Authorization: `Bearer ${resolvedToken}` },
      })
      .then((res) => normalizeUserProfile(res.data, getGoogleAvatarUrl() ?? undefined))
      .finally(() => {
        if (profileRequestToken === resolvedToken) {
          profileRequest = null;
          profileRequestToken = null;
        }
      });

    return profileRequest;
  },

  async loginWithProfile(data: AuthenticationRequestDto): Promise<AuthSession> {
    clearGoogleAvatarUrl();
    const { token } = await authService.login(data);
    const user = await authService.fetchProfile(token);
    return { token, user };
  },

  async registerWithProfile(data: RegisterRequestDto): Promise<AuthSession> {
    clearGoogleAvatarUrl();
    const { token } = await authService.register(data);
    const user = await authService.fetchProfile(token);
    return { token, user };
  },

  async loginWithGoogleProfile(data: GoogleOAuthRequestDto): Promise<AuthSession> {
    const googlePicture = getGooglePictureFromIdToken(data.idToken);
    if (googlePicture) {
      setGoogleAvatarUrl(googlePicture);
    }

    const { token } = await authService.loginWithGoogle(data);
    const user = normalizeUserProfile(await authService.fetchProfile(token), googlePicture);

    if (user.avatarUrl) {
      setGoogleAvatarUrl(user.avatarUrl);
    }

    return { token, user };
  },

  clearProfileCache(): void {
    profileRequest = null;
    profileRequestToken = null;
  },

  logout(): void {
    profileRequest = null;
    profileRequestToken = null;
    clearAuthToken();
    clearGoogleAvatarUrl();
  },
};
