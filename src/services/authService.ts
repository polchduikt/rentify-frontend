import { API_ENDPOINTS } from '@/config/apiEndpoints';
import { USE_HTTP_ONLY_AUTH_COOKIE } from '@/config/env';
import type {
  AuthSession,
  AuthenticationRequestDto,
  AuthenticationResponseDto,
  GoogleOAuthRequestDto,
  RegisterRequestDto,
} from '@/types/auth';
import type { UserSessionDto } from '@/types/user';
import api from './api';
import { normalizeUserProfile, toUserSession } from './adapters/userAdapter';
import {
  clearAuthToken,
  clearGoogleAvatarUrl,
  getAuthToken,
  getGoogleAvatarUrl,
  isGoogleAvatarFallbackDisabled,
  setGoogleAvatarUrl,
} from './storage';
import { sanitizeAvatarValue } from '@/utils/avatar';

const sessionCache = {
  request: null as Promise<UserSessionDto> | null,
  key: null as string | null,
  clear() {
    this.request = null;
    this.key = null;
  },
};

interface GoogleIdTokenPayload {
  picture?: string;
}

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

interface FetchSessionOptions {
  googlePictureFallback?: string;
}

const normalizeTokenValue = (token: string | null | undefined): string | null => {
  const normalized = token?.trim();
  return normalized ? normalized : null;
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

  async fetchSession(token?: string, options?: FetchSessionOptions): Promise<UserSessionDto> {
    const resolvedToken = normalizeTokenValue(token ?? getAuthToken());
    const nextSessionKey = USE_HTTP_ONLY_AUTH_COOKIE ? '__cookie-session__' : resolvedToken;
    if (!nextSessionKey) {
      return Promise.reject(new Error('Auth token is missing'));
    }

    if (sessionCache.request && sessionCache.key === nextSessionKey) {
      return sessionCache.request;
    }

    sessionCache.key = nextSessionKey;
    sessionCache.request = api
      .get<UserSessionDto>(
        API_ENDPOINTS.users.session,
        USE_HTTP_ONLY_AUTH_COOKIE || !resolvedToken
          ? undefined
          : {
              headers: { Authorization: `Bearer ${resolvedToken}` },
            },
      )
      .then((res) => {
        const normalized = normalizeUserProfile(res.data);
        const userId = Number(normalized.id);
        const hasValidUserId = Number.isFinite(userId) && userId > 0;
        const isFallbackDisabled = isGoogleAvatarFallbackDisabled(hasValidUserId ? userId : undefined);
        const fallbackAvatar = isFallbackDisabled
          ? undefined
          : options?.googlePictureFallback ?? getGoogleAvatarUrl() ?? undefined;
        const withAvatar = normalizeUserProfile(normalized, fallbackAvatar);
        return toUserSession(withAvatar);
      })
      .finally(() => {
        if (sessionCache.key === nextSessionKey) {
          sessionCache.clear();
        }
      });

    return sessionCache.request;
  },

  async loginWithProfile(data: AuthenticationRequestDto): Promise<AuthSession> {
    clearGoogleAvatarUrl();
    const { token } = await authService.login(data);
    const normalizedToken = normalizeTokenValue(token);
    const user = await authService.fetchSession(normalizedToken ?? undefined);
    return { token: normalizedToken, user };
  },

  async registerWithProfile(data: RegisterRequestDto): Promise<AuthSession> {
    clearGoogleAvatarUrl();
    const { token } = await authService.register(data);
    const normalizedToken = normalizeTokenValue(token);
    const user = await authService.fetchSession(normalizedToken ?? undefined);
    return { token: normalizedToken, user };
  },

  async loginWithGoogleProfile(data: GoogleOAuthRequestDto): Promise<AuthSession> {
    const googlePicture = getGooglePictureFromIdToken(data.idToken);
    const { token } = await authService.loginWithGoogle(data);
    const normalizedToken = normalizeTokenValue(token);
    const user = await authService.fetchSession(normalizedToken ?? undefined, {
      googlePictureFallback: googlePicture,
    });
    const userId = Number(user.id);
    const isFallbackDisabled = isGoogleAvatarFallbackDisabled(
      Number.isFinite(userId) && userId > 0 ? userId : undefined,
    );

    if (!isFallbackDisabled && user.avatarUrl) {
      setGoogleAvatarUrl(user.avatarUrl);
    }

    return { token: normalizedToken, user };
  },

  clearSessionCache(): void {
    sessionCache.clear();
  },

  async logout(): Promise<void> {
    sessionCache.clear();
    try {
      await api.delete(API_ENDPOINTS.auth.logout);
    } finally {
      clearAuthToken();
      clearGoogleAvatarUrl();
    }
  },
};
