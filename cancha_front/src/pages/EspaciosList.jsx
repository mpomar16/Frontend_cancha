import { useState, useEffect } from 'react';
import { listarEspacios, listarEspaciosGeneral } from '../services/espacioService';
import EspacioCard from '../components/EspacioCard';
import EspacioSearchBar from '../components/EspacioSearchBar';

function EspaciosList() {
  const [espacios, setEspacios] = useState([]);
  const [limit, setLimit] = useState(12);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const [isSearch, setIsSearch] = useState(false);
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  useEffect(() => {
    async function fetchEspacios() {
      try {
        const response = isLoggedIn
          ? await listarEspacios(limit, offset)
          : await listarEspaciosGeneral(limit, offset);
        setEspacios(response.data.espacios);
        setHasMore(response.data.hasMore);
        setIsSearch(false);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchEspacios();
  }, [limit, offset, isLoggedIn]);

  const handleSearchResults = (results) => {
    setEspacios(results);
    setIsSearch(true);
    setHasMore(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Lista de Espacios Deportivos</h1>
      <EspacioSearchBar onSearchResults={handleSearchResults} />
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {espacios.map((espacio) => (
          <EspacioCard key={espacio.id_espacio} espacio={espacio} />
        ))}
      </div>
      {!isSearch && (
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
      )}
    </div>
  );
}

export default EspaciosList;