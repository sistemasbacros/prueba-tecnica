<script setup>
import StatusBadge from './StatusBadge.vue';
import { formatDate } from '../utils/format.js';

/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: COMPLETO. No es necesario modificarlo.
 * El candidato debe implementar en esta sección: nada obligatorio.
 * ===================================================================== */

/**
 * Tabla de contratos. Cada fila enlaza al detalle.
 * `contracts`: tal como los devuelve GET /api/contracts
 *   [{ id, numero, nombre, fechaInicio, fechaFin, estatus, responsable }]
 */
defineProps({
  contracts: { type: Array, default: () => [] },
});
</script>

<template>
  <p v-if="!contracts.length" class="empty">No hay contratos para mostrar.</p>

  <table v-else class="table">
    <thead>
      <tr>
        <th>Número</th>
        <th>Nombre</th>
        <th>Inicio</th>
        <th>Fin</th>
        <th>Estatus</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="c in contracts" :key="c.id">
        <td>
          <RouterLink :to="`/contracts/${c.id}`">{{ c.numero }}</RouterLink>
        </td>
        <td>{{ c.nombre }}</td>
        <td>{{ formatDate(c.fechaInicio) }}</td>
        <td>{{ formatDate(c.fechaFin) }}</td>
        <td><StatusBadge :status="c.estatus" /></td>
      </tr>
    </tbody>
  </table>
</template>
