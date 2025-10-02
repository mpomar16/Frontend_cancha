/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { listarPersonas } from '../services/personaService';
import PersonaCard from '../components/PersonaCard';
import SideBar from '../components/Sidebar';

function PersonasList() {
  const [personas, setPersonas] = useState([]);
  const [limit, setLimit] = useState(12);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  // 🔹 Recuperar roles del localStorage (array)
  const roles = JSON.parse(localStorage.getItem('roles') || '[]');
  const isAdmin = roles.includes('ADMINISTRADOR');

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

    if (isAdmin) {
      fetchPersonas();
    }
  }, [limit, offset, token, isAdmin]);

  return (
  <div className="flex min-h-screen bg-gray-50">
    {/* Sidebar fijo */}
    <SideBar />

    {/* Contenido principal */}
    <main className="flex-1 ml-64 p-6">
      <h1 className="text-2xl font-bold mb-6 text-azul-950">
        Lista de Personas
      </h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!isAdmin && (
        <p className="text-red-500 font-semibold">
          Acceso restringido: Solo para administradores
        </p>
      )}

      {isAdmin && (
        <>
          {/* Grid de personas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((persona) => (
              <PersonaCard key={persona.id_persona} persona={persona} />
            ))}
          </div>

          {/* Paginación */}
          <div className="mt-6 flex gap-4 justify-center">
            <button
              onClick={() => setOffset((prev) => Math.max(prev - limit, 0))}
              disabled={offset === 0}
              className="px-4 py-2 bg-verde-600 text-white font-medium rounded-md shadow hover:bg-verde-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setOffset((prev) => prev + limit)}
              disabled={!hasMore}
              className="px-4 py-2 bg-verde-600 text-white font-medium rounded-md shadow hover:bg-verde-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </main>
  </div>
);

}

export default PersonasList;
