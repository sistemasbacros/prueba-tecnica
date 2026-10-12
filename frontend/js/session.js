import { api, session } from './api.js';
import { navigate } from './router.js';

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
 *     `credentials: 'include'` en api.js.
 *   - Quiere manejar la expiración del token en el frontend (opcional).
 * ===================================================================== */

/**
 * Estado de sesión compartido por toda la aplicación Se importa como `auth`:
 *
 *   import { auth } from '../session.js';
 *
 *   auth.user             → { id: 2, username: "supervisor", role: "SUPERVISOR" } | null
 *   auth.isAuthenticated  → boolean
 *   auth.login(username, password) → Promise<user>
 *   auth.logout()
 *
 * Usos típicos en la prueba:
 *   - Mostrar el usuario y su rol en la cabecera (components.js → layout()).
 *   - Decidir qué botones mostrar según `auth.user.role` (pages/contractDetail.js).
 *   - Redirigir a #/login si no hay sesión (router.js lo hace con `requiresAuth`).
 *
 * Dónde se persiste: el token y el usuario se guardan en localStorage a través
 * de `session` (api.js), para que la sesión sobreviva a un refresh de la
 * página. Al cargar este módulo se restaura el usuario guardado (si existe).
 */
let currentUser = session.getUser();

/**
 * Inicia sesión.
 *
 * @param {string} username  Nombre de usuario (columna Usuarios.NombreUsuario).
 * @param {string} password  Contraseña en texto plano; el backend la compara con el hash bcrypt.
 * @returns {Promise<{id:number, username:string, role:string}>} El usuario autenticado.
 * @throws {ApiError} status 401 si las credenciales son incorrectas o el usuario está inactivo;
 *                    status 0 si la API no responde. pages/login.js muestra el mensaje.
 */
async function login(username, password) {
  const data = await api.login(username, password); // { token, user }
  session.save(data.token, data.user);
  currentUser = data.user;
  return data.user;
}

/**
 * Cierra la sesión: borra token y usuario de localStorage y del estado.
 * No llama a la API (con JWT no hay nada que invalidar en el servidor).
 */
function logout() {
  session.clear();
  currentUser = null;
}

export const auth = {
  get user() {
    return currentUser;
  },
  get isAuthenticated() {
    return currentUser !== null;
  },
  login,
  logout,
};

/**
 * Cierre automático de sesión cuando el token deja de ser válido.
 * api.js emite `auth:unauthorized` ante cualquier respuesta 401 (token
 * expirado, manipulado o ausente). Aquí se escucha, se hace logout y se
 * redirige a #/login. Se llama una sola vez desde main.js.
 */
export function initAuth() {
  window.addEventListener('auth:unauthorized', () => {
    logout();
    navigate('/login', { replace: true });
  });
}
