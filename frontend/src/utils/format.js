/** Utilidades de formato y catálogos de la aplicación. */

export const ROLES = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  SUPERVISOR: 'SUPERVISOR',
  TECNICO: 'TECNICO',
};

export const TICKET_STATUS = {
  PENDIENTE: 'PENDIENTE',
  ASIGNADO: 'ASIGNADO',
  EN_PROCESO: 'EN_PROCESO',
  FINALIZADO: 'FINALIZADO',
  CANCELADO: 'CANCELADO',
};

const STATUS_LABELS = {
  PENDIENTE: 'Pendiente',
  ASIGNADO: 'Asignado',
  EN_PROCESO: 'En proceso',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
  ACTIVO: 'Activo',
};

const TYPE_LABELS = {
  PREVENTIVO: 'Preventivo',
  CORRECTIVO: 'Correctivo',
  EMERGENCIA: 'Emergencia',
};

export const statusLabel = (value) => STATUS_LABELS[value] ?? value ?? '';
export const typeLabel = (value) => TYPE_LABELS[value] ?? value ?? '';

/** "2026-01-01" o "2026-09-01T08:30:00" → "01/01/2026" */
export function formatDate(value) {
  if (!value) return '—';
  const [datePart] = String(value).split('T');
  const [y, m, d] = datePart.split('-');
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}
