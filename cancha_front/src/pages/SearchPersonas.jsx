import { useState } from "react";
import SearchBar from "../components/SearchBar";
import PersonaCard from "../components/PersonaCard";

function SearchPersonas() {
  const [results, setResults] = useState([]);

  const handleSearchResults = (data) => {
    setResults(Array.isArray(data) ? data : [data]);
  };

  return (
    <div className="p-6 pt-16">
      {" "}
      {/* Espacio superior para que no quede pegado */}
      {/* Título */}
      <h1 className="text-4xl font-poppins font-bold text-azul-950 text-center mb-4">
        Busqueda de Personas
      </h1>
      {/* Mensaje de acceso restringido */}
      {localStorage.getItem("role") !== "ADMINISTRADOR" && (
        <p className="text-red-500 font-poppins text-center mb-2">
          Acceso restringido: Solo para administradores
        </p>
      )}
      {/* Barra de búsqueda */}
      <div className="mb-6">
        <SearchBar
          onSearchResults={handleSearchResults}
          className="font-poppins text-azul-950"
        />
      </div>
      {/* Resultados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((persona) => (
          <PersonaCard key={persona.id_persona} persona={persona} />
        ))}
      </div>
      {/* Botón */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setResults([])}
          className="bg-verde-600 text-white px-8 py-3 rounded-full font-poppins font-semibold hover:bg-verde-700 transition-colors duration-300"
        >
          Limpiar Resultados
        </button>
      </div>
    </div>
  );
}

export default SearchPersonas;
