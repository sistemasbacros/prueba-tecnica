import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import StatCard from '../components/StatCard.jsx';
import ContractList from '../components/ContractList.jsx';
import { ErrorMessage, Loading } from '../components/Feedback.jsx';

/**
 * Dashboard: contadores + lista de contratos del usuario autenticado.
 *
 * Lo que ya está hecho: carga de contratos, contador de contratos activos,
 * estados de carga y error.
 *
 * TODO (candidato): calcular `ticketsPendientes` y `ticketsEnProceso`.
 *   Opción A: implementar GET /api/dashboard en tu backend y usar api.getDashboard().
 *   Opción B: cargar los tickets de cada contrato con api.getContractTickets(id)
 *             y contarlos en el frontend.
 *   Los contadores deben reflejar solo lo que el usuario puede ver (un técnico
 *   solo cuenta sus tickets). Valores esperados con los datos iniciales para
 *   `supervisor`: activos 2, pendientes 5, en proceso 3.
 */
export default function DashboardPage() {
  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState({ contratosActivos: null, ticketsPendientes: null, ticketsEnProceso: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getContracts();
      setContracts(data);
      setStats({
        contratosActivos: data.filter((c) => c.estatus === 'ACTIVO').length,
        ticketsPendientes: null, // TODO (candidato)
        ticketsEnProceso: null, // TODO (candidato)
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <h1>Dashboard</h1>

      <section className="stats">
        <StatCard label="Contratos activos" value={stats.contratosActivos} tone="info" />
        <StatCard label="Tickets pendientes" value={stats.ticketsPendientes} tone="warning" />
        <StatCard label="Tickets en proceso" value={stats.ticketsEnProceso} tone="success" />
      </section>

      <section>
        <h2>Contratos</h2>
        {loading && <Loading />}
        <ErrorMessage error={error} onRetry={load} />
        {!loading && !error && <ContractList contracts={contracts} />}
      </section>
    </>
  );
}
