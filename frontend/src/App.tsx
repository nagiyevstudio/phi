import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './store/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Operations from './pages/Operations';
import Categories from './pages/Categories';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import LandingPage from './marketing/LandingPage';
import AccessRequestPage from './marketing/AccessRequestPage';
import { routes } from './constants/routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth();
  // Проверяем токен в localStorage, так как состояние React может обновляться асинхронно
  const tokenInStorage = localStorage.getItem('auth_token');
  const userInStorage = localStorage.getItem('user');
  const isReallyAuthenticated = isAuthenticated || (!!tokenInStorage && !!userInStorage);
  return isReallyAuthenticated ? children : <Navigate to={routes.login} replace />;
}

function PublicRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth();
  // Проверяем токен в localStorage для корректной проверки авторизации
  const tokenInStorage = localStorage.getItem('auth_token');
  const userInStorage = localStorage.getItem('user');
  const isReallyAuthenticated = isAuthenticated || (!!tokenInStorage && !!userInStorage);
  return !isReallyAuthenticated ? children : <Navigate to={routes.app.root} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path={routes.landing} element={<LandingPage />} />
      <Route
        path={routes.login}
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path={routes.accessRequest}
        element={
          <PublicRoute>
            <AccessRequestPage />
          </PublicRoute>
        }
      />
      <Route path={routes.legacyRegister} element={<Navigate to={routes.accessRequest} replace />} />
      <Route
        path={routes.app.root}
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path={routes.app.operations}
        element={
          <PrivateRoute>
            <Operations />
          </PrivateRoute>
        }
      />
      <Route
        path={routes.app.categories}
        element={
          <PrivateRoute>
            <Categories />
          </PrivateRoute>
        }
      />
      <Route
        path={routes.app.analytics}
        element={
          <PrivateRoute>
            <Analytics />
          </PrivateRoute>
        }
      />
      <Route
        path={routes.app.settings}
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to={routes.landing} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
