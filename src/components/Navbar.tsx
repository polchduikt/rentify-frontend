import { useState } from 'react';
import { Home, LogOut, Menu, PlusSquare, Search, User, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { APP_CONTENT } from '@/constants/appContent';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/config/routes';

const NAV_LINKS = [
  { to: ROUTES.home, label: 'Головна', icon: Home },
  { to: ROUTES.search, label: 'Пошук', icon: Search },
] as const;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) =>
    path === ROUTES.home ? location.pathname === ROUTES.home : location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.login);
  };

  const initials = user?.firstName?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? 'U';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={ROUTES.home} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Home size={16} />
          </span>
          <span className="text-xl font-bold text-slate-900">{APP_CONTENT.companyName}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                isActive(to) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to={ROUTES.createProperty}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
          >
            <PlusSquare size={16} /> Додати оголошення
          </Link>

          <Link
            to={ROUTES.profile}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Аватар" className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {initials}
              </span>
            )}
            <span className="max-w-[100px] truncate">{user?.firstName ?? 'Профіль'}</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            title="Вийти"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Перемкнути меню"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="space-y-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive(to) ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
            <Link
              to={ROUTES.createProperty}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
            >
              <PlusSquare size={16} />
              Додати оголошення
            </Link>
            <Link
              to={ROUTES.profile}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <User size={16} />
              Профіль
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} />
              Вийти
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
