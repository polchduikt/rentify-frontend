import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import { clearGoogleAvatarUrl, setGoogleAvatarFallbackDisabled } from '@/services/storage';
import type { ChangePasswordRequestDto, DeleteAccountRequestDto, UpdateUserRequestDto } from '@/types/user';
import { USE_HTTP_ONLY_AUTH_COOKIE } from '@/config/env';
import { getAuthToken } from '@/services/storage';
import { queryKeys } from '@/api/queryKeys';
import { toUserSession } from '@/services/adapters/userAdapter';

const SESSION_STALE_TIME_MS = 5 * 60_000;
const SESSION_GC_TIME_MS = 10 * 60_000;

export const useMySessionQuery = (enabled = true) => {
  const token = getAuthToken();
  const shouldFetch = enabled && (USE_HTTP_ONLY_AUTH_COOKIE || Boolean(token));

  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: () => userService.getMySession(),
    enabled: shouldFetch,
    staleTime: SESSION_STALE_TIME_MS,
    gcTime: SESSION_GC_TIME_MS,
  });
};

export const useMyProfileQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.users.profile(),
    queryFn: () => userService.getMyProfile(),
    enabled,
  });

export const usePublicProfileQuery = (userId: number, enabled = true) =>
  useQuery({
    queryKey: queryKeys.users.publicProfile(userId),
    queryFn: () => userService.getPublicProfile(userId),
    enabled: enabled && Number.isFinite(userId) && userId > 0,
  });

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserRequestDto) => userService.updateProfile(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.users.profile(), user);
      queryClient.setQueryData(queryKeys.auth.session(), toUserSession(user));
    },
  });
};

export const useChangePasswordMutation = () =>
  useMutation({
    mutationFn: (payload: ChangePasswordRequestDto) => userService.changePassword(payload),
  });

export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DeleteAccountRequestDto) => userService.deleteCurrentAccount(payload),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useUploadAvatarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: () => {
      setGoogleAvatarFallbackDisabled(false);
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
    },
  });
};

export const useDeleteAvatarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userService.deleteAvatar(),
    onSuccess: () => {
      const currentProfileData = queryClient.getQueryData(queryKeys.users.profile()) as any;
      setGoogleAvatarFallbackDisabled(true, currentProfileData?.id);
      clearGoogleAvatarUrl();
      authService.clearSessionCache();
      if (currentProfileData) {
        const updatedData = { ...currentProfileData, avatarUrl: null };
        queryClient.setQueryData(queryKeys.users.profile(), updatedData);
        queryClient.setQueryData(queryKeys.auth.session(), toUserSession(updatedData));
      } else {
        void queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
        void queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      }
    },
  });
};
