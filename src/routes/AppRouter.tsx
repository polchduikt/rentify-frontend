import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';

const BookingPaymentPage = lazy(() => import('@/pages/BookingPaymentPage'));
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

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={ROUTES.home} element={withSuspense(<HomePage />)} />
        <Route path={ROUTES.search} element={withSuspense(<SearchPage />)} />
        <Route path={ROUTES.propertyDetailsPattern} element={withSuspense(<PropertyDetailsPage />)} />
        <Route path={ROUTES.publicProfilePattern} element={withSuspense(<PublicProfilePage />)} />

        <Route
          path={ROUTES.about}
          element={withSuspense(<PlaceholderPage title="Про Rentify" description="Інформація про компанію та бачення продукту." />)}
        />
        <Route
          path={ROUTES.contacts}
          element={withSuspense(<PlaceholderPage title="Контакти" description="Канали підтримки та способи зв'язку." />)}
        />
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
