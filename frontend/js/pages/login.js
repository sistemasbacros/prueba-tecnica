import { auth } from '../session.js';
import { navigate, consumeRedirect } from '../router.js';
import { errorMessage } from '../components.js';

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
 * `auth.login()` y redirige al dashboard (o a la ruta que el usuario intentaba
 * abrir). Si ya hay sesión, el enrutador redirige a #/ antes de llegar aquí.
 *
 * @param {HTMLElement} el  Contenedor donde se pinta la pantalla.
 */
export function renderLogin(el) {
  el.innerHTML = `
    <div class="login-page">
      <form class="login-card" id="login-form">
        <h1>SISTEMA MANTENIMIENTO</h1>

        <label for="username">Usuario</label>
        <input id="username" name="username" autocomplete="username" required autofocus />

        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required />

        <button type="submit" class="btn btn-primary" id="login-submit">INGRESAR</button>

        <div id="login-error"></div>
      </form>
    </div>`;

  const form = el.querySelector('#login-form');
  const submit = el.querySelector('#login-submit');
  const errorBox = el.querySelector('#login-error');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.innerHTML = '';
    submit.disabled = true;
    submit.textContent = 'Ingresando…';
    try {
      const username = form.elements.username.value.trim();
      const password = form.elements.password.value;
      await auth.login(username, password);
      navigate(consumeRedirect(), { replace: true });
    } catch (err) {
      // 401 → credenciales incorrectas o usuario inactivo; 0 → API no disponible
      errorBox.innerHTML = errorMessage(err.status === 401 ? 'Usuario o contraseña incorrectos' : err.message);
    } finally {
      submit.disabled = false;
      submit.textContent = 'INGRESAR';
    }
  });
}
