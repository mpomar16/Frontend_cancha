import { useState, useEffect } from 'react';
import { listarPersonas } from '../services/personaService';
import PersonaCard from '../components/PersonaCard';

function PersonasList() {
  const [personas, setPersonas] = useState([]);
  const [limit, setLimit] = useState(12);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchPersonas() {
      try {
        const response = await listarPersonas(limit, offset, token);
        setPersonas(response.data.personas);
        setHasMore(response.data.hasMore);
      } catch (err) {
        setError(err.message);
      }
    }
    if (localStorage.getItem('role') === 'ADMINISTRADOR') {
      fetchPersonas();
    }
  }, [limit, offset, token]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Lista de Personas</h1>
      {error && <p className="text-red-500">{error}</p>}
      {localStorage.getItem('role') !== 'ADMINISTRADOR' && (
        <p className="text-red-500">Acceso restringido: Solo para administradores</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((persona) => (
          <PersonaCard key={persona.id_persona} persona={persona} />
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

export default PersonasList;