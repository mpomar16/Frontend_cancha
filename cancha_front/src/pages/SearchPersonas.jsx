import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import PersonaCard from '../components/PersonaCard';

function SearchPersonas() {
  const [results, setResults] = useState([]);

  const handleSearchResults = (data) => {
    setResults(Array.isArray(data) ? data : [data]);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Buscar Personas</h1>
      {localStorage.getItem('role') !== 'ADMINISTRADOR' && (
        <p className="text-red-500">Acceso restringido: Solo para administradores</p>
      )}
      <SearchBar onSearchResults={handleSearchResults} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((persona) => (
          <PersonaCard key={persona.id_persona} persona={persona} />
        ))}
      </div>
    </div>
  );
}

export default SearchPersonas;