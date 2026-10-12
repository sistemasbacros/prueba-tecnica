<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../auth/session.js';
import ErrorMessage from '../components/ErrorMessage.vue';

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
 * useAuth() y redirige al dashboard (o a la ruta que el usuario intentaba abrir,
 * que el guard de router.js deja en ?from=). Si ya hay sesión, el guard
 * redirige a / antes de llegar aquí.
 */
const { login } = useAuth();
const router = useRouter();
const route = useRoute();

const username = ref('');
const password = ref('');
const error = ref(null);
const submitting = ref(false);

async function handleSubmit() {
  error.value = null;
  submitting.value = true;
  try {
    await login(username.value.trim(), password.value);
    const from = typeof route.query.from === 'string' ? route.query.from : '/';
    router.replace(from);
  } catch (err) {
    // 401 → credenciales incorrectas o usuario inactivo; 0 → API no disponible
    error.value = err.status === 401 ? 'Usuario o contraseña incorrectos' : err.message;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <form class="login-card" @submit.prevent="handleSubmit">
      <h1>SISTEMA MANTENIMIENTO</h1>

      <label for="username">Usuario</label>
      <input id="username" v-model="username" name="username" autocomplete="username" required autofocus />

      <label for="password">Password</label>
      <input
        id="password"
        v-model="password"
        name="password"
        type="password"
        autocomplete="current-password"
        required
      />

      <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Ingresando…' : 'INGRESAR' }}
      </button>

      <ErrorMessage :error="error" />
    </form>
  </div>
</template>
