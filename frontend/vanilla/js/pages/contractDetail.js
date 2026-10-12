import { api } from '../api.js';
import { auth } from '../session.js';
import { statusBadge, ticketTable, loading, errorMessage, esc } from '../components.js';
import { formatDate, TICKET_STATUS } from '../format.js';

/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: REQUIERE IMPLEMENTACIÓN.
 *
 * Ya está hecho: carga del contrato (GET /api/contracts/{id}) y de sus tickets
 * (GET /api/contracts/{id}/tickets) en paralelo, ficha del contrato, tabla de
 * tickets con columna "Acciones", estados de carga y error, botones deshabilitados
 * mientras se procesa una acción.
 *
 * El candidato debe implementar en esta sección:
 *
 *   1. La función `getAvailableActions(ticket, currentUser)`.
 *      Debe devolver la lista de botones que ese usuario puede pulsar sobre ese
 *      ticket, con la forma [{ label, estatus, tone? }]. Reglas:
 *
 *        Estatus actual     → acciones permitidas
 *        PENDIENTE          → "Iniciar" (EN_PROCESO), "Cancelar" (CANCELADO)
 *        ASIGNADO           → "Iniciar" (EN_PROCESO), "Cancelar" (CANCELADO)
 *        EN_PROCESO         → "Finalizar" (FINALIZADO), "Cancelar" (CANCELADO)
 *        FINALIZADO         → ninguna
 *        CANCELADO          → ninguna
 *
 *        Además:
 *        - Si `state.contract.estatus` no es 'ACTIVO' → ninguna acción para nadie.
 *        - Si currentUser.role es 'TECNICO' → solo hay acciones cuando
 *          ticket.usuarioAsignado?.id === currentUser.id.
 *        - ADMINISTRADOR y SUPERVISOR pueden actuar sobre cualquier ticket.
 *        - Usar tone: 'danger' para "Cancelar" (se pinta en rojo).
 *
 *   2. La función `handleChangeStatus(ticket, estatus)`.
 *      Debe:
 *        a) llamar a `await api.updateTicketStatus(ticket.id, estatus)`;
 *        b) refrescar la tabla (llamar a `load()` o reemplazar el ticket en
 *           `state.tickets` con la respuesta del backend);
 *        c) si el backend responde 403 o 409, mostrar el mensaje con
 *           errorMessage(state.actionError) (ya está en `view()`).
 *
 *   3. Comprobar que la seguridad NO depende de los botones: aunque se oculten,
 *      el backend debe rechazar con 403 el PATCH de un técnico sobre un ticket
 *      ajeno y con 409 el PATCH sobre un ticket FINALIZADO. Prueba hacerlo con
 *      curl o Postman y documéntalo en el README.
 *
 * Opcional (solo si sobra tiempo): botón "Asignar" para ADMINISTRADOR/SUPERVISOR
 * usando api.getUsers('TECNICO') y api.assignTicket(id, idUsuario).
 * ===================================================================== */

/**
 * Detalle del contrato + tabla de tickets.
 *
 * @param {HTMLElement} el       Contenedor donde se pinta la pantalla.
 * @param {{ id: string }} params  Parámetros de la ruta #/contracts/:id
 */
