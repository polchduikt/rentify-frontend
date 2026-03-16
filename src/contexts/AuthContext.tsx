import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { USE_HTTP_ONLY_AUTH_COOKIE } from '@/config/env';
import type {
  AuthenticationRequestDto,
  GoogleOAuthRequestDto,
  RegisterRequestDto,
} from '@/types/auth';
import { queryKeys } from '@/api/queryKeys';
import type { UserSessionDto } from '@/types/user';
import { authService } from '@/services/authService';
import { AUTH_SESSION_EXPIRED_EVENT } from '@/services/api';
import { getAuthToken, setAuthToken } from '@/services/storage';
import { useMySessionQuery } from '@/hooks/api/useUserApi';

interface AuthContextType {
  user: UserSessionDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: AuthenticationRequestDto) => Promise<void>;
  register: (data: RegisterRequestDto) => Promise<void>;
  loginWithGoogle: (data: GoogleOAuthRequestDto) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => getAuthToken());

  const sessionQuery = useMySessionQuery(true);
  const user = sessionQuery.data ?? null;
  const isLoading = useMemo(() => {
    if (!USE_HTTP_ONLY_AUTH_COOKIE && !token) {
      return false;
    }
    return sessionQuery.isLoading;
  }, [sessionQuery.isLoading, token]);

  const setSessionCache = useCallback(
    (session: UserSessionDto) => {
      queryClient.setQueryData(queryKeys.auth.session(), session);
    },
    [queryClient],
  );

  useEffect(() => {
    const onSessionExpired = () => {
      authService.clearSessionCache();
      queryClient.clear();
      setToken(null);
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
    };
  }, [queryClient]);

  const applySession = (nextToken: string | null, nextUser: UserSessionDto) => {
    authService.clearSessionCache();
    queryClient.clear();
    setAuthToken(nextToken);
    setToken(nextToken ?? null);
    setSessionCache(nextUser);
  };

  const login = async (data: AuthenticationRequestDto) => {
    const session = await authService.loginWithProfile(data);
    applySession(session.token, session.user);
  };

  const register = async (data: RegisterRequestDto) => {
    const session = await authService.registerWithProfile(data);
    applySession(session.token, session.user);
  };

  const loginWithGoogle = async (data: GoogleOAuthRequestDto) => {
    const session = await authService.loginWithGoogleProfile(data);
    applySession(session.token, session.user);
  };

  const refreshProfile = async () => {
    const storedToken = getAuthToken();
    if (!storedToken && !USE_HTTP_ONLY_AUTH_COOKIE) {
      authService.clearSessionCache();
      queryClient.clear();
      setToken(null);
      return;
    }

    const session = await authService.fetchSession(storedToken ?? undefined);
    setToken(storedToken ?? null);
    setSessionCache(session);
  };

  const logout = () => {
    authService.logout();
    queryClient.clear();
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        loginWithGoogle,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
