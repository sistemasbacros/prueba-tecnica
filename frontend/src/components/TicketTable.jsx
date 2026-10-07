import StatusBadge from './StatusBadge.jsx';
import { formatDate, typeLabel } from '../utils/format.js';

/**
 * Tabla de tickets de un contrato.
 *
 * @param {object} props
 * @param {Array}  props.tickets        Tickets tal como los devuelve GET /api/contracts/{id}/tickets
 * @param {(ticket) => React.ReactNode} [props.renderActions]
 *        Función que devuelve los botones de la columna "Acciones" para un ticket.
 *        Si no se pasa, la columna no se muestra.
 */
export default function TicketTable({ tickets, renderActions }) {
  if (!tickets?.length) {
    return <p className="empty">No hay tickets para mostrar.</p>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tipo</th>
          <th>Descripción</th>
          <th>Solicitud</th>
          <th>Estatus</th>
          <th>Asignado a</th>
          {renderActions && <th>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {tickets.map((t) => (
          <tr key={t.id}>
            <td>{t.id}</td>
            <td>{typeLabel(t.tipo)}</td>
            <td>{t.descripcion}</td>
            <td>{formatDate(t.fechaSolicitud)}</td>
            <td>
              <StatusBadge status={t.estatus} />
            </td>
            <td>{t.usuarioAsignado?.nombre ?? '—'}</td>
            {renderActions && <td className="actions">{renderActions(t)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
