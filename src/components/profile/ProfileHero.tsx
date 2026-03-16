import { BellRing, CalendarDays, Heart, LayoutGrid, Wallet } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { formatDate, formatMoney } from '@/utils/profileFormatters';
import type { ProfileHeroProps } from './ProfileHero.types';


export const ProfileHero = ({
  avatarSrc,
  avatarLoadFailed,
  onAvatarError,
  initials,
  fullName,
  email,
  createdAt,
  walletBalance,
  walletCurrency,
  propertiesCount,
  activePropertiesInPreview,
  favoritesCount,
  bookingsCount,
  paidBookingsCount,
  walletTopUpPending = false,
  onWalletTopUp,
}: ProfileHeroProps) => (
  <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <div className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full bg-blue-100/70 blur-3xl" />
    <div className="pointer-events-none absolute -right-16 -bottom-20 h-52 w-52 rounded-full bg-cyan-100/70 blur-3xl" />

    <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
      <div className="space-y-5">
        <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
          Особистий кабінет
        </p>
        <div className="flex items-center gap-4">
          {avatarSrc && !avatarLoadFailed ? (
            <img
              src={avatarSrc}
              alt={fullName}
              className="h-20 w-20 rounded-2xl border border-slate-200 object-cover shadow-sm"
              onError={onAvatarError}
            />
          ) : (
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-black text-blue-700 shadow-sm">
              {initials}
            </span>
          )}
          <div>
            <h1 className="text-3xl font-black text-slate-900">{fullName}</h1>
            <p className="text-sm text-slate-600">{email}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
              <CalendarDays size={12} />
              На платформі з {formatDate(createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <MetricCard
          title="Баланс"
          value={formatMoney(walletBalance, walletCurrency)}
          hint="Доступно на гаманці"
          icon={Wallet}
          actionLabel="Поповнити"
          actionLoading={walletTopUpPending}
          onAction={onWalletTopUp}
        />
        <MetricCard
          title="Оголошення"
          value={String(propertiesCount)}
          hint={`${activePropertiesInPreview} активних у прев’ю`}
          icon={LayoutGrid}
        />
        <MetricCard title="Обране" value={String(favoritesCount)} hint="Збережені пропозиції" icon={Heart} />
        <MetricCard title="Бронювання" value={String(bookingsCount)} hint={`${paidBookingsCount} оплачених бронювань`} icon={BellRing} />
      </div>
    </div>
  </section>
);
