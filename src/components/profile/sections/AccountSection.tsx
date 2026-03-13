import { Camera, Trash2 } from 'lucide-react';
import { Notice } from '../Notice';
import type { AccountSectionProps } from './AccountSection.types';

export const AccountSection = ({
  profile,
  fullName,
  initials,
  avatarSrc,
  avatarLoadFailed,
  onAvatarError,
  avatarUploading,
  avatarDeleting,
  avatarNotice,
  profileNotice,
  profileForm,
  isProfileDirty,
  profileSaving,
  onAvatarUpload,
  onAvatarDelete,
  onProfileFieldChange,
  onSubmit,
  onReset,
}: AccountSectionProps) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-xl font-bold text-slate-900">Налаштування акаунту</h2>
    <p className="mt-1 text-sm text-slate-500">Оновіть особисті дані та керуйте аватаром профілю.</p>

    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-3">
        {avatarSrc && !avatarLoadFailed ? (
          <img src={avatarSrc} alt={fullName} className="h-16 w-16 rounded-xl object-cover" onError={onAvatarError} />
        ) : (
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100 text-xl font-bold text-blue-700">
            {initials}
          </span>
        )}

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          <Camera size={14} />
          {avatarUploading ? 'Завантаження...' : 'Оновити аватар'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (!file) {
                return;
              }
              onAvatarUpload(file);
            }}
          />
        </label>

        <button
          type="button"
          onClick={onAvatarDelete}
          disabled={!profile.avatarUrl || avatarDeleting || avatarUploading}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={14} />
          {avatarDeleting ? 'Видалення...' : 'Видалити аватар'}
        </button>
      </div>
      {avatarNotice ? (
        <div className="mt-3">
          <Notice type={avatarNotice.type} message={avatarNotice.message} />
        </div>
      ) : null}
    </div>

    <form onSubmit={onSubmit} className="mt-5 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1.5 block font-semibold text-slate-700">Ім’я</span>
          <input
            value={profileForm.firstName}
            onChange={(event) => onProfileFieldChange('firstName', event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block font-semibold text-slate-700">Прізвище</span>
          <input
            value={profileForm.lastName}
            onChange={(event) => onProfileFieldChange('lastName', event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1.5 block font-semibold text-slate-700">Телефон</span>
          <input
            value={profileForm.phone}
            onChange={(event) => onProfileFieldChange('phone', event.target.value)}
            placeholder="+380..."
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block font-semibold text-slate-700">Email</span>
          <input
            value={profile.email}
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-slate-500"
          />
        </label>
      </div>

      {profileNotice ? <Notice type={profileNotice.type} message={profileNotice.message} /> : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={!isProfileDirty || profileSaving}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {profileSaving ? 'Зберігаю...' : 'Зберегти зміни'}
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={!isProfileDirty || profileSaving}
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Скасувати
        </button>
      </div>
    </form>
  </section>
);
