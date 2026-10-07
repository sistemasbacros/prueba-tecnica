import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import { formatDate } from '../utils/format.js';

/**
 * Tabla de contratos. Cada fila enlaza al detalle.
 * @param {{ contracts: Array<{id:number, numero:string, nombre:string, fechaInicio:string, fechaFin:string, estatus:string}> }} props
 */
export default function ContractList({ contracts }) {
  if (!contracts?.length) {
    return <p className="empty">No hay contratos para mostrar.</p>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Número</th>
          <th>Nombre</th>
          <th>Inicio</th>
          <th>Fin</th>
          <th>Estatus</th>
        </tr>
      </thead>
      <tbody>
        {contracts.map((c) => (
          <tr key={c.id}>
            <td>
              <Link to={`/contracts/${c.id}`}>{c.numero}</Link>
            </td>
            <td>{c.nombre}</td>
            <td>{formatDate(c.fechaInicio)}</td>
            <td>{formatDate(c.fechaFin)}</td>
            <td>
              <StatusBadge status={c.estatus} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
