import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { USE_HTTP_ONLY_AUTH_COOKIE } from '@/config/env';
import type {
  AuthenticationRequestDto,
  GoogleOAuthRequestDto,
  RegisterRequestDto,
} from '@/types/auth';
import { queryKeys } from '@/api/queryKeys';
import type { UserResponseDto } from '@/types/user';
import { authService } from '@/services/authService';
import { AUTH_SESSION_EXPIRED_EVENT } from '@/services/api';
import { getAuthToken, setAuthToken } from '@/services/storage';

interface AuthContextType {
  user: UserResponseDto | null;
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
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setProfileCache = useCallback(
    (profile: UserResponseDto) => {
      queryClient.setQueryData(queryKeys.auth.profile(), profile);
      queryClient.setQueryData(queryKeys.users.profile(), profile);
    },
    [queryClient],
  );

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const storedToken = getAuthToken();
      if (!storedToken && !USE_HTTP_ONLY_AUTH_COOKIE) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setToken(storedToken);
      }

      try {
        const profile = await authService.fetchProfile(storedToken ?? undefined);
        if (isMounted) {
          setUser(profile);
          setProfileCache(profile);
        }
      } catch {
        authService.logout();
        queryClient.clear();
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [queryClient, setProfileCache]);

  useEffect(() => {
    const onSessionExpired = () => {
      authService.clearProfileCache();
      queryClient.clear();
      setToken(null);
      setUser(null);
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
    };
  }, [queryClient]);

  const applySession = (nextToken: string | null, nextUser: UserResponseDto) => {
    authService.clearProfileCache();
    queryClient.clear();
    setAuthToken(nextToken);
    setToken(nextToken ?? null);
    setUser(nextUser);
    setProfileCache(nextUser);
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
      authService.clearProfileCache();
      queryClient.clear();
      setToken(null);
      setUser(null);
      return;
    }

    const profile = await authService.fetchProfile(storedToken ?? undefined);
    setToken(storedToken ?? null);
    setUser(profile);
    setProfileCache(profile);
  };

  const logout = () => {
    authService.logout();
    queryClient.clear();
    setToken(null);
    setUser(null);
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
