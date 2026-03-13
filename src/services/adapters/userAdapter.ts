import type { UserResponseDto } from '@/types/user';
import { sanitizeAvatarValue } from '@/utils/avatar';

type UserAvatarRawShape = UserResponseDto & {
  avatar?: unknown;
  avatar_url?: unknown;
  imageUrl?: unknown;
  picture?: unknown;
};

const sanitizeUnknownAvatar = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }
  return sanitizeAvatarValue(value);
};

export const extractUserAvatar = (user: UserResponseDto): string => {
  const raw = user as UserAvatarRawShape;
  const candidates = [raw.avatarUrl, raw.avatar, raw.avatar_url, raw.imageUrl, raw.picture];

  for (const candidate of candidates) {
    const sanitized = sanitizeUnknownAvatar(candidate);
    if (sanitized) {
      return sanitized;
    }
  }

  return '';
};

export const normalizeUserProfile = (user: UserResponseDto, fallbackAvatar?: string): UserResponseDto => {
  const avatarUrl = extractUserAvatar(user) || sanitizeUnknownAvatar(fallbackAvatar) || '';
  return {
    ...user,
    avatarUrl,
  };
};
