import axios from 'axios';
import { API_BASE_URL } from '../config/env';
import { clearAuthToken, getAuthToken } from './storage';

export const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
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
        if (error.response?.status === 401) {
            clearAuthToken();
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
            }
        }
        return Promise.reject(error);
    }
);

export default api;
