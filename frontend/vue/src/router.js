import { createRouter, createWebHistory } from 'vue-router';
import { auth } from './auth/session.js';
import AppLayout from './components/AppLayout.vue';
import LoginPage from './pages/LoginPage.vue';
import DashboardPage from './pages/DashboardPage.vue';
import ContractDetailPage from './pages/ContractDetailPage.vue';

/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: COMPLETO. No es necesario modificarlo.
 *
 * El candidato debe implementar en esta sección: nada obligatorio.
 * Solo debe agregar rutas aquí si crea pantallas nuevas (por ejemplo una
 * pantalla de asignación de técnicos, que es opcional).
 * ===================================================================== */

/**
 * Rutas de la aplicación.
 *
 *   /login            → pantalla de inicio de sesión (pública)
 *   /                 → dashboard (requiere sesión)
 *   /contracts/:id    → detalle del contrato (requiere sesión)
 *
 * Las rutas hijas de AppLayout llevan `meta.requiresAuth` y se protegen en
 * `beforeEach` (equivalente al <ProtectedRoute /> de la plantilla React).
 */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginPage },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: DashboardPage },
        { path: 'contracts/:id', name: 'contract', component: ContractDetailPage, props: true },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

/**
 * Guard global:
 *   - ruta protegida sin sesión → /login (recordando a dónde quería ir en ?from=)
 *   - /login con sesión activa  → dashboard
 */
router.beforeEach((to) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  if (requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { from: to.fullPath } };
  }
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'dashboard' };
  }
  return true;
});

export default router;
