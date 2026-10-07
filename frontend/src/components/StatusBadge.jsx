import { statusLabel } from '../utils/format.js';

/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: COMPLETO. No es necesario modificarlo.
 * El candidato debe implementar en esta sección: nada obligatorio.
 * ===================================================================== */

/** Etiqueta de color para estatus de contratos y tickets. */
export default function StatusBadge({ status }) {
  return <span className={`badge badge-status badge-${String(status).toLowerCase()}`}>{statusLabel(status)}</span>;
}
