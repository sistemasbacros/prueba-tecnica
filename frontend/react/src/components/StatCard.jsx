/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: COMPLETO. No es necesario modificarlo.
 * El candidato debe implementar en esta sección: nada obligatorio.
 * ===================================================================== */

/** Tarjeta de indicador para el dashboard. `tone`: neutral | info | warning | success. */
export default function StatCard({ label, value, tone = 'neutral' }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value ?? '—'}</span>
    </div>
  );
}
