import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import type { AuthenticationRequestDto, GoogleOAuthRequestDto, RegisterRequestDto } from '@/types/auth';
import { queryKeys } from '@/api/queryKeys';

const SESSION_STALE_TIME_MS = 5 * 60_000;
const SESSION_GC_TIME_MS = 10 * 60_000;

export const useAuthSessionQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: () => userService.getMySession(),
    enabled,
    staleTime: SESSION_STALE_TIME_MS,
    gcTime: SESSION_GC_TIME_MS,
  });

export const useAuthProfileQuery = useAuthSessionQuery;

export const useLoginMutation = () =>
  useMutation({
    mutationFn: (payload: AuthenticationRequestDto) => authService.login(payload),
  });

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: (payload: RegisterRequestDto) => authService.register(payload),
  });

export const useGoogleLoginMutation = () =>
  useMutation({
    mutationFn: (payload: GoogleOAuthRequestDto) => authService.loginWithGoogle(payload),
  });

export const useLoginWithProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AuthenticationRequestDto) => authService.loginWithProfile(payload),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.auth.session(), session.user);
    },
  });
};

export const useRegisterWithProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterRequestDto) => authService.registerWithProfile(payload),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.auth.session(), session.user);
    },
  });
};

export const useGoogleLoginWithProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GoogleOAuthRequestDto) => authService.loginWithGoogleProfile(payload),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.auth.session(), session.user);
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      authService.logout();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
