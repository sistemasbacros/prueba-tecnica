<script setup>
import { computed } from 'vue';

/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: COMPLETO. No es necesario modificarlo.
 * El candidato debe implementar en esta sección: nada obligatorio.
 * Usar <ErrorMessage :error="err" /> para mostrar errores de la API
 * (muestra `err.message`). Si no hay error no renderiza nada.
 * ===================================================================== */

/**
 * Mensaje de error reutilizable.
 *   error    ApiError | Error | string | null
 *   onRetry  si se pasa, muestra el botón "Reintentar"
 */
const props = defineProps({
  error: { type: [Object, String], default: null },
  onRetry: { type: Function, default: null },
});

const message = computed(() => {
  if (!props.error) return '';
  return typeof props.error === 'string' ? props.error : props.error.message ?? 'Ocurrió un error';
});
</script>

<template>
  <div v-if="error" class="alert alert-error" role="alert">
    <span>{{ message }}</span>
    <button v-if="onRetry" type="button" class="btn btn-link" @click="onRetry()">Reintentar</button>
  </div>
</template>
