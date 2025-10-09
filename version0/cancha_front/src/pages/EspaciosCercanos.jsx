/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { listarEspaciosCercanos } from '../services/espacioService';
import EspacioCard from '../components/EspacioFila';
import EmpresaNavbar from '../components/EmpresaNavbar';

function EspaciosCercanos() {
  const [espacios, setEspacios] = useState([]);
  const [limit, setLimit] = useState(12);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchEspacios() {
      try {
        const response = await listarEspaciosCercanos(limit, offset, token);
        setEspacios(response.data.espacios);
        setHasMore(response.data.hasMore);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchEspacios();
  }, [limit, offset, token]);

  return (
    <div>
      <EmpresaNavbar/>
      <h1 className="text-2xl font-bold mb-4">Espacios Deportivos Cercanos</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {espacios.map((espacio) => (
          <EspacioCard key={espacio.id_espacio} espacio={espacio} />
        ))}
      </div>
      <div className="mt-4 flex gap-4">
        <button
          onClick={() => setOffset((prev) => Math.max(prev - limit, 0))}
          disabled={offset === 0}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Anterior
        </button>
        <button
          onClick={() => setOffset((prev) => prev + limit)}
          disabled={!hasMore}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default EspaciosCercanos;