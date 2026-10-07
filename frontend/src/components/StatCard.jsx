/** Tarjeta de indicador para el dashboard. */
export default function StatCard({ label, value, tone = 'neutral' }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value ?? '—'}</span>
    </div>
  );
}
