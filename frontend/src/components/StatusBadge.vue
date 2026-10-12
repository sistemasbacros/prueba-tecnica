<script setup>
import { statusLabel } from '../utils/format.js';

/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: COMPLETO. No es necesario modificarlo.
 * El candidato debe implementar en esta sección: nada obligatorio.
 * ===================================================================== */

/** Etiqueta de color para estatus de contratos y tickets. */
defineProps({
  status: { type: String, required: true },
});
</script>

<template>
  <span :class="`badge badge-status badge-${String(status).toLowerCase()}`">{{ statusLabel(status) }}</span>
</template>
