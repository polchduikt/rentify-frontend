import { API_BASE_URL } from '@/config/env';

const isAbsoluteUrl = (value: string) => /^(https?:)?\/\//i.test(value);

export const sanitizeAvatarValue = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return '';
  }
  const withoutQuotes = trimmed.replace(/^["']+|["']+$/g, '');
  if (withoutQuotes === 'null' || withoutQuotes === 'undefined') {
    return '';
  }
  return withoutQuotes;
};

export const resolveAvatarUrl = (avatarUrl: string | null | undefined) => {
  const value = sanitizeAvatarValue(avatarUrl);
  if (!value) {
    return '';
  }

  if (value.startsWith('lh3.googleusercontent.com/')) {
    return `https://${value}`;
  }

  if (isAbsoluteUrl(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    if (value.startsWith('http://lh3.googleusercontent.com')) {
      return value.replace('http://', 'https://');
    }
    return value;
  }

  try {
    const apiOrigin = isAbsoluteUrl(API_BASE_URL) ? new URL(API_BASE_URL).origin : window.location.origin;
    return new URL(value.startsWith('/') ? value : `/${value}`, apiOrigin).toString();
  } catch {
    return value;
  }
};
