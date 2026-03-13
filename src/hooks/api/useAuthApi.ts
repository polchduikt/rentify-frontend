import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import type { AuthenticationRequestDto, GoogleOAuthRequestDto, RegisterRequestDto } from '@/types/auth';
import { queryKeys } from '@/api/queryKeys';

export const useAuthProfileQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: () => authService.fetchProfile(),
    enabled,
  });

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
      queryClient.setQueryData(queryKeys.auth.profile(), session.user);
      queryClient.setQueryData(queryKeys.users.profile(), session.user);
    },
  });
};

export const useRegisterWithProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterRequestDto) => authService.registerWithProfile(payload),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.auth.profile(), session.user);
      queryClient.setQueryData(queryKeys.users.profile(), session.user);
    },
  });
};

export const useGoogleLoginWithProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GoogleOAuthRequestDto) => authService.loginWithGoogleProfile(payload),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.auth.profile(), session.user);
      queryClient.setQueryData(queryKeys.users.profile(), session.user);
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
