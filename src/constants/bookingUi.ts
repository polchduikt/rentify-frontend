import type { BookingStatus, PaymentStatus } from '@/types/enums';

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  CREATED: 'В обробці',
  CONFIRMED: 'Підтверджено',
  IN_PROGRESS: 'У процесі',
  COMPLETED: 'Завершено',
  CANCELLED: 'Скасовано',
  REJECTED: 'Відхилено',
};

export const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  CREATED: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-violet-100 text-violet-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-rose-100 text-rose-800',
  REJECTED: 'bg-rose-100 text-rose-800',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Очікує',
  PAID: 'Оплачено',
  FAILED: 'Помилка',
  REFUNDED: 'Повернено',
  CANCELLED: 'Скасовано',
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  PAID: 'bg-emerald-100 text-emerald-800',
  FAILED: 'bg-rose-100 text-rose-800',
  REFUNDED: 'bg-slate-200 text-slate-700',
  CANCELLED: 'bg-slate-200 text-slate-700',
};

export const FALLBACK_PROPERTY_IMAGE =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80';
