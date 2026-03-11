const DEFAULT_API_BASE_URL = '/api/v1';

export const API_BASE_URL =
    (import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL)?.trim() || DEFAULT_API_BASE_URL;

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '';

export const STORAGE_KEYS = {
    authToken: 'rentify.auth.token',
    googleAvatarUrl: 'rentify.auth.googleAvatarUrl',
} as const;
