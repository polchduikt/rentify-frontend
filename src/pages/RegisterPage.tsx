import { useCallback, useState } from 'react';
import { ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
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
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=90';

const PERKS = [
  'Безкоштовне розміщення оголошень',
  'Прямий контакт з власниками',
  'Перевірені обʼєкти нерухомості',
  'Захищені угоди та платежі',
] as const;

const STRENGTH_LABEL = ['', 'Слабкий', 'Середній', 'Добрий', 'Надійний'] as const;
const STRENGTH_COLOR = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500'] as const;

const phonePattern = /^\+?[0-9]{10,15}$/;

const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'Імʼя має містити щонайменше 2 символи')
    .max(50, 'Імʼя занадто довге'),
  lastName: z
    .string()
    .trim()
    .min(2, 'Прізвище має містити щонайменше 2 символи')
    .max(50, 'Прізвище занадто довге'),
  phone: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || phonePattern.test(value), 'Телефон має бути у форматі +XXXXXXXXXX'),
  email: z.string().trim().email('Введіть коректну email адресу'),
  password: z
    .string()
    .min(8, 'Пароль має містити щонайменше 8 символів')
    .max(100, 'Пароль занадто довгий'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const getPasswordStrength = (value: string): 0 | 1 | 2 | 3 | 4 => {
  if (value.length === 0) {
    return 0;
  }

  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser, loginWithGoogle } = useAuth();
  const [submitError, setSubmitError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const redirectPath =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      password: '',
    },
  });

  const passwordValue = watch('password');
  const passwordStrength = getPasswordStrength(passwordValue);

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitError('');

    try {
      await registerUser({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: values.phone.trim() || undefined,
        email: values.email.trim(),
        password: values.password,
      });
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Помилка реєстрації'));
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
        setSubmitError(getApiErrorMessage(error, 'Помилка реєстрації через Google'));
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
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 via-blue-800/30 to-slate-900/70" />
            <div className="relative z-10 max-w-md">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Приєднуйтесь до спільноти</p>
              <h2 className="mb-5 text-[1.75rem] font-bold leading-tight text-white">Оренда без зайвих клопотів</h2>
              <div className="space-y-2.5">
                {PERKS.map((perk) => (
                  <div key={perk} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/25">
                      <Check size={11} className="text-emerald-400" />
                    </div>
                    <span className="text-sm text-white/85">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex flex-1 items-center justify-center bg-white px-6 py-8 sm:px-10 lg:px-14">
            <div className="w-full max-w-[420px]">
              <div className="mb-7">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-blue-600">Новий акаунт</p>
                <h1 className="text-[1.75rem] font-bold leading-tight text-slate-900">Реєстрація</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Вже маєте акаунт?{' '}
                  <Link to={ROUTES.login} className="font-semibold text-blue-600 hover:underline">
                    Увійти
                  </Link>
                </p>
              </div>

              {submitError && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Імʼя
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      placeholder="Іван"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      {...register('firstName')}
                    />
                    {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Прізвище
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Петренко"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      {...register('lastName')}
                    />
                    {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Телефон <span className="text-xs font-normal text-slate-400">(необовʼязково)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+380XXXXXXXXX"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    {...register('phone')}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
                </div>

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
                  <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Пароль
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
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

                  {passwordValue && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full ${
                              passwordStrength >= level ? STRENGTH_COLOR[passwordStrength] : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">
                        Надійність: <span className="font-medium text-slate-700">{STRENGTH_LABEL[passwordStrength]}</span>
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || googleLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                      Створюємо акаунт...
                    </>
                  ) : (
                    <>
                      Створити акаунт <ArrowRight size={16} />
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
                Реєструючись, ви погоджуєтесь з{' '}
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

export default RegisterPage;
