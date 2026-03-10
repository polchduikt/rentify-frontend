import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type {
  AuthenticationRequestDto,
  GoogleOAuthRequestDto,
  RegisterRequestDto,
} from '@/types/auth';
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
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const storedToken = getAuthToken();
      if (!storedToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setToken(storedToken);
      }

      try {
        const profile = await authService.fetchProfile(storedToken);
        if (isMounted) {
          setUser(profile);
        }
      } catch {
        authService.logout();
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
  }, []);

  useEffect(() => {
    const onSessionExpired = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
    };
  }, []);

  const applySession = async (nextToken: string, nextUser: UserResponseDto) => {
    setAuthToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = async (data: AuthenticationRequestDto) => {
    const session = await authService.loginWithProfile(data);
    await applySession(session.token, session.user);
  };

  const register = async (data: RegisterRequestDto) => {
    const session = await authService.registerWithProfile(data);
    await applySession(session.token, session.user);
  };

  const loginWithGoogle = async (data: GoogleOAuthRequestDto) => {
    const session = await authService.loginWithGoogleProfile(data);
    await applySession(session.token, session.user);
  };

  const refreshProfile = async () => {
    const storedToken = getAuthToken();
    if (!storedToken) {
      setToken(null);
      setUser(null);
      return;
    }

    const profile = await authService.fetchProfile(storedToken);
    setToken(storedToken);
    setUser(profile);
  };

  const logout = () => {
    authService.logout();
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
