import { createApp } from 'vue';
import App from './App.vue';
import router from './router.js';
import { initAuth } from './auth/session.js';
import './styles.css';

/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: COMPLETO. No es necesario modificarlo.
 * El candidato debe implementar en esta sección: nada obligatorio.
 * ===================================================================== */

// Conecta el cierre automático de sesión ante un 401 (ver auth/session.js).
initAuth(router);

createApp(App).use(router).mount('#app');
