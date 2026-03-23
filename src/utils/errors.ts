import { isAxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

const toNonEmptyMessage = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const resolveApiPayloadMessage = (payload: unknown): string | null => {
  if (typeof payload === 'string') {
    return toNonEmptyMessage(payload);
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;
  return (
    toNonEmptyMessage(record.message) ??
    toNonEmptyMessage(record.error) ??
    (Array.isArray(record.errors)
      ? record.errors.map((item) => toNonEmptyMessage(item)).find((item) => item != null) ?? null
      : null)
  );
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return (
      resolveApiPayloadMessage(error.response?.data) ??
      toNonEmptyMessage(error.message) ??
      fallback
    );
  }

  if (error instanceof Error) {
    return toNonEmptyMessage(error.message) ?? fallback;
  }

  return toNonEmptyMessage(error) ?? fallback;
};
