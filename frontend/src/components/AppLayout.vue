<script setup>
import { useRouter } from 'vue-router';
import { useAuth } from '../auth/session.js';

/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: COMPLETO. No es necesario modificarlo.
 * El candidato debe implementar en esta sección: nada obligatorio.
 * ===================================================================== */

/** Cabecera común (título, usuario y rol, botón Salir) + contenido de la página. */
const { user, logout } = useAuth();
const router = useRouter();

function handleLogout() {
  logout();
  router.replace({ name: 'login' });
}
</script>

<template>
  <div class="app">
    <header class="app-header">
      <RouterLink to="/" class="app-title">Sistema de Mantenimiento</RouterLink>
      <div class="app-user">
        <span>
          Usuario: <strong>{{ user?.username }}</strong>
          <span class="badge badge-role">{{ user?.role }}</span>
        </span>
        <button type="button" class="btn btn-secondary" @click="handleLogout">Salir</button>
      </div>
    </header>
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>
