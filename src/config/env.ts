const DEFAULT_API_BASE_URL = '/api/v1';
const DEFAULT_AUTH_STRATEGY = 'bearer';
const DEFAULT_CSRF_COOKIE_NAME = 'csrf_token';
const DEFAULT_CSRF_HEADER_NAME = 'X-CSRF-Token';

export type AuthStrategy = 'bearer' | 'cookie';

const parseAuthStrategy = (value: string | undefined): AuthStrategy => {
    const normalized = value?.trim().toLowerCase();
    return normalized === 'cookie' ? 'cookie' : DEFAULT_AUTH_STRATEGY;
};

export const API_BASE_URL =
    (import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL)?.trim() || DEFAULT_API_BASE_URL;

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '';
export const AUTH_STRATEGY = parseAuthStrategy(import.meta.env.VITE_AUTH_STRATEGY);
export const USE_HTTP_ONLY_AUTH_COOKIE = AUTH_STRATEGY === 'cookie';
export const CSRF_COOKIE_NAME = import.meta.env.VITE_CSRF_COOKIE_NAME?.trim() || DEFAULT_CSRF_COOKIE_NAME;
export const CSRF_HEADER_NAME = import.meta.env.VITE_CSRF_HEADER_NAME?.trim() || DEFAULT_CSRF_HEADER_NAME;

export const STORAGE_KEYS = {
    authToken: 'rentify.auth.token',
    googleAvatarUrl: 'rentify.auth.googleAvatarUrl',
    googleAvatarDisabled: 'rentify.auth.googleAvatarDisabled',
    themeMode: 'rentify.theme.mode',
} as const;
