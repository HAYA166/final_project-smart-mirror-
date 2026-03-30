import { RouterProvider } from 'react-router';
import { router } from './routes.jsx';
import { MirrorProvider } from './context/MirrorContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <MirrorProvider>
        <RouterProvider router={router} />
      </MirrorProvider>
    </AuthProvider>
  );
}

export default App;