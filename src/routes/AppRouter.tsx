import { lazy, Suspense, type ReactNode, useEffect } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, matchPath, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';

const BookingPaymentPage = lazy(() => import('@/pages/BookingPaymentPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactsPage = lazy(() => import('@/pages/ContactsPage'));
const CreatePropertyPage = lazy(() => import('@/pages/CreatePropertyPage'));
const EditPropertyPage = lazy(() => import('@/pages/EditPropertyPage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const PlaceholderPage = lazy(() => import('@/pages/PlaceholderPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const PublicProfilePage = lazy(() => import('@/pages/PublicProfilePage'));
const PropertyDetailsPage = lazy(() => import('@/pages/PropertyDetailsPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const SearchMapPage = lazy(() => import('@/pages/SearchMapPage'));
const SupportPage = lazy(() => import('@/pages/SupportPage'));

const FullPageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700">Завантаження...</div>
);

const ContentSkeleton = () => (
  <div className="mx-auto max-w-7xl animate-pulse space-y-6 px-4 py-8 sm:px-6 lg:px-8">
    <div className="h-10 w-52 rounded-xl bg-slate-200" />
    <div className="h-64 rounded-3xl bg-slate-200" />
    <div className="grid gap-4 md:grid-cols-3">
      <div className="h-44 rounded-2xl bg-slate-200" />
      <div className="h-44 rounded-2xl bg-slate-200" />
      <div className="h-44 rounded-2xl bg-slate-200" />
    </div>
  </div>
);

const AuthSkeleton = () => (
  <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-10">
    <div className="w-full animate-pulse space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="h-7 w-1/2 rounded-lg bg-slate-200" />
      <div className="h-10 w-full rounded-xl bg-slate-200" />
      <div className="h-10 w-full rounded-xl bg-slate-200" />
      <div className="h-11 w-full rounded-xl bg-slate-200" />
    </div>
  </div>
);

const MapPageSkeleton = () => (
  <div className="relative h-screen w-full overflow-hidden bg-slate-200">
    <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_30%_20%,#e2e8f0_0%,#cbd5e1_40%,#94a3b8_100%)]" />
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-3">
      <div className="mx-auto h-16 max-w-[1320px] rounded-2xl bg-white/75 backdrop-blur" />
    </div>
    <div className="pointer-events-none absolute bottom-6 left-6 h-28 w-[320px] rounded-2xl bg-white/75 backdrop-blur" />
  </div>
);

const withSuspense = (node: ReactNode, fallback: ReactNode = <ContentSkeleton />) => (
  <Suspense fallback={fallback}>{node}</Suspense>
);

const DEFAULT_DESCRIPTION = 'Rentify — сервіс оренди житла в Україні. Знайдіть квартиру, будинок чи кімнату швидко.';
const DEFAULT_OG_IMAGE_PATH = '/rentify-logo.svg';
const SITE_NAME = 'Rentify';

type BreadcrumbItem = {
  name: string;
  path: string;
};

const resolveSiteUrl = () => {
  const envUrl = import.meta.env.VITE_SITE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  return typeof window !== 'undefined' ? window.location.origin : '';
};

const upsertMetaTag = (key: 'name' | 'property', value: string, content: string) => {
  const selector = `meta[${key}="${value}"]`;
  const existing = document.head.querySelector(selector);
  const meta = existing ?? document.createElement('meta');
  meta.setAttribute(key, value);
  meta.setAttribute('content', content);
  if (!existing) {
    document.head.appendChild(meta);
  }
};

const upsertLinkTag = (rel: string, href: string) => {
  const selector = `link[rel="${rel}"]`;
  const existing = document.head.querySelector(selector);
  const link = existing ?? document.createElement('link');
  link.setAttribute('rel', rel);
  link.setAttribute('href', href);
  if (!existing) {
    document.head.appendChild(link);
  }
};

const upsertJsonLd = (data: Record<string, unknown> | Array<Record<string, unknown>>) => {
  const scriptId = 'seo-jsonld';
  const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
  const script = existing ?? document.createElement('script');
  script.type = 'application/ld+json';
  script.id = scriptId;
  script.textContent = JSON.stringify(data);
  if (!existing) {
    document.head.appendChild(script);
  }
};

const isExactRoute = (pathname: string, route: string) =>
  matchPath({ path: route, end: true }, pathname) != null;

const isNoIndexRoute = (pathname: string) =>
  isExactRoute(pathname, ROUTES.login) ||
  isExactRoute(pathname, ROUTES.register) ||
  isExactRoute(pathname, ROUTES.profile) ||
  isExactRoute(pathname, ROUTES.favorites) ||
  isExactRoute(pathname, ROUTES.createProperty) ||
  matchPath(ROUTES.editPropertyPattern, pathname) != null ||
  matchPath(ROUTES.bookingPaymentPattern, pathname) != null;

const resolveBreadcrumbs = (pathname: string): BreadcrumbItem[] | null => {
  const labelMap: Record<string, string> = {
    [ROUTES.search]: 'Пошук',
    [ROUTES.searchMap]: 'Пошук на мапі',
    [ROUTES.about]: 'Про нас',
    [ROUTES.contacts]: 'Контакти',
    [ROUTES.support]: 'Підтримка',
    [ROUTES.privacy]: 'Політика конфіденційності',
    [ROUTES.terms]: 'Умови користування',
  };

  const label = labelMap[pathname];
  if (!label || pathname === ROUTES.home) {
    return null;
  }

  return [
    { name: 'Головна', path: ROUTES.home },
    { name: label, path: pathname },
  ];
};

const resolveSeo = (pathname: string) => {
  let title = SITE_NAME;
  let description = DEFAULT_DESCRIPTION;

  if (pathname === ROUTES.home) {
    title = 'Rentify - Оренда житла в Україні';
    description = DEFAULT_DESCRIPTION;
  } else if (pathname === ROUTES.search) {
    title = 'Пошук оголошень - Rentify';
    description = 'Пошук оголошень оренди житла за ціною, районом та зручностями.';
  } else if (pathname === ROUTES.searchMap) {
    title = 'Пошук на мапі - Rentify';
    description = 'Пошук житла на мапі України з актуальними оголошеннями.';
  } else if (pathname === ROUTES.about) {
    title = 'Про нас - Rentify';
    description = 'Дізнайтеся більше про Rentify та нашу місію на ринку оренди житла.';
  } else if (pathname === ROUTES.contacts) {
    title = 'Контакти - Rentify';
    description = 'Контакти Rentify для підтримки, партнерства та медіа-запитів.';
  } else if (pathname === ROUTES.support) {
    title = 'Підтримка - Rentify';
    description = 'Отримайте допомогу з пошуком, бронюванням та роботою платформи Rentify.';
  } else if (pathname === ROUTES.profile) {
    title = 'Профіль - Rentify';
    description = 'Особистий кабінет Rentify для керування оголошеннями та бронюваннями.';
  } else if (pathname === ROUTES.favorites) {
    title = 'Обране - Rentify';
    description = 'Збережені оголошення у вашому профілі Rentify.';
  } else if (pathname === ROUTES.login) {
    title = 'Вхід - Rentify';
    description = 'Увійдіть у свій акаунт Rentify.';
  } else if (pathname === ROUTES.register) {
    title = 'Реєстрація - Rentify';
    description = 'Створіть акаунт Rentify, щоб керувати бронюваннями та оголошеннями.';
  } else if (pathname === ROUTES.createProperty) {
    title = 'Створення оголошення - Rentify';
    description = 'Створіть оголошення про оренду житла на Rentify.';
  } else if (matchPath(ROUTES.propertyDetailsPattern, pathname)) {
    title = 'Оголошення - Rentify';
    description = 'Деталі оголошення про оренду житла на Rentify.';
  } else if (matchPath(ROUTES.editPropertyPattern, pathname)) {
    title = 'Редагування оголошення - Rentify';
    description = 'Редагування оголошення про оренду житла на Rentify.';
  } else if (matchPath(ROUTES.publicProfilePattern, pathname)) {
    title = 'Профіль користувача - Rentify';
    description = 'Публічний профіль користувача Rentify та його оголошення.';
  } else if (matchPath(ROUTES.bookingPaymentPattern, pathname)) {
    title = 'Оплата бронювання - Rentify';
    description = 'Оплата бронювання житла через Rentify.';
  }

  return {
    title,
    description,
    robots: isNoIndexRoute(pathname) ? 'noindex,nofollow' : 'index,follow',
    breadcrumbs: resolveBreadcrumbs(pathname),
  };
};

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

const GuestRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return <Outlet />;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

const DocumentMeta = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const { title, description, robots, breadcrumbs } = resolveSeo(pathname);
    const siteUrl = resolveSiteUrl();
    const canonicalUrl = `${siteUrl}${pathname}`;
    const ogImageUrl = `${siteUrl}${DEFAULT_OG_IMAGE_PATH}`;

    document.title = title;
    upsertMetaTag('name', 'description', description);
    upsertMetaTag('name', 'robots', robots);
    upsertMetaTag('property', 'og:type', 'website');
    upsertMetaTag('property', 'og:site_name', SITE_NAME);
    upsertMetaTag('property', 'og:title', title);
    upsertMetaTag('property', 'og:description', description);
    upsertMetaTag('property', 'og:url', canonicalUrl);
    upsertMetaTag('property', 'og:image', ogImageUrl);
    upsertMetaTag('property', 'og:locale', 'uk_UA');
    upsertMetaTag('name', 'twitter:card', 'summary_large_image');
    upsertMetaTag('name', 'twitter:title', title);
    upsertMetaTag('name', 'twitter:description', description);
    upsertMetaTag('name', 'twitter:image', ogImageUrl);
    upsertLinkTag('canonical', canonicalUrl);

    const jsonLd: Record<string, unknown>[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: siteUrl,
        logo: ogImageUrl,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: siteUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}${ROUTES.search}?city={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ];

    if (breadcrumbs) {
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${siteUrl}${item.path}`,
        })),
      });
    }

    upsertJsonLd(jsonLd);
  }, [pathname]);

  return null;
};

const AppRouter = () => (
  <BrowserRouter>
    <DocumentMeta />
    <ScrollToTop />
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={ROUTES.home} element={withSuspense(<HomePage />)} />
        <Route path={ROUTES.search} element={withSuspense(<SearchPage />)} />
        <Route path={ROUTES.propertyDetailsPattern} element={withSuspense(<PropertyDetailsPage />)} />
        <Route path={ROUTES.publicProfilePattern} element={withSuspense(<PublicProfilePage />)} />
        <Route path={ROUTES.about} element={withSuspense(<AboutPage />)} />
        <Route path={ROUTES.contacts} element={withSuspense(<ContactsPage />)} />
        <Route path={ROUTES.support} element={withSuspense(<SupportPage />)} />

        <Route
          path={ROUTES.privacy}
          element={withSuspense(<PlaceholderPage title="Політика конфіденційності" description="Умови обробки та захисту даних." />)}
        />
        <Route
          path={ROUTES.terms}
          element={withSuspense(<PlaceholderPage title="Умови користування" description="Правила та юридичні умови платформи." />)}
        />

        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.createProperty} element={withSuspense(<CreatePropertyPage />)} />
          <Route path={ROUTES.editPropertyPattern} element={withSuspense(<EditPropertyPage />)} />
          <Route path={ROUTES.profile} element={withSuspense(<ProfilePage />)} />
          <Route path={ROUTES.favorites} element={withSuspense(<FavoritesPage />)} />
          <Route path={ROUTES.bookingPaymentPattern} element={withSuspense(<BookingPaymentPage />)} />
        </Route>
      </Route>

      <Route path={ROUTES.searchMap} element={withSuspense(<SearchMapPage />, <MapPageSkeleton />)} />

      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.login} element={withSuspense(<LoginPage />, <AuthSkeleton />)} />
          <Route path={ROUTES.register} element={withSuspense(<RegisterPage />, <AuthSkeleton />)} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
