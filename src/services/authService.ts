import { API_ENDPOINTS } from '@/config/apiEndpoints';
import api from './api';
import { clearAuthToken, getAuthToken } from './storage';
import type {
  AuthSession,
  AuthenticationRequestDto,
  AuthenticationResponseDto,
  GoogleOAuthRequestDto,
  RegisterRequestDto,
} from '@/types/auth';
import type { UserResponseDto } from '@/types/user';

let profileRequest: Promise<UserResponseDto> | null = null;
let profileRequestToken: string | null = null;

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
      .then((res) => res.data)
      .finally(() => {
        if (profileRequestToken === resolvedToken) {
          profileRequest = null;
          profileRequestToken = null;
        }
      });

    return profileRequest;
  },

  async loginWithProfile(data: AuthenticationRequestDto): Promise<AuthSession> {
    const { token } = await authService.login(data);
    const user = await authService.fetchProfile(token);
    return { token, user };
  },

  async registerWithProfile(data: RegisterRequestDto): Promise<AuthSession> {
    const { token } = await authService.register(data);
    const user = await authService.fetchProfile(token);
    return { token, user };
  },

  async loginWithGoogleProfile(data: GoogleOAuthRequestDto): Promise<AuthSession> {
    const { token } = await authService.loginWithGoogle(data);
    const user = await authService.fetchProfile(token);
    return { token, user };
  },

  logout(): void {
    profileRequest = null;
    profileRequestToken = null;
    clearAuthToken();
  },
};
