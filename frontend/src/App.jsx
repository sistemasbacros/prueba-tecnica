import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ContractDetailPage from './pages/ContractDetailPage.jsx';

/**
 * Rutas de la aplicación.
 *
 *   /login            → pantalla de inicio de sesión (pública)
 *   /                 → dashboard (requiere sesión)
 *   /contracts/:id    → detalle del contrato (requiere sesión)
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/contracts/:id" element={<ContractDetailPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
