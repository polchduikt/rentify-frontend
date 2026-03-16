import type { UserSessionDto } from '@/types/user';
import { sanitizeAvatarValue } from '@/utils/avatar';

type UserAvatarRawShape = {
  avatarUrl?: unknown;
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

export const extractUserAvatar = (user: UserAvatarRawShape): string => {
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

export const normalizeUserProfile = <T extends UserAvatarRawShape>(user: T, fallbackAvatar?: string): T => {
  const avatarUrl = extractUserAvatar(user) || sanitizeUnknownAvatar(fallbackAvatar) || '';
  return {
    ...user,
    avatarUrl,
  } as T;
};

export const toUserSession = (user: {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  roles?: string[] | null;
}): UserSessionDto => ({
  id: user.id,
  firstName: user.firstName ?? '',
  lastName: user.lastName ?? '',
  avatarUrl: user.avatarUrl ?? '',
  roles: user.roles ?? [],
});
