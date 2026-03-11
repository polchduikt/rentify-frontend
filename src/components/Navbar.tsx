import { useEffect, useMemo, useState } from 'react';
import { Bell, Heart, Home, Menu, Plus, User, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { APP_CONTENT } from '@/constants/appContent';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';
import { getGoogleAvatarUrl } from '@/services/storage';
import { resolveAvatarUrl } from '@/utils/avatar';

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const isSearchActive = location.pathname.startsWith(ROUTES.search);
  const initials = user?.firstName?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? 'U';
  const avatarSrc = useMemo(() => {
    const direct = resolveAvatarUrl(user?.avatarUrl);
    if (direct) {
      return direct;
    }
    return resolveAvatarUrl(getGoogleAvatarUrl());
  }, [user?.avatarUrl]);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarSrc]);

  const desktopIconButtonClass =
    'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-5">
          <Link to={ROUTES.home} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Home size={18} />
            </span>
            <span className="text-[28px] font-black leading-none text-slate-900">{APP_CONTENT.companyName}</span>
          </Link>

          <Link
            to={ROUTES.search}
            className={`hidden rounded-lg px-3 py-2 text-sm font-semibold transition md:inline-flex ${
              isSearchActive ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Орендувати
          </Link>
        </div>

        {isAuthenticated ? (
          <div className="hidden items-center gap-2 md:flex">
            <Link to={ROUTES.profile} className={desktopIconButtonClass} aria-label="Сповіщення">
              <Bell size={17} />
            </Link>
            <Link to={ROUTES.profile} className={desktopIconButtonClass} aria-label="Улюблене">
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
            <Link
              to={ROUTES.login}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
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

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Перемкнути меню"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="space-y-1">
            <Link
              to={ROUTES.search}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                isSearchActive ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Орендувати
            </Link>
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
                to={ROUTES.profile}
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
