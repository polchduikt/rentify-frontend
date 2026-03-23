import { STORAGE_KEYS, USE_HTTP_ONLY_AUTH_COOKIE } from '../config/env';

export type ThemeMode = 'light' | 'dark';

const GOOGLE_AVATAR_DISABLED_GLOBALLY = '1';

const getStorageItem = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

const setStorageItem = (key: string, value: string): void => {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Ignore storage write errors to keep app operational in restricted browser modes.
    }
};

const removeStorageItem = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch {
        // Ignore storage remove errors to keep app operational in restricted browser modes.
    }
};

export const getAuthToken = (): string | null => {
    if (USE_HTTP_ONLY_AUTH_COOKIE) {
        return null;
    }
    return getStorageItem(STORAGE_KEYS.authToken);
};

export const setAuthToken = (token: string | null): void => {
    if (USE_HTTP_ONLY_AUTH_COOKIE) {
        return;
    }

    if (!token) {
        removeStorageItem(STORAGE_KEYS.authToken);
        return;
    }

    setStorageItem(STORAGE_KEYS.authToken, token);
};

export const clearAuthToken = (): void => {
    removeStorageItem(STORAGE_KEYS.authToken);
};

export const getGoogleAvatarUrl = (): string | null =>
    getStorageItem(STORAGE_KEYS.googleAvatarUrl);

export const setGoogleAvatarUrl = (avatarUrl: string): void => {
    setStorageItem(STORAGE_KEYS.googleAvatarUrl, avatarUrl);
};

export const clearGoogleAvatarUrl = (): void => {
    removeStorageItem(STORAGE_KEYS.googleAvatarUrl);
};

const normalizeUserId = (userId?: number | null): number | null => {
    if (typeof userId !== 'number' || !Number.isFinite(userId) || userId <= 0) {
        return null;
    }
    return userId;
};

export const isGoogleAvatarFallbackDisabled = (userId?: number | null): boolean => {
    const value = getStorageItem(STORAGE_KEYS.googleAvatarDisabled);
    if (!value) {
        return false;
    }

    if (value === GOOGLE_AVATAR_DISABLED_GLOBALLY) {
        return true;
    }

    const normalizedUserId = normalizeUserId(userId);
    return normalizedUserId != null && value === String(normalizedUserId);
};

export const setGoogleAvatarFallbackDisabled = (disabled: boolean, userId?: number | null): void => {
    if (disabled) {
        const normalizedUserId = normalizeUserId(userId);
        setStorageItem(
            STORAGE_KEYS.googleAvatarDisabled,
            normalizedUserId != null ? String(normalizedUserId) : GOOGLE_AVATAR_DISABLED_GLOBALLY,
        );
    } else {
        removeStorageItem(STORAGE_KEYS.googleAvatarDisabled);
    }
};

export const getThemeMode = (): ThemeMode | null => {
    const value = getStorageItem(STORAGE_KEYS.themeMode);
    if (value === 'light' || value === 'dark') {
        return value;
    }
    return null;
};

export const setThemeMode = (mode: ThemeMode): void => {
    setStorageItem(STORAGE_KEYS.themeMode, mode);
};
