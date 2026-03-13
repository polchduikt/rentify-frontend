import type { PublicUserProfileDto } from '@/types/user';

const FALLBACK_USER_NAME = 'РљРѕСЂРёСЃС‚СѓРІР°С‡ Rentify';
const FALLBACK_JOINED_AT = 'РЅРµРґР°РІРЅРѕ';

export const toPositiveId = (value: unknown): number | null => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
};

export const resolveDisplayName = (profile?: PublicUserProfileDto | null) => {
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();
  return fullName || FALLBACK_USER_NAME;
};

export const resolveInitials = (profile?: PublicUserProfileDto | null) => {
  const initials = `${profile?.firstName?.charAt(0) ?? ''}${profile?.lastName?.charAt(0) ?? ''}`.trim().toUpperCase();
  return initials || profile?.firstName?.charAt(0)?.toUpperCase() || 'U';
};

export const resolvePhone = (profile?: PublicUserProfileDto | null): string => {
  const raw = profile as unknown as Record<string, unknown> | null | undefined;
  const candidates = [raw?.phone, raw?.phoneNumber, raw?.mobilePhone, raw?.contactPhone];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return '';
};

export const maskPhone = (phone: string) => {
  const normalized = phone.replace(/\s+/g, '');
  if (normalized.length < 7) {
    return '';
  }

  const digits = normalized.replace(/\D/g, '');
  if (digits.length >= 10) {
    const tail = digits.slice(-9);
    return `(${tail.slice(0, 2)}) ${tail.slice(2, 5)} ${tail.slice(5, 7)} ${tail.slice(7, 9)}`;
  }

  return '';
};

export const formatJoinedAt = (value?: string) => {
  if (!value) {
    return FALLBACK_JOINED_AT;
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return FALLBACK_JOINED_AT;
  }
  return date.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
};
