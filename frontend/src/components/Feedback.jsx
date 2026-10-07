/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: COMPLETO. No es necesario modificarlo.
 * El candidato debe implementar en esta sección: nada obligatorio.
 * Usar <Loading /> mientras se cargan datos y <ErrorMessage error={err} />
 * para mostrar errores de la API (muestra `err.message`).
 * ===================================================================== */

/** Indicadores de carga y error reutilizables. */

export function Loading({ text = 'Cargando…' }) {
  return (
    <p className="loading" role="status">
      {text}
    </p>
  );
}

export function ErrorMessage({ error, onRetry }) {
  if (!error) return null;
  const message = typeof error === 'string' ? error : error.message ?? 'Ocurrió un error';
  return (
    <div className="alert alert-error" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="btn btn-link" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
