import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import TicketTable from '../components/TicketTable.jsx';
import { ErrorMessage, Loading } from '../components/Feedback.jsx';
import { formatDate, TICKET_STATUS } from '../utils/format.js';

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
 *        - Si `contract.estatus` no es 'ACTIVO' → ninguna acción para nadie.
 *        - Si currentUser.role es 'TECNICO' → solo hay acciones cuando
 *          ticket.usuarioAsignado?.id === currentUser.id.
 *        - ADMINISTRADOR y SUPERVISOR pueden actuar sobre cualquier ticket.
 *        - Usar tone: 'danger' para "Cancelar" (se pinta en rojo).
 *
 *   2. La función `handleChangeStatus(ticket, estatus)`.
 *      Debe:
 *        a) llamar a `await api.updateTicketStatus(ticket.id, estatus)`;
 *        b) refrescar la tabla (llamar a `load()` o reemplazar el ticket en el
 *           estado con la respuesta del backend);
 *        c) si el backend responde 403 o 409, mostrar el mensaje con
 *           <ErrorMessage error={actionError} /> (ya está en el JSX).
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
  const getAvailableActions = (ticket, currentUser) => {
    void ticket;
    void currentUser;
    void TICKET_STATUS;
    void contract;
    return []; // <- reemplazar por la lista de acciones según las reglas
  };

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
  const handleChangeStatus = async (ticket, estatus) => {
    setActionError(null);
    setBusyTicketId(ticket.id);
    try {
      void estatus; // <- reemplazar por: await api.updateTicketStatus(ticket.id, estatus); await load();
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
