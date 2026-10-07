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
