import { useEffect, useMemo, useState } from 'react';
import { Bell, Heart, Menu, Moon, Plus, Sun, User, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { APP_CONTENT } from '@/constants/appContent';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { resolveAvatarUrl } from '@/utils/avatar';

const INFO_NAV_LINKS = [
  { label: 'Про нас', to: ROUTES.about },
  { label: 'Контакти', to: ROUTES.contacts },
  { label: 'Підтримка', to: ROUTES.support },
] as const;
const BRAND_LOGO_PATH = '/rentify-logo.svg';

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const isSearchActive = location.pathname.startsWith(ROUTES.search);
  const initials =
    `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`.toUpperCase() || 'U';
  const avatarSrc = useMemo(() => resolveAvatarUrl(user?.avatarUrl), [user?.avatarUrl]);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarSrc]);

  const desktopIconButtonClass =
    'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100';
  const themeButtonLabel = theme === 'dark' ? 'Світла тема' : 'Темна тема';

  return (
    <header className="rentify-navbar sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-5">
          <Link to={ROUTES.home} className="flex items-center gap-2">
            <img src={BRAND_LOGO_PATH} alt="Логотип Rentify" className="h-9 w-9 rounded-lg object-cover" loading="lazy" />
            <span className="text-[28px] font-black leading-none text-slate-900">{APP_CONTENT.companyName}</span>
          </Link>

          <Link
            to={ROUTES.search}
            className={`hidden items-center rounded-xl border px-4 py-2.5 text-base font-semibold transition md:inline-flex ${
              isSearchActive
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100'
            }`}
          >
            Орендувати
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {INFO_NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {isAuthenticated ? (
          <div className="hidden items-center gap-2 md:flex">
            <button type="button" onClick={toggleTheme} className={desktopIconButtonClass} aria-label={themeButtonLabel}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <Link to={ROUTES.profile} className={desktopIconButtonClass} aria-label="Сповіщення">
              <Bell size={17} />
            </Link>
            <Link to={ROUTES.favorites} className={desktopIconButtonClass} aria-label="Улюблене">
              <Heart size={17} />
            </Link>

            <Link
              to={ROUTES.profile}
              className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-slate-200 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              {avatarSrc && !avatarLoadFailed ? (
                <img
                  src={avatarSrc}
                  alt="Аватар"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarLoadFailed(true)}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-blue-100 text-sm font-bold text-blue-700">
                  {initials}
                </span>
              )}
            </Link>

            <Link
              to={ROUTES.createProperty}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              <Plus size={16} />
              Виставити оголошення
            </Link>
          </div>
        ) : (
          <div className="hidden items-center gap-2 md:flex">
            <button type="button" onClick={toggleTheme} className={desktopIconButtonClass} aria-label={themeButtonLabel}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link to={ROUTES.login} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              Вхід
            </Link>
            <Link
              to={ROUTES.register}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Реєстрація
            </Link>
          </div>
        )}

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label={themeButtonLabel}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Перемкнути меню"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="space-y-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {themeButtonLabel}
            </button>

            <Link
              to={ROUTES.search}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                isSearchActive ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Орендувати
            </Link>

            {INFO_NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {isAuthenticated ? (
            <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
              <Link
                to={ROUTES.profile}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <Bell size={16} />
                Сповіщення
              </Link>
              <Link
                to={ROUTES.favorites}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <Heart size={16} />
                Улюблене
              </Link>
              <Link
                to={ROUTES.profile}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <User size={16} />
                Профіль
              </Link>
              <Link
                to={ROUTES.createProperty}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                <Plus size={16} />
                Виставити оголошення
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
              <Link
                to={ROUTES.login}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Вхід
              </Link>
              <Link
                to={ROUTES.register}
                onClick={() => setOpen(false)}
                className="block rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Реєстрація
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