export function renderContractDetail(el, { id }) {
  const state = {
    contract: null,
    tickets: [],
    loading: true,
    error: null,
    actionError: null,
    busyTicketId: null,
  };

  function view() {
    if (state.loading) {
      el.innerHTML = loading();
      return;
    }
    if (state.error) {
      el.innerHTML = errorMessage(state.error, { retry: true });
      el.querySelector('[data-retry]')?.addEventListener('click', load);
      return;
    }
    if (!state.contract) {
      el.innerHTML = '';
      return;
    }

    const c = state.contract;
    el.innerHTML = `
      <p><a href="#/">← Volver al dashboard</a></p>

      <section class="card">
        <h1>Contrato: ${esc(c.numero)}</h1>
        <dl class="details">
          <dt>Nombre</dt>
          <dd>${esc(c.nombre)}</dd>
          <dt>Inicio</dt>
          <dd>${esc(formatDate(c.fechaInicio))}</dd>
          <dt>Fin</dt>
          <dd>${esc(formatDate(c.fechaFin))}</dd>
          <dt>Estatus</dt>
          <dd>${statusBadge(c.estatus)}</dd>
          <dt>Responsable</dt>
          <dd>${esc(c.responsable?.nombre ?? '—')}</dd>
        </dl>
      </section>

      <section>
        <h2>Tickets</h2>
        ${errorMessage(state.actionError)}
        ${ticketTable(state.tickets, { renderActions })}
      </section>`;
  }

  async function load() {
    state.loading = true;
    state.error = null;
    view();
    try {
      const [c, t] = await Promise.all([api.getContract(id), api.getContractTickets(id)]);
      state.contract = c;
      state.tickets = t;
    } catch (err) {
      state.error = err;
    } finally {
      state.loading = false;
      if (el.isConnected) view(); // no pintar si el usuario ya cambió de pantalla
    }
  }

  /**
   * Devuelve las acciones disponibles para un ticket según rol y estatus.
   *
   * TODO (candidato): el candidato debe implementar aquí las reglas descritas en
   * la cabecera del archivo (punto 1). Ejemplo de valor de retorno para un ticket
   * ASIGNADO visto por un supervisor:
   *
   *   return [
   *     { label: 'Iniciar',  estatus: TICKET_STATUS.EN_PROCESO },
   *     { label: 'Cancelar', estatus: TICKET_STATUS.CANCELADO, tone: 'danger' },
   *   ];
   *
   * @param {object} ticket       Ticket tal como lo devuelve la API (id, estatus, usuarioAsignado, ...)
   * @param {object} currentUser  Usuario autenticado ({ id, username, role })
   * @returns {Array<{ label: string, estatus: string, tone?: string }>}
   */
  function getAvailableActions(ticket, currentUser) {
    void ticket;
    void currentUser;
    void TICKET_STATUS;
    void state.contract;
    return []; // <- reemplazar por la lista de acciones según las reglas
  }

  /**
   * Cambia el estatus de un ticket.
   *
   * TODO (candidato): el candidato debe implementar aquí los pasos a) b) c) de la
   * cabecera del archivo (punto 2): llamar a api.updateTicketStatus, refrescar la
   * tabla y dejar que el catch muestre el error 403/409 del backend.
   *
   * @param {object} ticket   Ticket sobre el que se actúa
   * @param {string} estatus  Nuevo estatus (uno de TICKET_STATUS)
   */
  async function handleChangeStatus(ticket, estatus) {
    state.actionError = null;
    state.busyTicketId = ticket.id;
    view();
    try {
      void estatus; // <- reemplazar por: await api.updateTicketStatus(ticket.id, estatus); await load();
    } catch (err) {
      state.actionError = err;
    } finally {
      state.busyTicketId = null;
      if (el.isConnected) view();
    }
  }

  /** HTML de los botones de la columna "Acciones" para un ticket (los pinta ticketTable). */
  function renderActions(ticket) {
    return getAvailableActions(ticket, auth.user)
      .map(
        (action) => `
          <button
            type="button"
            class="btn btn-small ${action.tone === 'danger' ? 'btn-danger' : 'btn-secondary'}"
            data-ticket-id="${esc(ticket.id)}"
            data-estatus="${esc(action.estatus)}"
            ${state.busyTicketId === ticket.id ? 'disabled' : ''}
          >${esc(action.label)}</button>`,
      )
      .join('');
  }

  // Clic en cualquier botón de acción (delegado: la tabla se vuelve a pintar en cada cambio).
  el.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-ticket-id]');
    if (!button) return;
    const ticket = state.tickets.find((t) => String(t.id) === button.dataset.ticketId);
    if (ticket) handleChangeStatus(ticket, button.dataset.estatus);
  });

  load();
}
