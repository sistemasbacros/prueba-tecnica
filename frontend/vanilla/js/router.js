/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: COMPLETO. No es necesario modificarlo.
 *
 * El candidato debe implementar en esta sección: nada obligatorio.
 * Solo debe agregar rutas en main.js si crea pantallas nuevas (por ejemplo
 * una pantalla de asignación de técnicos, que es opcional).
 * ===================================================================== */

/**
 * Enrutador mínimo basado en el hash de la URL (sin dependencias).
 *
 *   #/login            → pantalla de inicio de sesión (pública)
 *   #/                 → dashboard (requiere sesión)
 *   #/contracts/1      → detalle del contrato (requiere sesión)
 *
 * Se usa hash en lugar de History API para que la aplicación funcione con
 * cualquier servidor de archivos estáticos sin configurar un fallback a
 * index.html (nginx ya lo tiene de todos modos).
 *
 * Una ruta se define como:
 *   { path: '/contracts/:id', render: (el, params) => void, requiresAuth: true, layout: true }
 *
 *   render        Función que pinta la pantalla dentro de `el`. Recibe los
 *                 parámetros de la ruta ({ id: '1' }).
 *   requiresAuth  Si es true y no hay sesión, redirige a #/login y recuerda a
 *                 dónde quería ir (ver `consumeRedirect()`).
 *   layout        Si es true, la pantalla se pinta dentro de la cabecera común
 *                 (ver main.js).
 */

let routes = [];
let redirectAfterLogin = null;

/** Ruta actual sin el `#`, por ejemplo "/contracts/1". Sin hash equivale a "/". */
export function currentPath() {
  const hash = window.location.hash.replace(/^#/, '');
  return hash.startsWith('/') ? hash : '/';
}

/** Navega a una ruta: navigate('/contracts/1'). Con { replace: true } no deja entrada en el historial. */
export function navigate(path, { replace = false } = {}) {
  const url = `#${path}`;
  if (replace) {
    window.location.replace(url);
  } else {
    window.location.hash = path;
  }
}

/** Devuelve (y olvida) la ruta protegida a la que el usuario intentaba entrar antes del login. */
export function consumeRedirect() {
  const path = redirectAfterLogin ?? '/';
  redirectAfterLogin = null;
  return path;
}

/** Convierte '/contracts/:id' en una expresión regular y la lista de nombres de parámetros. */
function compile(path) {
  const keys = [];
  const pattern = path
    .replace(/\/+$/, '')
    .replace(/:(\w+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    });
  return { regex: new RegExp(`^${pattern || '/'}/?$`), keys };
}

/** Busca la ruta que coincide con `path`. Devuelve { route, params } o null. */
export function matchRoute(path) {
  for (const route of routes) {
    const m = route.regex.exec(path);
    if (m) {
      const params = {};
      route.keys.forEach((key, i) => {
        params[key] = decodeURIComponent(m[i + 1]);
      });
      return { route, params };
    }
  }
  return null;
}

/**
 * Arranca el enrutador.
 *
 * @param {Array}    definitions           Rutas (ver cabecera).
 * @param {object}   options
 * @param {Function} options.isAuthenticated  () => boolean
 * @param {Function} options.onRoute          ({ route, params }) => void  Pinta la ruta.
 */
export function startRouter(definitions, { isAuthenticated, onRoute }) {
  routes = definitions.map((r) => ({ ...r, ...compile(r.path) }));

  const resolve = () => {
    const path = currentPath();
    const match = matchRoute(path);

    if (!match) {
      navigate('/', { replace: true });
      return;
    }
    if (match.route.requiresAuth && !isAuthenticated()) {
      redirectAfterLogin = path;
      navigate('/login', { replace: true });
      return;
    }
    if (path === '/login' && isAuthenticated()) {
      navigate('/', { replace: true });
      return;
    }
    onRoute(match);
  };

  window.addEventListener('hashchange', resolve);
  resolve();
}
