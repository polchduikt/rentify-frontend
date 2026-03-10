import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '@/config/env';
import { useAuth } from '@/contexts/AuthContext';

const HomePage = () => {
  const { user, logout } = useAuth();

  const fullName = useMemo(() => {
    if (!user) {
      return 'Guest';
    }
    return `${user.firstName} ${user.lastName}`.trim();
  }, [user]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wider text-blue-600">Rentify</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Welcome, {fullName}</h1>
          <p className="mt-3 text-slate-600">
            Authentication is active. You can now build protected features on top of this baseline.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Profile</h2>
            <p className="mt-3 text-sm text-slate-700">Email: {user?.email ?? 'n/a'}</p>
            <p className="mt-1 text-sm text-slate-700">Plan: {user?.subscriptionPlan ?? 'FREE'}</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">API</h2>
            <p className="mt-3 break-all text-sm text-slate-700">{API_BASE_URL}</p>
          </article>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={logout}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Logout
          </button>
          <Link
            to="/login"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
