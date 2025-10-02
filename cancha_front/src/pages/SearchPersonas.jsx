import { useState } from "react";
import SearchBar from "../components/SearchBar";
import PersonaCard from "../components/PersonaCard";

function SearchPersonas() {
  const [results, setResults] = useState([]);

  const handleSearchResults = (data) => {
    setResults(Array.isArray(data) ? data : [data]);
  };

  const handleClearResults = () => {
    setResults([]);
  };

  const role = localStorage.getItem("role");

  return (
    <div className="p-6 pt-2">
      {/* Título */}
      <h1 className="text-4xl font-poppins font-bold text-azul-950 text-center mb-4">
        Buscar Personas
      </h1>

      {/* Acceso restringido */}
      {role !== "ADMINISTRADOR" && (
        <p className="text-red-500 font-poppins text-center mb-4">
          {/*Acceso restringido: Solo para administradores*/}
        </p>
      )}

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <SearchBar onSearchResults={handleSearchResults} />
      </div>

      {/* Resultados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((persona) => (
          <PersonaCard key={persona.id_persona} persona={persona} />
        ))}
      </div>

      {/* Botón limpiar */}
      {results.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleClearResults}
            className="bg-verde-600 text-white px-8 py-3 rounded-full font-poppins font-semibold hover:bg-verde-700 transition-colors duration-300"
          >
            Limpiar Resultados
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchPersonas;
