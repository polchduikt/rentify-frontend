import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';
import CreatePropertyPage from '@/pages/CreatePropertyPage';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import PlaceholderPage from '@/pages/PlaceholderPage';
import RegisterPage from '@/pages/RegisterPage';
import SearchPage from '@/pages/SearchPage';
import SearchMapPage from '@/pages/SearchMapPage';

const FullPageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700">Завантаження...</div>
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
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.search} element={<SearchPage />} />

        <Route
          path={ROUTES.about}
          element={<PlaceholderPage title="Про Rentify" description="Інформація про компанію та бачення продукту." />}
        />
        <Route
          path={ROUTES.contacts}
          element={<PlaceholderPage title="Контакти" description="Канали підтримки та способи звʼязку." />}
        />
        <Route
          path={ROUTES.privacy}
          element={<PlaceholderPage title="Політика конфіденційності" description="Умови обробки та захисту даних." />}
        />
        <Route
          path={ROUTES.terms}
          element={<PlaceholderPage title="Умови користування" description="Правила та юридичні умови платформи." />}
        />

        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.createProperty} element={<CreatePropertyPage />} />
          <Route
            path={ROUTES.profile}
            element={
              <PlaceholderPage
                title="Профіль"
                description="Тут буде доступне керування профілем: акаунт, безпека, аватар і налаштування."
              />
            }
          />
        </Route>
      </Route>

      <Route path={ROUTES.searchMap} element={<SearchMapPage />} />

      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.register} element={<RegisterPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
