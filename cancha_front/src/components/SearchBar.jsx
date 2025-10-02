import { useState } from "react";
import {
  buscarPersonaPorNombre,
  obtenerPersonaPorCorreo,
} from "../services/personaService";

function SearchBar({ onSearchResults }) {
  const [searchType, setSearchType] = useState("nombre");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      let results;
      if (searchType === "nombre") {
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
    <form
      onSubmit={handleSearch}
      className="bg-white p-6 rounded-lg shadow-md mb-4 w-full"
    >
      {error && <p className="text-red-500 font-poppins mb-2">{error}</p>}

      <div className="flex flex-col md:flex-row gap-4 w-full">
        {/* Select */}
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="w-full md:w-1/6 p-3 rounded-full border border-gray-300 font-poppins text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 transition-colors duration-300"
        >
          <option value="nombre" className="hover:bg-azul-900">
            Nombre
          </option>
          <option value="correo" className="hover:bg-azul-900">
            Correo
          </option>
        </select>

        {/* Input de búsqueda */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Buscar por ${searchType}`}
          className="w-full md:w-3/4 p-3 rounded-full border border-gray-300 font-poppins text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 placeholder-gray-400 transition-colors duration-300"
        />

        {/* Botón */}
        <button
          type="submit"
          className="w-full md:w-1/6 bg-verde-600 text-white px-6 py-3 rounded-full font-poppins font-semibold hover:bg-verde-700 transition-colors duration-300"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
