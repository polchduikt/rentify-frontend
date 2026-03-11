import { STORAGE_KEYS } from '../config/env';

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
