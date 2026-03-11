import type { InputHTMLAttributes, ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
}

export const AuthField = ({ label, error, hint, className = '', id, ...props }: AuthFieldProps) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
      {hint ? <span className="ml-1 text-xs font-normal text-slate-400">{hint}</span> : null}
    </label>
    <input
      id={id}
      className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
    {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
  </div>
);

interface AuthPasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  showPassword: boolean;
  onToggleShow: () => void;
  error?: string;
  trailingAction?: ReactNode;
}

export const AuthPasswordField = ({
  label,
  showPassword,
  onToggleShow,
  error,
  trailingAction,
  className = '',
  id,
  ...props
}: AuthPasswordFieldProps) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {trailingAction}
    </div>
    <div className="relative">
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
    {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
  </div>
);

export const AuthErrorBanner = ({ message }: { message: string }) =>
  message ? (
    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
  ) : null;

export const AuthDivider = () => (
  <div className="my-5 flex items-center gap-3">
    <div className="h-px flex-1 bg-slate-200" />
    <span className="text-xs uppercase tracking-wide text-slate-400">або</span>
    <div className="h-px flex-1 bg-slate-200" />
  </div>
);
