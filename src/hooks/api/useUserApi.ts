import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import type { ChangePasswordRequestDto, DeleteAccountRequestDto, UpdateUserRequestDto } from '@/types/user';
import { queryKeys } from './queryKeys';

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
      queryClient.setQueryData(queryKeys.auth.profile(), user);
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
    },
  });
};

export const useDeleteAvatarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userService.deleteAvatar(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
    },
  });
};
