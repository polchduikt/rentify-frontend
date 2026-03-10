import { useCallback, useState } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { GOOGLE_CLIENT_ID } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';
import { getApiErrorMessage } from '@/utils/errors';

const PHOTO_URL =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=90';

const FEATURED_CITIES = ['Київ', 'Львів', 'Одеса', 'Харків'] as const;

const loginSchema = z.object({
  email: z.string().trim().email('Введіть коректну email адресу'),
  password: z
    .string()
    .min(8, 'Пароль має містити щонайменше 8 символів')
    .max(100, 'Пароль занадто довгий'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const [submitError, setSubmitError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const redirectPath =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError('');
    try {
      await login(values);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Невірний email або пароль'));
    }
  };

  const onGoogleCredential = useCallback(
    async (idToken: string) => {
      setSubmitError('');
      setGoogleLoading(true);
      try {
        await loginWithGoogle({ idToken });
        navigate(redirectPath, { replace: true });
      } catch (error) {
        setSubmitError(getApiErrorMessage(error, 'Помилка входу через Google'));
      } finally {
        setGoogleLoading(false);
      }
    },
    [loginWithGoogle, navigate, redirectPath]
  );

  return (
    <main className="bg-slate-100 px-4 pb-8 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1400px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="flex min-h-[calc(100vh-13rem)]">
          <aside className="relative hidden w-[52%] shrink-0 lg:flex lg:flex-col lg:justify-end lg:p-10 xl:p-12">
            <img src={PHOTO_URL} alt="Apartment interior" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/65 via-slate-900/35 to-slate-900/75" />
            <div className="relative z-10 max-w-md">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                Понад 2 000 перевірених оголошень
              </p>
              <h2 className="mb-5 text-[1.75rem] font-bold leading-tight text-white">Знайдіть житло, яке стане домом</h2>
              <div className="flex flex-wrap items-center gap-2">
                {FEATURED_CITIES.map((city) => (
                  <span
                    key={city}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white/85 backdrop-blur-sm"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex flex-1 items-center justify-center bg-white px-6 py-8 sm:px-10 lg:px-14">
            <div className="w-full max-w-[420px]">
              <div className="mb-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-blue-600">З поверненням</p>
                <h1 className="text-[1.75rem] font-bold leading-tight text-slate-900">Увійдіть до акаунту</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Немає акаунту?{' '}
                  <Link to={ROUTES.register} className="font-semibold text-blue-600 hover:underline">
                    Зареєструватися
                  </Link>
                </p>
              </div>

              {submitError && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Електронна пошта
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    {...register('email')}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-slate-700">
                      Пароль
                    </label>
                    <button type="button" className="text-xs font-medium text-blue-600 hover:underline">
                      Забули пароль?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Мінімум 8 символів"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || googleLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                      Входимо...
                    </>
                  ) : (
                    <>
                      Увійти <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs uppercase tracking-wide text-slate-400">або</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <GoogleSignInButton
                clientId={GOOGLE_CLIENT_ID}
                onCredential={onGoogleCredential}
                onError={setSubmitError}
                disabled={isSubmitting || googleLoading}
              />

              <p className="mt-6 text-center text-xs text-slate-400">
                Продовжуючи, ви погоджуєтесь з{' '}
                <Link to={ROUTES.terms} className="underline hover:text-slate-600">
                  умовами використання
                </Link>{' '}
                та{' '}
                <Link to={ROUTES.privacy} className="underline hover:text-slate-600">
                  політикою конфіденційності
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
