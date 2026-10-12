<script setup>
import { onMounted, ref } from 'vue';
import { api } from '../api/client.js';
import StatCard from '../components/StatCard.vue';
import ContractList from '../components/ContractList.vue';
import LoadingMessage from '../components/LoadingMessage.vue';
import ErrorMessage from '../components/ErrorMessage.vue';

/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: REQUIERE IMPLEMENTACIÓN.
 *
 * Ya está hecho: carga de contratos con GET /api/contracts, contador de
 * contratos activos, lista de contratos, estados de carga y error.
 *
 * El candidato debe implementar en esta sección:
 *
 *   1. El cálculo de los contadores `ticketsPendientes` y `ticketsEnProceso`
 *      dentro de la función `load()` (buscar "TODO (candidato)").
 *
 *      Elegir UNA de estas dos opciones y documentarla en el README:
 *
 *      Opción A (recomendada): implementar en el backend GET /api/dashboard
 *        que devuelva { contratosActivos, ticketsPendientes, ticketsEnProceso }
 *        ya filtrados por el usuario autenticado, y llamar a api.getDashboard().
 *        (supervisor: { contratosActivos: 3, ticketsPendientes: 6, ticketsEnProceso: 3 })
 *
 *      Opción B: por cada contrato devuelto, llamar a api.getContractTickets(id)
 *        (idealmente en paralelo con Promise.all), unir los tickets y contar
 *        cuántos tienen estatus 'PENDIENTE' y cuántos 'EN_PROCESO'.
 *
 *   2. Asegurarse de que los contadores reflejen SOLO lo que el usuario puede ver:
 *      un TECNICO cuenta únicamente sus tickets asignados. Esto depende de que
 *      el backend filtre correctamente por rol.
 *
 *   3. Mantener el manejo de errores: si falla la carga de tickets, mostrar el
 *      error con <ErrorMessage /> en lugar de dejar los contadores en "—".
 *
 * Resultado esperado con los datos iniciales:
 *      administrador y supervisor → activos 3, pendientes 6, en proceso 3
 *      tecnico01 → 2, 0, 0   ·   tecnico02 → 3, 0, 1   ·   tecnico03 → 2, 0, 2
 * ===================================================================== */

/**
 * Dashboard: contadores + lista de contratos del usuario autenticado.
 */
const contracts = ref([]);
const stats = ref({ contratosActivos: null, ticketsPendientes: null, ticketsEnProceso: null });
const loading = ref(true);
const error = ref(null);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const data = await api.getContracts();
    contracts.value = data;
    // TODO (candidato): el candidato debe implementar aquí el cálculo de
    // ticketsPendientes y ticketsEnProceso (ver opciones A y B en la cabecera).
    stats.value = {
      contratosActivos: data.filter((c) => c.estatus === 'ACTIVO').length,
      ticketsPendientes: null, // <- reemplazar null por el conteo real
      ticketsEnProceso: null, // <- reemplazar null por el conteo real
    };
  } catch (err) {
    error.value = err;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <h1>Dashboard</h1>

  <section class="stats">
    <StatCard label="Contratos activos" :value="stats.contratosActivos" tone="info" />
    <StatCard label="Tickets pendientes" :value="stats.ticketsPendientes" tone="warning" />
    <StatCard label="Tickets en proceso" :value="stats.ticketsEnProceso" tone="success" />
  </section>

  <section>
    <h2>Contratos</h2>
    <LoadingMessage v-if="loading" />
    <ErrorMessage :error="error" :on-retry="load" />
    <ContractList v-if="!loading && !error" :contracts="contracts" />
  </section>
</template>
