import { z } from 'zod';

const phonePattern = /^\+?[0-9]{10,15}$/;

export const loginSchema = z.object({
  email: z.string().trim().email('Введіть коректну email адресу'),
  password: z.string().min(1, 'Введіть пароль'),
});

export const registerSchema = z.object({
  firstName: z.string().trim().min(2, 'Ім’я має містити щонайменше 2 символи').max(50, 'Ім’я занадто довге'),
  lastName: z.string().trim().min(2, 'Прізвище має містити щонайменше 2 символи').max(50, 'Прізвище занадто довге'),
  phone: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || phonePattern.test(value), 'Телефон має бути у форматі +XXXXXXXXXX'),
  email: z.string().trim().email('Введіть коректну email адресу'),
  password: z.string().min(8, 'Пароль має містити щонайменше 8 символів').max(100, 'Пароль занадто довгий'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

export const getPasswordStrength = (value: string): PasswordStrength => {
  if (value.length === 0) {
    return 0;
  }

  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  return Math.min(score, 4) as PasswordStrength;
};

export const getAuthRedirectPath = (locationState: unknown, fallback = '/') => {
  const state = locationState as { from?: { pathname?: string } } | null;
  return state?.from?.pathname ?? fallback;
};
