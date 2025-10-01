import { useState } from 'react';
import { buscarPersonaPorNombre, obtenerPersonaPorCorreo } from '../services/personaService';

function SearchBar({ onSearchResults }) {
  const [searchType, setSearchType] = useState('nombre');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      let results;
      if (searchType === 'nombre') {
        results = await buscarPersonaPorNombre(searchTerm, token);
      } else {
        results = await obtenerPersonaPorCorreo(searchTerm, token);
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
          <option value="nombre">Nombre</option>
          <option value="correo">Correo</option>
        </select>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Buscar por ${searchType}`}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Buscar
        </button>
      </div>
    </form>
  );
}

export default SearchBar;