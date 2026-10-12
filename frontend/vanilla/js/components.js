import { formatDate, statusLabel, typeLabel } from './format.js';

/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: COMPLETO. No es necesario modificarlo.
 *
 * El candidato debe implementar en esta sección: nada. Los botones de la
 * columna "Acciones" de la tabla de tickets se definen desde
 * pages/contractDetail.js a través del parámetro `renderActions`; ahí es
 * donde va la lógica por rol y estatus.
 * ===================================================================== */

/**
 * Componentes de la interfaz como funciones que devuelven HTML (cadenas).
 * Cada página inserta el resultado con `el.innerHTML = ...` y luego engancha
 * sus eventos. Todo valor que venga de la API pasa por `esc()` para evitar
 * inyección de HTML.
 */

/** Escapa texto para insertarlo en HTML. */
export function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Cabecera común (título, usuario y rol, botón Salir) con un hueco <main id="page"> para la pantalla. */
export function layout(user) {
  return `
    <div class="app">
      <header class="app-header">
        <a href="#/" class="app-title">Sistema de Mantenimiento</a>
        <div class="app-user">
          <span>
            Usuario: <strong>${esc(user?.username)}</strong>
            <span class="badge badge-role">${esc(user?.role)}</span>
          </span>
          <button type="button" class="btn btn-secondary" data-logout>Salir</button>
        </div>
      </header>
      <main class="app-main" id="page"></main>
    </div>`;
}

/** Tarjeta de indicador para el dashboard. `tone`: neutral | info | warning | success. */
export function statCard({ label, value, tone = 'neutral' }) {
  return `
    <div class="stat-card stat-${esc(tone)}">
      <span class="stat-label">${esc(label)}</span>
      <span class="stat-value">${esc(value ?? '—')}</span>
    </div>`;
}

/** Etiqueta de color para estatus de contratos y tickets. */
export function statusBadge(status) {
  return `<span class="badge badge-status badge-${esc(String(status).toLowerCase())}">${esc(statusLabel(status))}</span>`;
}

/** "Cargando…" */
export function loading(text = 'Cargando…') {
  return `<p class="loading" role="status">${esc(text)}</p>`;
}

/**
 * Mensaje de error. Devuelve '' si no hay error.
 *   error  ApiError | Error | string | null
 *   retry  si es true, incluye un botón "Reintentar" con el atributo data-retry;
 *          la página debe engancharle el evento click.
 */
export function errorMessage(error, { retry = false } = {}) {
  if (!error) return '';
  const message = typeof error === 'string' ? error : error.message ?? 'Ocurrió un error';
  return `
    <div class="alert alert-error" role="alert">
      <span>${esc(message)}</span>
      ${retry ? '<button type="button" class="btn btn-link" data-retry>Reintentar</button>' : ''}
    </div>`;
}

/**
 * Tabla de contratos. Cada fila enlaza al detalle.
 * @param {Array<{id:number, numero:string, nombre:string, fechaInicio:string, fechaFin:string, estatus:string}>} contracts
 */
export function contractList(contracts) {
  if (!contracts?.length) {
    return '<p class="empty">No hay contratos para mostrar.</p>';
  }
  const rows = contracts
    .map(
      (c) => `
        <tr>
          <td><a href="#/contracts/${esc(c.id)}">${esc(c.numero)}</a></td>
          <td>${esc(c.nombre)}</td>
          <td>${esc(formatDate(c.fechaInicio))}</td>
          <td>${esc(formatDate(c.fechaFin))}</td>
          <td>${statusBadge(c.estatus)}</td>
        </tr>`,
    )
    .join('');

  return `
    <table class="table">
      <thead>
        <tr><th>Número</th><th>Nombre</th><th>Inicio</th><th>Fin</th><th>Estatus</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

/**
 * Tabla de tickets de un contrato.
 *
 * @param {Array} tickets   Tickets tal como los devuelve GET /api/contracts/{id}/tickets
 * @param {object} [options]
 * @param {(ticket) => string} [options.renderActions]
 *        Función que devuelve el HTML de los botones de la columna "Acciones"
 *        para un ticket. Si no se pasa, la columna no se muestra.
 */
export function ticketTable(tickets, { renderActions } = {}) {
  if (!tickets?.length) {
    return '<p class="empty">No hay tickets para mostrar.</p>';
  }
  const rows = tickets
    .map(
      (t) => `
        <tr>
          <td>${esc(t.id)}</td>
          <td>${esc(typeLabel(t.tipo))}</td>
          <td>${esc(t.descripcion)}</td>
          <td>${esc(formatDate(t.fechaSolicitud))}</td>
          <td>${statusBadge(t.estatus)}</td>
          <td>${esc(t.usuarioAsignado?.nombre ?? '—')}</td>
          ${renderActions ? `<td class="actions">${renderActions(t)}</td>` : ''}
        </tr>`,
    )
    .join('');

  return `
    <table class="table">
      <thead>
        <tr>
          <th>ID</th><th>Tipo</th><th>Descripción</th><th>Solicitud</th>
          <th>Estatus</th><th>Asignado a</th>${renderActions ? '<th>Acciones</th>' : ''}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}
