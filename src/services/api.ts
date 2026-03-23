import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import {
    API_BASE_URL,
    CSRF_COOKIE_NAME,
    CSRF_HEADER_NAME,
    USE_HTTP_ONLY_AUTH_COOKIE,
} from '../config/env';
import { getCookieValue } from '../utils/cookies';
import { clearAuthToken, getAuthToken } from './storage';

export const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired';
const UNSAFE_HTTP_METHODS = new Set(['post', 'put', 'patch', 'delete']);

const setRequestHeader = (
    config: InternalAxiosRequestConfig,
    headerName: string,
    headerValue: string,
) => {
    const headers = config.headers instanceof AxiosHeaders
        ? config.headers
        : new AxiosHeaders(config.headers);

    headers.set(headerName, headerValue);
    config.headers = headers;
};

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: USE_HTTP_ONLY_AUTH_COOKIE,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        setRequestHeader(config, 'X-Requested-With', 'XMLHttpRequest');

        if (USE_HTTP_ONLY_AUTH_COOKIE) {
            const method = config.method?.toLowerCase();
            if (method && UNSAFE_HTTP_METHODS.has(method)) {
                const csrfToken = getCookieValue(CSRF_COOKIE_NAME);
                if (csrfToken) {
                    setRequestHeader(config, CSRF_HEADER_NAME, csrfToken);
                }
            }
            return config;
        }

        const token = getAuthToken();
        if (token) {
            setRequestHeader(config, 'Authorization', `Bearer ${token}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const requestUrl = typeof error.config?.url === 'string' ? error.config.url : '';
        const isAuthRequest =
            requestUrl.includes('/sessions') ||
            requestUrl.endsWith('/users') ||
            requestUrl.includes('/sessions/google');
        const isSessionProbeRequest = requestUrl.includes('/users/me');

        if (error.response?.status === 401 && !isAuthRequest && !(USE_HTTP_ONLY_AUTH_COOKIE && isSessionProbeRequest)) {
            clearAuthToken();
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
            }
        }
        return Promise.reject(error);
    }
);

export default api;
