export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    google: '/auth/google',
  },
  users: {
    profile: '/users/profile',
  },
} as const;
