import type { FormEvent } from 'react';
import type { ProfileFormState, SectionNotice } from '@/types/profile';
import type { UserResponseDto } from '@/types/user';

export interface AccountSectionProps {
  profile: UserResponseDto;
  fullName: string;
  initials: string;
  avatarSrc: string;
  avatarLoadFailed: boolean;
  onAvatarError: () => void;
  avatarUploading: boolean;
  avatarDeleting: boolean;
  avatarNotice: SectionNotice;
  profileNotice: SectionNotice;
  profileForm: ProfileFormState;
  isProfileDirty: boolean;
  profileSaving: boolean;
  onAvatarUpload: (file: File) => void;
  onAvatarDelete: () => void;
  onProfileFieldChange: (field: keyof ProfileFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}
