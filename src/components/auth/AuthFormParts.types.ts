import type { InputHTMLAttributes, ReactNode } from 'react';

export interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
}

export interface AuthPasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  showPassword: boolean;
  onToggleShow: () => void;
  error?: string;
  trailingAction?: ReactNode;
}
