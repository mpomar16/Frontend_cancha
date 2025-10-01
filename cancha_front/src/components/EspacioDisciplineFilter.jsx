import { useState, useEffect } from 'react';
import { listarDisciplinas, buscarEspaciosPorDisciplina } from '../services/espacioService';

function EspacioDisciplineFilter({ onSearchResults }) {
  const [disciplinas, setDisciplinas] = useState([]);
  const [selectedDisciplina, setSelectedDisciplina] = useState('');
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

  const handleFilter = async () => {
    if (!selectedDisciplina) {
      onSearchResults([]);
      return;
    }
    try {
      const response = await buscarEspaciosPorDisciplina(selectedDisciplina);
      onSearchResults(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex gap-4">
        <select
          value={selectedDisciplina}
          onChange={(e) => setSelectedDisciplina(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Seleccionar Disciplina</option>
          {disciplinas.map((disciplina) => (
            <option key={disciplina} value={disciplina}>{disciplina}</option>
          ))}
        </select>
        <button
          onClick={handleFilter}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Filtrar
        </button>
      </div>
    </div>
  );
}

export default EspacioDisciplineFilter;