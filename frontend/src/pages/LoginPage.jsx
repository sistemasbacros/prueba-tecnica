import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorMessage } from '../components/Feedback.jsx';

/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: COMPLETO. No es necesario modificarlo.
 *
 * El candidato debe implementar en esta sección: nada en el frontend.
 * Esta pantalla ya funciona si su backend expone POST /api/auth/login con:
 *   Body:  { "username": "...", "password": "..." }
 *   200:   { "token": "...", "user": { "id": 2, "username": "supervisor", "role": "SUPERVISOR" } }
 *   401:   { "error": "INVALID_CREDENTIALS", "message": "..." }  (también para usuarios inactivos)
 *
 * Lo que el candidato debe verificar con esta pantalla:
 *   - administrador / supervisor / tecnico01 entran y llegan al dashboard.
 *   - tecnico04 (inactivo) y una contraseña incorrecta muestran
 *     "Usuario o contraseña incorrectos".
 *   - Con el backend apagado se muestra "No se pudo conectar con la API".
 * ===================================================================== */

/**
 * Pantalla de inicio de sesión. Llama a POST /api/auth/login a través de
 * AuthContext y redirige al dashboard (o a la ruta que el usuario intentaba abrir).
 */
export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      const from = location.state?.from?.pathname ?? '/';
      navigate(from, { replace: true });
    } catch (err) {
      // 401 → credenciales incorrectas o usuario inactivo; 0 → API no disponible
      setError(err.status === 401 ? 'Usuario o contraseña incorrectos' : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>SISTEMA MANTENIMIENTO</h1>

        <label htmlFor="username">Usuario</label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoFocus
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Ingresando…' : 'INGRESAR'}
        </button>

        <ErrorMessage error={error} />
      </form>
    </div>
  );
}
