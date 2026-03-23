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
export const NETWORK_OFFLINE_EVENT = 'network:offline';
const UNSAFE_HTTP_METHODS = new Set(['post', 'put', 'patch', 'delete']);
const SNAKE_CASE_PART = /_([a-z])/g;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    Object.prototype.toString.call(value) === '[object Object]';

const toCamelCase = (value: string): string =>
    value.replace(SNAKE_CASE_PART, (_, char: string) => char.toUpperCase());

const camelCaseKeysDeep = (value: unknown): unknown => {
    if (Array.isArray(value)) {
        return value.map(camelCaseKeysDeep);
    }

    if (!isPlainObject(value)) {
        return value;
    }

    return Object.entries(value).reduce<Record<string, unknown>>((acc, [key, nestedValue]) => {
        acc[toCamelCase(key)] = camelCaseKeysDeep(nestedValue);
        return acc;
    }, {});
};

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

const defaultResponseTransformers = Array.isArray(api.defaults.transformResponse)
    ? api.defaults.transformResponse
    : api.defaults.transformResponse
        ? [api.defaults.transformResponse]
        : [];

api.defaults.transformResponse = [
    ...defaultResponseTransformers,
    (data) => camelCaseKeysDeep(data),
];

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
        if (!error.response && typeof window !== 'undefined') {
            window.dispatchEvent(new Event(NETWORK_OFFLINE_EVENT));
        }

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
