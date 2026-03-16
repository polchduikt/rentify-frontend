import { useCallback, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AuthDivider, AuthErrorBanner, AuthField, AuthPasswordField } from '@/components/auth/AuthFormParts';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { LOGIN_PAGE_HERO } from '@/constants/authUi';
import { GOOGLE_CLIENT_ID } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthRedirectPath, loginSchema, type LoginFormValues } from '@/utils/authForms';
import { getApiErrorMessage } from '@/utils/errors';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const [submitError, setSubmitError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const redirectPath = getAuthRedirectPath(location.state);

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
    <AuthPageLayout
      photoUrl={LOGIN_PAGE_HERO.photoUrl}
      imageAlt={LOGIN_PAGE_HERO.imageAlt}
      overlayClassName={LOGIN_PAGE_HERO.overlayClassName}
      leftEyebrow={LOGIN_PAGE_HERO.eyebrow}
      leftTitle={LOGIN_PAGE_HERO.title}
      leftContent={
        <div className="flex flex-wrap items-center gap-2">
          {LOGIN_PAGE_HERO.featuredCities.map((city) => (
            <span
              key={city}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white/85 backdrop-blur-sm"
            >
              {city}
            </span>
          ))}
        </div>
      }
      rightContent={
        <>
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

          <AuthErrorBanner message={submitError} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <AuthField
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              label="Електронна пошта"
              error={errors.email?.message}
              {...register('email')}
            />

            <AuthPasswordField
              id="password"
              autoComplete="current-password"
              placeholder="Введіть пароль"
              label="Пароль"
              showPassword={showPassword}
              onToggleShow={() => setShowPassword((prev) => !prev)}
              error={errors.password?.message}
              trailingAction={
                <button type="button" className="text-xs font-medium text-blue-600 hover:underline">
                  Забули пароль?
                </button>
              }
              {...register('password')}
            />

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

          <AuthDivider />

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
        </>
      }
    />
  );
};

export default LoginPage;
