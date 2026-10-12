<script setup>
/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: COMPLETO. No es necesario modificarlo.
 * El candidato debe implementar en esta sección: nada obligatorio.
 * Usar <LoadingMessage /> mientras se cargan datos.
 * ===================================================================== */

/** Indicador de carga reutilizable. */
defineProps({
  text: { type: String, default: 'Cargando…' },
});
</script>

<template>
  <p class="loading" role="status">{{ text }}</p>
</template>
