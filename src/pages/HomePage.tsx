import { Link } from 'react-router-dom';
import { API_BASE_URL } from '@/config/env';

const HomePage = () => {
  const apiUrl = API_BASE_URL;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-12">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600">Rentify</p>
        <h1 className="max-w-2xl text-4xl font-bold leading-tight text-slate-900">
          Платформа оренди житла для довгострокових і короткострокових бронювань
        </h1>
        <p className="mt-5 max-w-2xl text-base text-slate-600">
          Простий старт фронтенду: роутинг, авторизація, API-клієнт і DTO типи вже підключені.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/login"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Увійти
          </Link>
          <Link
            to="/register"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Зареєструватися
          </Link>
        </div>

        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
          <span className="font-medium text-slate-900">API URL:</span> {apiUrl || 'не задано'}
        </div>
      </div>
    </main>
  );
};

export default HomePage;
