import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: COMPLETO. No es necesario modificarlo.
 * El candidato debe implementar en esta sección: nada obligatorio.
 * ===================================================================== */

/** Cabecera común (título, usuario y rol, botón Salir) + contenido de la página. */
export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-title">
          Sistema de Mantenimiento
        </Link>
        <div className="app-user">
          <span>
            Usuario: <strong>{user?.username}</strong>{' '}
            <span className="badge badge-role">{user?.role}</span>
          </span>
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
