import { useCallback, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AuthDivider, AuthErrorBanner, AuthField, AuthPasswordField } from '@/components/auth/AuthFormParts';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { PASSWORD_STRENGTH_COLORS, PASSWORD_STRENGTH_LABELS, REGISTER_PAGE_HERO } from '@/constants/authUi';
import { GOOGLE_CLIENT_ID } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthRedirectPath, getPasswordStrength, registerSchema, type RegisterFormValues } from '@/utils/authForms';
import { getApiErrorMessage } from '@/utils/errors';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser, loginWithGoogle } = useAuth();
  const [submitError, setSubmitError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const redirectPath = getAuthRedirectPath(location.state);

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
    <AuthPageLayout
      photoUrl={REGISTER_PAGE_HERO.photoUrl}
      imageAlt={REGISTER_PAGE_HERO.imageAlt}
      overlayClassName={REGISTER_PAGE_HERO.overlayClassName}
      leftEyebrow={REGISTER_PAGE_HERO.eyebrow}
      leftTitle={REGISTER_PAGE_HERO.title}
      leftContent={
        <div className="space-y-2.5">
          {REGISTER_PAGE_HERO.perks.map((perk) => (
            <div key={perk} className="flex items-center gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/25">
                <Check size={11} className="text-emerald-400" />
              </div>
              <span className="text-sm text-white/85">{perk}</span>
            </div>
          ))}
        </div>
      }
      rightContent={
        <>
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

          <AuthErrorBanner message={submitError} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AuthField
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Іван"
                label="Ім’я"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <AuthField
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Петренко"
                label="Прізвище"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <AuthField
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+380XXXXXXXXX"
              label="Телефон"
              hint="(необов’язково)"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <AuthField
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              label="Електронна пошта"
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <AuthPasswordField
                id="password"
                autoComplete="new-password"
                placeholder="Мінімум 8 символів"
                label="Пароль"
                showPassword={showPassword}
                onToggleShow={() => setShowPassword((prev) => !prev)}
                error={errors.password?.message}
                {...register('password')}
              />

              {passwordValue && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          passwordStrength >= level ? PASSWORD_STRENGTH_COLORS[passwordStrength] : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    Надійність: <span className="font-medium text-slate-700">{PASSWORD_STRENGTH_LABELS[passwordStrength]}</span>
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

          <AuthDivider />

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
        </>
      }
    />
  );
};

export default RegisterPage;
