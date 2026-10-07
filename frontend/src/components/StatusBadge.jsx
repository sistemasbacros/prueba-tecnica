import { statusLabel } from '../utils/format.js';

/** Etiqueta de color para estatus de contratos y tickets. */
export default function StatusBadge({ status }) {
  return <span className={`badge badge-status badge-${String(status).toLowerCase()}`}>{statusLabel(status)}</span>;
}
