import { STORAGE_KEYS } from '../config/env';

export type ThemeMode = 'light' | 'dark';

export const getAuthToken = (): string | null =>
    localStorage.getItem(STORAGE_KEYS.authToken);

export const setAuthToken = (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.authToken, token);
};

export const clearAuthToken = (): void => {
    localStorage.removeItem(STORAGE_KEYS.authToken);
};

export const getGoogleAvatarUrl = (): string | null =>
    localStorage.getItem(STORAGE_KEYS.googleAvatarUrl);

export const setGoogleAvatarUrl = (avatarUrl: string): void => {
    localStorage.setItem(STORAGE_KEYS.googleAvatarUrl, avatarUrl);
};

export const clearGoogleAvatarUrl = (): void => {
    localStorage.removeItem(STORAGE_KEYS.googleAvatarUrl);
};

const normalizeUserId = (userId?: number | null): number | null => {
    if (typeof userId !== 'number' || !Number.isFinite(userId) || userId <= 0) {
        return null;
    }
    return userId;
};

export const isGoogleAvatarFallbackDisabled = (userId?: number | null): boolean => {
    const value = localStorage.getItem(STORAGE_KEYS.googleAvatarDisabled);
    if (!value) {
        return false;
    }

    if (value === '1') {
        return true;
    }

    const normalizedUserId = normalizeUserId(userId);
    return normalizedUserId != null && value === String(normalizedUserId);
};

export const setGoogleAvatarFallbackDisabled = (disabled: boolean, userId?: number | null): void => {
    if (disabled) {
        const normalizedUserId = normalizeUserId(userId);
        localStorage.setItem(
            STORAGE_KEYS.googleAvatarDisabled,
            normalizedUserId != null ? String(normalizedUserId) : '1',
        );
    } else {
        localStorage.removeItem(STORAGE_KEYS.googleAvatarDisabled);
    }
};

export const getThemeMode = (): ThemeMode | null => {
    const value = localStorage.getItem(STORAGE_KEYS.themeMode);
    if (value === 'light' || value === 'dark') {
        return value;
    }
    return null;
};

export const setThemeMode = (mode: ThemeMode): void => {
    localStorage.setItem(STORAGE_KEYS.themeMode, mode);
};
