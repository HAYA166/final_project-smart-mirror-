import { createBrowserRouter } from 'react-router';
import { MirrorScreen } from './pages/MirrorScreen.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/mirror',
    element: (
      <ProtectedRoute>
        <MirrorScreen />
      </ProtectedRoute>
    ),
  },
]);