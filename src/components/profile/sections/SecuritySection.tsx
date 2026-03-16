import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { ACCOUNT_DELETE_CONFIRM_WORD } from '@/constants/profileSecurity';
import { Notice } from '../Notice';
import type { SecuritySectionProps } from './SecuritySection.types';

export const SecuritySection = ({
  passwordForm,
  passwordNotice,
  passwordSaving,
  accountDeleting,
  onPasswordFieldChange,
  onSubmit,
  onDeleteAccount,
}: SecuritySectionProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmWord, setConfirmWord] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isConfirmWordValid = confirmWord.trim().toLowerCase() === ACCOUNT_DELETE_CONFIRM_WORD;

  const handleDelete = async () => {
    setDeleteError(null);

    if (!isConfirmWordValid) {
      setDeleteError(`Введіть слово "${ACCOUNT_DELETE_CONFIRM_WORD}".`);
      return;
    }

    try {
      await onDeleteAccount();
      setIsDeleteModalOpen(false);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Не вдалося видалити акаунт.');
    }
  };

  return (
    <div className="space-y-6">
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

      <section className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-rose-600" />
          <h3 className="text-lg font-bold text-rose-800">Видалення акаунта</h3>
        </div>
        <p className="mt-2 text-sm text-rose-700">
          Після видалення акаунта доступ до профілю буде втрачено назавжди.
        </p>
        <button
          type="button"
          onClick={() => {
            setDeleteError(null);
            setConfirmWord('');
            setIsDeleteModalOpen(true);
          }}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          Видалити акаунт
        </button>
      </section>

      {isDeleteModalOpen ? (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h4 className="text-lg font-bold text-slate-900">Підтвердження видалення</h4>
            <p className="mt-2 text-sm text-slate-600">
              Введіть слово <span className="font-semibold text-slate-900">{ACCOUNT_DELETE_CONFIRM_WORD}</span>.
            </p>

            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="mb-1.5 block font-semibold text-slate-700">Слово підтвердження</span>
                <input
                  type="text"
                  value={confirmWord}
                  onChange={(event) => setConfirmWord(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  placeholder={ACCOUNT_DELETE_CONFIRM_WORD}
                />
              </label>
            </div>

            {deleteError ? <p className="mt-3 text-sm text-rose-700">{deleteError}</p> : null}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={accountDeleting}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={accountDeleting || !isConfirmWordValid}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
              >
                {accountDeleting ? 'Видалення...' : 'Підтвердити видалення'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
