import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, session } from '../api/client.js';

/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: COMPLETO. No es necesario modificarlo.
 *
 * El candidato debe implementar en esta sección: nada obligatorio.
 *
 * Solo debe modificarlo si:
 *   - Su backend devuelve el login con otra forma que no sea { token, user }
 *     (lo recomendado es ajustar el backend, no este archivo).
 *   - Elige autenticación por cookie/sesión en lugar de token: en ese caso
 *     debe quitar el guardado del token en `login()` y agregar
 *     `credentials: 'include'` en api/client.js.
 *   - Quiere manejar la expiración del token en el frontend (opcional).
 * ===================================================================== */

/**
 * Contexto de autenticación.
 *
 * Guarda la sesión del usuario (token + datos básicos) y la expone a toda la
 * aplicación. Se consume con el hook `useAuth()` (ver abajo).
 *
 * Forma del valor que entrega el contexto:
 *
 *   {
 *     user:            { id: 2, username: "supervisor", role: "SUPERVISOR" } | null,
 *     isAuthenticated: boolean,                       // true si hay sesión
 *     login:           (username, password) => Promise<user>,
 *     logout:          () => void,
 *   }
 *
 * Dónde se persiste: el token y el usuario se guardan en localStorage a través
 * de `session` (api/client.js), para que la sesión sobreviva a un refresh de la
 * página. Si prefieres guardar el token en memoria o en una cookie, cambia
 * `session` en api/client.js; este archivo no necesita cambios.
 */
const AuthContext = createContext(null);

/**
 * Proveedor de sesión. Debe envolver a toda la aplicación (ver main.jsx):
 *
 *   <BrowserRouter>
 *     <AuthProvider>
 *       <App />
 *     </AuthProvider>
 *   </BrowserRouter>
 *
 * Responsabilidades:
 *   1. Al montar, restaura el usuario guardado en localStorage (si existe).
 *   2. `login()` llama a POST /api/auth/login, guarda token + usuario y actualiza el estado.
 *   3. `logout()` borra la sesión.
 *   4. Escucha el evento global `auth:unauthorized` (lo emite api/client.js cuando
 *      cualquier petición recibe 401) y cierra la sesión automáticamente; al quedar
 *      `user` en null, <ProtectedRoute /> redirige a /login.
 */
export function AuthProvider({ children }) {
  /**
   * Usuario autenticado o null.
   * El inicializador en función hace que localStorage se lea una sola vez, al montar.
   */
  const [user, setUser] = useState(() => session.getUser());

  /**
   * Inicia sesión.
   *
   * @param {string} username  Nombre de usuario (columna Usuarios.NombreUsuario).
   * @param {string} password  Contraseña en texto plano; el backend la compara con el hash bcrypt.
   * @returns {Promise<{id:number, username:string, role:string}>} El usuario autenticado.
   * @throws {ApiError} status 401 si las credenciales son incorrectas o el usuario está inactivo;
   *                    status 0 si la API no responde. LoginPage.jsx muestra el mensaje.
   */
  const login = useCallback(async (username, password) => {
    const data = await api.login(username, password); // { token, user }
    session.save(data.token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  /**
   * Cierra la sesión: borra token y usuario de localStorage y del estado.
   * No llama a la API (con JWT no hay nada que invalidar en el servidor).
   */
  const logout = useCallback(() => {
    session.clear();
    setUser(null);
  }, []);

  /**
   * Cierre automático de sesión cuando el token deja de ser válido.
   * api/client.js emite `auth:unauthorized` ante cualquier respuesta 401
   * (token expirado, manipulado o ausente). Aquí se escucha y se hace logout.
   */
  useEffect(() => {
    window.addEventListener('auth:unauthorized', logout);
    return () => window.removeEventListener('auth:unauthorized', logout);
  }, [logout]);

  /**
   * Valor del contexto. useMemo evita que todos los consumidores se vuelvan a
   * renderizar en cada render del proveedor si nada cambió.
   */
  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para acceder a la sesión desde cualquier componente.
 *
 * Ejemplo de uso:
 *
 *   import { useAuth } from '../context/AuthContext.jsx';
 *
 *   function Header() {
 *     const { user, isAuthenticated, login, logout } = useAuth();
 *     if (!isAuthenticated) return null;
 *     return <span>{user.username} ({user.role}) <button onClick={logout}>Salir</button></span>;
 *   }
 *
 * Usos típicos en la prueba:
 *   - Mostrar el usuario y su rol en la cabecera (Layout.jsx).
 *   - Decidir qué botones mostrar según `user.role` (ContractDetailPage.jsx).
 *   - Redirigir a /login si `isAuthenticated` es false (ProtectedRoute.jsx).
 *
 * @returns {{ user: object|null, isAuthenticated: boolean, login: Function, logout: Function }}
 * @throws {Error} si se usa fuera de <AuthProvider> (error de programación, no de usuario).
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
