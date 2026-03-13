import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileText,
  Heart,
  LogOut,
  MessageCircle,
  PlusSquare,
  Settings2,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PROFILE_BOOKINGS_NAV_ITEMS,
  PROFILE_PROMOTIONS_NAV_ITEMS,
  PROFILE_PROPERTIES_NAV_ITEMS,
  PROFILE_SETTINGS_NAV_ITEMS,
  isBookingsSection,
  isPromotionsSection,
} from '@/constants/profileNavigation';
import { ROUTES } from '@/config/routes';
import type { ProfileSidebarNavProps } from './ProfileSidebarNav.types';


export const ProfileSidebarNav = ({
  activeSection,
  isPropertiesOpen,
  isBookingsOpen,
  isPromotionsOpen,
  isSettingsOpen,
  onToggleProperties,
  onToggleBookings,
  onTogglePromotions,
  onToggleSettings,
  onSelectSection,
  onOpenChat,
  onLogout,
}: ProfileSidebarNavProps) => (
  <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Навігація</p>
      <div className="space-y-1.5 text-sm">
        <button
          type="button"
          onClick={onToggleProperties}
          className="flex w-full items-center justify-between rounded-xl bg-slate-100 px-3 py-2.5 text-left font-semibold text-slate-800"
        >
          <span className="inline-flex items-center gap-2">
            <FileText size={16} />
            Оголошення
          </span>
          <ChevronDown size={14} className={`transition ${isPropertiesOpen ? 'rotate-180' : ''}`} />
        </button>

        {isPropertiesOpen ? (
          <div className="space-y-1 rounded-2xl bg-slate-50 p-2">
            {PROFILE_PROPERTIES_NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                  activeSection === item.id ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
                <ChevronRight size={14} className={activeSection === item.id ? 'text-blue-500' : 'text-slate-400'} />
              </button>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onToggleBookings}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left font-semibold transition ${
            isBookingsSection(activeSection) || isBookingsOpen
              ? 'bg-blue-50 text-blue-700'
              : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={16} />
            Бронювання
          </span>
          <ChevronDown size={14} className={`transition ${isBookingsOpen ? 'rotate-180' : ''}`} />
        </button>

        {isBookingsOpen ? (
          <div className="space-y-1 rounded-2xl bg-slate-50 p-2">
            {PROFILE_BOOKINGS_NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                  activeSection === item.id ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
                <ChevronRight size={14} className={activeSection === item.id ? 'text-blue-500' : 'text-slate-400'} />
              </button>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onOpenChat}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-slate-700 transition hover:bg-slate-100"
        >
          <span className="inline-flex items-center gap-2">
            <MessageCircle size={16} />
            Чат
          </span>
          <ChevronRight size={14} className="text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => onSelectSection('favorites')}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
            activeSection === 'favorites' ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Heart size={16} />
            Обране
          </span>
          <ChevronRight size={14} className={activeSection === 'favorites' ? 'text-blue-500' : 'text-slate-400'} />
        </button>

        <button
          type="button"
          onClick={() => onSelectSection('payments')}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
            activeSection === 'payments' ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <CreditCard size={16} />
            Транзакції
          </span>
          <ChevronRight size={14} className={activeSection === 'payments' ? 'text-blue-500' : 'text-slate-400'} />
        </button>

        <button
          type="button"
          onClick={onTogglePromotions}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left font-semibold transition ${
            isPromotionsSection(activeSection) || isPromotionsOpen
              ? 'bg-blue-50 text-blue-700'
              : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Sparkles size={16} />
            Промо-пакети і підписки
          </span>
          <ChevronDown size={14} className={`transition ${isPromotionsOpen ? 'rotate-180' : ''}`} />
        </button>

        {isPromotionsOpen ? (
          <div className="space-y-1 rounded-2xl bg-slate-50 p-2">
            {PROFILE_PROMOTIONS_NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                  activeSection === item.id ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
                <ChevronRight size={14} className={activeSection === item.id ? 'text-blue-500' : 'text-slate-400'} />
              </button>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onToggleSettings}
          className="mt-2 flex w-full items-center justify-between rounded-xl bg-slate-100 px-3 py-2.5 text-left font-semibold text-slate-800"
        >
          <span className="inline-flex items-center gap-2">
            <Settings2 size={16} />
            Налаштування
          </span>
          <ChevronDown size={14} className={`transition ${isSettingsOpen ? 'rotate-180' : ''}`} />
        </button>

        {isSettingsOpen ? (
          <div className="space-y-1 rounded-2xl bg-slate-50 p-2">
            {PROFILE_SETTINGS_NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                  activeSection === item.id ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
                <ChevronRight size={14} className={activeSection === item.id ? 'text-blue-500' : 'text-slate-400'} />
              </button>
            ))}
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-rose-700 transition hover:bg-rose-50"
            >
              <span className="inline-flex items-center gap-2">
                <LogOut size={14} />
                Р’ихід
              </span>
              <ChevronRight size={14} className="text-rose-400" />
            </button>
          </div>
        ) : null}
      </div>
    </section>

    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Швидкі дії</p>
      <div className="space-y-2">
        <Link
          to={ROUTES.createProperty}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <PlusSquare size={16} />
          Додати оголошення
        </Link>
        <Link
          to={ROUTES.search}
          className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Перейти до пошуку
        </Link>
      </div>
    </section>
  </aside>
);
