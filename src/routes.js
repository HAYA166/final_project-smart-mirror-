import { createBrowserRouter } from 'react-router';
import { MirrorScreen } from './pages/MirrorScreen.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { LoginPage } from './pages/LoginPage.jsx';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/',
    Component: Dashboard,
  },
  {
    path: '/mirror',
    Component: MirrorScreen,
  },
]);