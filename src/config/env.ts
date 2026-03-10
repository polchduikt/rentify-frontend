const DEFAULT_API_BASE_URL = '/api/v1';

export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

export const STORAGE_KEYS = {
    authToken: 'rentify.auth.token',
} as const;
