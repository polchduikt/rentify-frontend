import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/config/routes';
import MainLayout from '@/layouts/MainLayout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import PlaceholderPage from '@/pages/PlaceholderPage';
import RegisterPage from '@/pages/RegisterPage';

const FullPageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700">
    Завантаження...
  </div>
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
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route
            path={ROUTES.search}
            element={
              <PlaceholderPage
                title="Пошук"
                description="Сторінка пошуку буде підключена до реальних фільтрів та API на наступному етапі."
              />
            }
          />
          <Route
            path={ROUTES.createProperty}
            element={
              <PlaceholderPage
                title="Створення оголошення"
                description="Майстер створення оголошення буде реалізований із чернеткою та завантаженням фото."
              />
            }
          />
          <Route
            path={ROUTES.profile}
            element={
              <PlaceholderPage
                title="Профіль"
                description="Тут буде доступне керування профілем: акаунт, безпека, аватар і налаштування."
              />
            }
          />
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
        </Route>
      </Route>

      <Route element={<GuestRoute />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
