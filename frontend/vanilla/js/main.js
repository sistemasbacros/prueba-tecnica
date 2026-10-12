import { startRouter, navigate } from './router.js';
import { auth, initAuth } from './session.js';
import { layout } from './components.js';
import { renderLogin } from './pages/login.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderContractDetail } from './pages/contractDetail.js';

/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: COMPLETO. No es necesario modificarlo.
 *
 * El candidato debe implementar en esta sección: nada obligatorio.
 * Solo debe agregar rutas aquí si crea pantallas nuevas (por ejemplo una
 * pantalla de asignación de técnicos, que es opcional).
 * ===================================================================== */

/**
 * Punto de entrada: define las rutas y arranca el enrutador.
 *
 *   #/login            → pantalla de inicio de sesión (pública)
 *   #/                 → dashboard (requiere sesión)
 *   #/contracts/:id    → detalle del contrato (requiere sesión)
 *
 * Las rutas con `requiresAuth` redirigen a #/login si no hay sesión
 * (equivalente al <ProtectedRoute /> de la plantilla React). Las rutas con
 * `layout` se pintan dentro de la cabecera común (components.js → layout()).
 */
const routes = [
  { path: '/login', render: renderLogin },
  { path: '/', render: renderDashboard, requiresAuth: true, layout: true },
  { path: '/contracts/:id', render: renderContractDetail, requiresAuth: true, layout: true },
];

const app = document.getElementById('app');

// Cierre automático de sesión ante un 401 (ver session.js).
initAuth();

// Botón "Salir" de la cabecera (delegado: la cabecera se vuelve a pintar en cada ruta).
app.addEventListener('click', (event) => {
  if (event.target.closest('[data-logout]')) {
    auth.logout();
    navigate('/login', { replace: true });
  }
});

startRouter(routes, {
  isAuthenticated: () => auth.isAuthenticated,
  onRoute: ({ route, params }) => {
    if (route.layout) {
      app.innerHTML = layout(auth.user);
      route.render(app.querySelector('#page'), params);
    } else {
      app.innerHTML = '';
      route.render(app, params);
    }
  },
});
