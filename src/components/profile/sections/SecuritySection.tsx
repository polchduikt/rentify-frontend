import { ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import type { PasswordFormState, SectionNotice } from '@/types/profile';
import { Notice } from '../Notice';

interface SecuritySectionProps {
  passwordForm: PasswordFormState;
  passwordNotice: SectionNotice;
  passwordSaving: boolean;
  onPasswordFieldChange: (field: keyof PasswordFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const SecuritySection = ({
  passwordForm,
  passwordNotice,
  passwordSaving,
  onPasswordFieldChange,
  onSubmit,
}: SecuritySectionProps) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-2">
      <ShieldCheck size={18} className="text-emerald-600" />
      <h2 className="text-xl font-bold text-slate-900">Безпека</h2>
    </div>
    <p className="mt-1 text-sm text-slate-500">Змініть пароль для підвищення безпеки акаунту.</p>

    <form onSubmit={onSubmit} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <label className="text-sm">
        <span className="mb-1.5 block font-semibold text-slate-700">Поточний пароль</span>
        <input
          type="password"
          value={passwordForm.currentPassword}
          onChange={(event) => onPasswordFieldChange('currentPassword', event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1.5 block font-semibold text-slate-700">Новий пароль</span>
        <input
          type="password"
          value={passwordForm.newPassword}
          onChange={(event) => onPasswordFieldChange('newPassword', event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1.5 block font-semibold text-slate-700">Підтвердіть пароль</span>
        <input
          type="password"
          value={passwordForm.confirmPassword}
          onChange={(event) => onPasswordFieldChange('confirmPassword', event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <div className="sm:col-span-2 lg:col-span-3">
        {passwordNotice ? <Notice type={passwordNotice.type} message={passwordNotice.message} /> : null}
      </div>

      <div className="sm:col-span-2 lg:col-span-3">
        <button
          type="submit"
          disabled={passwordSaving}
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {passwordSaving ? 'Оновлення...' : 'Оновити пароль'}
        </button>
      </div>
    </form>
  </section>
);
