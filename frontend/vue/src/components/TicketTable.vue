<script setup>
import { useSlots } from 'vue';
import StatusBadge from './StatusBadge.vue';
import { formatDate, typeLabel } from '../utils/format.js';

/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: COMPLETO. No es necesario modificarlo.
 *
 * El candidato debe implementar en esta sección: nada. Los botones de la
 * columna "Acciones" se definen desde ContractDetailPage.vue a través del
 * slot con nombre `actions`; ahí es donde va la lógica por rol y estatus.
 * ===================================================================== */

/**
 * Tabla de tickets de un contrato.
 *
 * Props:
 *   tickets  Tickets tal como los devuelve GET /api/contracts/{id}/tickets
 *
 * Slot `actions` (con scope `{ ticket }`): contenido de la columna "Acciones"
 * para cada ticket. Si el componente padre no define el slot, la columna no se
 * muestra. Ejemplo de uso:
 *
 *   <TicketTable :tickets="tickets">
 *     <template #actions="{ ticket }">
 *       <button ...>Iniciar</button>
 *     </template>
 *   </TicketTable>
 */
defineProps({
  tickets: { type: Array, default: () => [] },
});

const slots = useSlots();
const hasActions = () => Boolean(slots.actions);
</script>

<template>
  <p v-if="!tickets.length" class="empty">No hay tickets para mostrar.</p>

  <table v-else class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Tipo</th>
        <th>Descripción</th>
        <th>Solicitud</th>
        <th>Estatus</th>
        <th>Asignado a</th>
        <th v-if="hasActions()">Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="t in tickets" :key="t.id">
        <td>{{ t.id }}</td>
        <td>{{ typeLabel(t.tipo) }}</td>
        <td>{{ t.descripcion }}</td>
        <td>{{ formatDate(t.fechaSolicitud) }}</td>
        <td><StatusBadge :status="t.estatus" /></td>
        <td>{{ t.usuarioAsignado?.nombre ?? '—' }}</td>
        <td v-if="hasActions()" class="actions">
          <slot name="actions" :ticket="t" />
        </td>
      </tr>
    </tbody>
  </table>
</template>
