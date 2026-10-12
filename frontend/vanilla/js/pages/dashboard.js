import { api } from '../api.js';
import { statCard, contractList, loading, errorMessage } from '../components.js';

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
 *      error con errorMessage() en lugar de dejar los contadores en "—".
 *
 * Resultado esperado con los datos iniciales:
 *      administrador y supervisor → activos 3, pendientes 6, en proceso 3
 *      tecnico01 → 2, 0, 0   ·   tecnico02 → 3, 0, 1   ·   tecnico03 → 2, 0, 2
 * ===================================================================== */

/**
 * Dashboard: contadores + lista de contratos del usuario autenticado.
 *
 * Patrón de todas las páginas: un objeto `state`, una función `view()` que
 * pinta el estado completo en `el` y engancha eventos, y una función `load()`
 * que llama a la API y vuelve a pintar.
 *
 * @param {HTMLElement} el  Contenedor donde se pinta la pantalla.
 */
export function renderDashboard(el) {
  const state = {
    contracts: [],
    stats: { contratosActivos: null, ticketsPendientes: null, ticketsEnProceso: null },
    loading: true,
    error: null,
  };

  function view() {
    el.innerHTML = `
      <h1>Dashboard</h1>

      <section class="stats">
        ${statCard({ label: 'Contratos activos', value: state.stats.contratosActivos, tone: 'info' })}
        ${statCard({ label: 'Tickets pendientes', value: state.stats.ticketsPendientes, tone: 'warning' })}
        ${statCard({ label: 'Tickets en proceso', value: state.stats.ticketsEnProceso, tone: 'success' })}
      </section>

      <section>
        <h2>Contratos</h2>
        ${state.loading ? loading() : ''}
        ${errorMessage(state.error, { retry: true })}
        ${!state.loading && !state.error ? contractList(state.contracts) : ''}
      </section>`;

    el.querySelector('[data-retry]')?.addEventListener('click', load);
  }

  async function load() {
    state.loading = true;
    state.error = null;
    view();
    try {
      const data = await api.getContracts();
      state.contracts = data;
      // TODO (candidato): el candidato debe implementar aquí el cálculo de
      // ticketsPendientes y ticketsEnProceso (ver opciones A y B en la cabecera).
      state.stats = {
        contratosActivos: data.filter((c) => c.estatus === 'ACTIVO').length,
        ticketsPendientes: null, // <- reemplazar null por el conteo real
        ticketsEnProceso: null, // <- reemplazar null por el conteo real
      };
    } catch (err) {
      state.error = err;
    } finally {
      state.loading = false;
      if (el.isConnected) view(); // no pintar si el usuario ya cambió de pantalla
    }
  }

  load();
}
