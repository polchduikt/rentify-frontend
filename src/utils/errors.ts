import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.message ?? fallback;
};
