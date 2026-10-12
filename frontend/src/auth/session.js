import { computed, reactive } from 'vue';
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
 * Estado de sesión compartido por toda la aplicación Dentro de un componente se consume con
 * el composable `useAuth()`:
 *
 *   import { useAuth } from '../auth/session.js';
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *
 *   user:            ref → { id: 2, username: "supervisor", role: "SUPERVISOR" } | null
 *   isAuthenticated: ref → boolean
 *   login:           (username, password) => Promise<user>
 *   logout:          () => void
 *
 * Usos típicos en la prueba:
 *   - Mostrar el usuario y su rol en la cabecera (AppLayout.vue).
 *   - Decidir qué botones mostrar según `user.value.role` (ContractDetailPage.vue).
 *   - Redirigir a /login si no hay sesión (guard en router.js, vía `auth`).
 *
 * Dónde se persiste: el token y el usuario se guardan en localStorage a través
 * de `session` (api/client.js), para que la sesión sobreviva a un refresh de la
 * página. Al cargar este módulo se restaura el usuario guardado (si existe).
 */
const state = reactive({ user: session.getUser() });

/**
 * Inicia sesión.
 *
 * @param {string} username  Nombre de usuario (columna Usuarios.NombreUsuario).
 * @param {string} password  Contraseña en texto plano; el backend la compara con el hash bcrypt.
 * @returns {Promise<{id:number, username:string, role:string}>} El usuario autenticado.
 * @throws {ApiError} status 401 si las credenciales son incorrectas o el usuario está inactivo;
 *                    status 0 si la API no responde. LoginPage.vue muestra el mensaje.
 */
async function login(username, password) {
  const data = await api.login(username, password); // { token, user }
  session.save(data.token, data.user);
  state.user = data.user;
  return data.user;
}

/**
 * Cierra la sesión: borra token y usuario de localStorage y del estado.
 * No llama a la API (con JWT no hay nada que invalidar en el servidor).
 */
function logout() {
  session.clear();
  state.user = null;
}

/**
 * Acceso a la sesión fuera de componentes (router.js lo usa en el guard).
 * Los getters leen el estado reactivo, así que siempre devuelven el valor actual.
 */
export const auth = {
  get user() {
    return state.user;
  },
  get isAuthenticated() {
    return state.user !== null;
  },
  login,
  logout,
};

/** Composable para usar la sesión dentro de componentes (ver ejemplo arriba). */
export function useAuth() {
  return {
    user: computed(() => state.user),
    isAuthenticated: computed(() => state.user !== null),
    login,
    logout,
  };
}

/**
 * Cierre automático de sesión cuando el token deja de ser válido.
 * api/client.js emite `auth:unauthorized` ante cualquier respuesta 401
 * (token expirado, manipulado o ausente). Aquí se escucha, se hace logout y
 * se redirige a /login. Se llama una sola vez desde main.js.
 */
export function initAuth(router) {
  window.addEventListener('auth:unauthorized', () => {
    logout();
    router.replace({ name: 'login' });
  });
}
