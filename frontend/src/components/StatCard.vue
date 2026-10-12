<script setup>
/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: COMPLETO. No es necesario modificarlo.
 * El candidato debe implementar en esta sección: nada obligatorio.
 * ===================================================================== */

/** Tarjeta de indicador para el dashboard. `tone`: neutral | info | warning | success. */
defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: null },
  tone: { type: String, default: 'neutral' },
});
</script>

<template>
  <div :class="`stat-card stat-${tone}`">
    <span class="stat-label">{{ label }}</span>
    <span class="stat-value">{{ value ?? '—' }}</span>
  </div>
</template>
