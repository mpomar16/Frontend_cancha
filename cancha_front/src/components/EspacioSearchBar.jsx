import { useState, useEffect } from 'react';
import { buscarEspaciosPorNombreODireccion, buscarEspaciosPorDisciplina, listarDisciplinas } from '../services/espacioService';

function EspacioSearchBar({ onSearchResults }) {
  const [searchType, setSearchType] = useState('nombre');
  const [searchTerm, setSearchTerm] = useState('');
  const [disciplinas, setDisciplinas] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDisciplinas() {
      try {
        const response = await listarDisciplinas();
        setDisciplinas(response.data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchDisciplinas();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      let results;
      if (searchType === 'nombre') {
        results = await buscarEspaciosPorNombreODireccion(searchTerm);
      } else {
        results = await buscarEspaciosPorDisciplina(searchTerm);
      }
      onSearchResults(results.data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md mb-4">
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex gap-4">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="nombre">Nombre o Dirección</option>
          <option value="disciplina">Disciplina</option>
        </select>
        {searchType === 'nombre' ? (
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o dirección"
            className="w-full p-2 border rounded"
          />
        ) : (
          <select
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Seleccione una disciplina</option>
            {disciplinas.map((disciplina) => (
              <option key={disciplina} value={disciplina}>{disciplina}</option>
            ))}
          </select>
        )}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Buscar
        </button>
      </div>
    </form>
  );
}

export default EspacioSearchBar;