import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import TicketTable from '../components/TicketTable.jsx';
import { ErrorMessage, Loading } from '../components/Feedback.jsx';
import { formatDate, TICKET_STATUS } from '../utils/format.js';

/**
 * Detalle del contrato + tabla de tickets.
 *
 * Lo que ya está hecho: carga del contrato y de sus tickets, estados de carga y error,
 * tabla de tickets con columna de acciones.
 *
 * TODO (candidato):
 *   1. Completar `getAvailableActions(ticket, user)` con las reglas de PRUEBA_TECNICA.md §6.5 y §9:
 *        - Transiciones: PENDIENTE/ASIGNADO → EN_PROCESO; EN_PROCESO → FINALIZADO;
 *          cualquiera no final → CANCELADO. FINALIZADO y CANCELADO no tienen acciones.
 *        - Un TECNICO solo puede actuar sobre tickets asignados a él.
 *        - Si el contrato no está ACTIVO no hay acciones.
 *   2. Completar `handleChangeStatus` llamando a api.updateTicketStatus(id, estatus),
 *      refrescando la tabla y mostrando el error (403/409) si el backend lo rechaza.
 *      Recuerda: ocultar un botón no sustituye la validación del backend.
 */
export default function ContractDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [contract, setContract] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyTicketId, setBusyTicketId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, t] = await Promise.all([api.getContract(id), api.getContractTickets(id)]);
      setContract(c);
      setTickets(t);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * Devuelve las acciones disponibles para un ticket según rol y estatus.
   * @returns {Array<{ label: string, estatus: string, tone?: string }>}
   */
  const getAvailableActions = (ticket, currentUser) => {
    // TODO (candidato): implementar reglas. Ejemplo de forma de retorno:
    // return [{ label: 'Iniciar', estatus: TICKET_STATUS.EN_PROCESO }, { label: 'Cancelar', estatus: TICKET_STATUS.CANCELADO, tone: 'danger' }];
    void ticket;
    void currentUser;
    void TICKET_STATUS;
    return [];
  };

  const handleChangeStatus = async (ticket, estatus) => {
    setActionError(null);
    setBusyTicketId(ticket.id);
    try {
      // TODO (candidato): await api.updateTicketStatus(ticket.id, estatus); y refrescar.
      void estatus;
    } catch (err) {
      setActionError(err);
    } finally {
      setBusyTicketId(null);
    }
  };

  const renderActions = (ticket) =>
    getAvailableActions(ticket, user).map((action) => (
      <button
        key={action.estatus}
        type="button"
        className={`btn btn-small ${action.tone === 'danger' ? 'btn-danger' : 'btn-secondary'}`}
        disabled={busyTicketId === ticket.id}
        onClick={() => handleChangeStatus(ticket, action.estatus)}
      >
        {action.label}
      </button>
    ));

  if (loading) return <Loading />;
  if (error) return <ErrorMessage error={error} onRetry={load} />;
  if (!contract) return null;

  return (
    <>
      <p>
        <Link to="/">← Volver al dashboard</Link>
      </p>

      <section className="card">
        <h1>Contrato: {contract.numero}</h1>
        <dl className="details">
          <dt>Nombre</dt>
          <dd>{contract.nombre}</dd>
          <dt>Inicio</dt>
          <dd>{formatDate(contract.fechaInicio)}</dd>
          <dt>Fin</dt>
          <dd>{formatDate(contract.fechaFin)}</dd>
          <dt>Estatus</dt>
          <dd>
            <StatusBadge status={contract.estatus} />
          </dd>
          <dt>Responsable</dt>
          <dd>{contract.responsable?.nombre ?? '—'}</dd>
        </dl>
      </section>

      <section>
        <h2>Tickets</h2>
        <ErrorMessage error={actionError} />
        <TicketTable tickets={tickets} renderActions={renderActions} />
      </section>
    </>
  );
}
