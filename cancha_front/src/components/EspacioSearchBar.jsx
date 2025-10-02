import { useState, useEffect } from "react";
import {
  buscarEspaciosPorNombreODireccion,
  buscarEspaciosPorDisciplina,
  listarDisciplinas,
  listarEspacios,
  listarEspaciosGeneral, // 👈 importado
} from "../services/espacioService";
import { Search, X } from "lucide-react";

function EspacioSearchBar({ onSearchResults }) {
  const [searchType, setSearchType] = useState("nombre");
  const [searchTerm, setSearchTerm] = useState("");
  const [disciplinas, setDisciplinas] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  // Cargar disciplinas
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

  // 🔹 Buscar o limpiar
  const handleSearch = async (e) => {
    e.preventDefault();

    // 🟢 Si está vacío → traer todos los espacios
    if (!searchTerm.trim()) {
      try {
        const response = isLoggedIn
          ? await listarEspacios(12, 0)
          : await listarEspaciosGeneral(12, 0);

        onSearchResults(response.data); // { espacios, hasMore }
        setError("");
      } catch (err) {
        setError(err.message);
      }
      return;
    }

    try {
      let results;
      if (searchType === "nombre") {
        results = await buscarEspaciosPorNombreODireccion(searchTerm);
      } else {
        results = await buscarEspaciosPorDisciplina(searchTerm);
      }
      onSearchResults(results.data); // array plano
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // 🔹 Limpiar búsqueda (reset)
  const handleClear = async () => {
    setSearchTerm("");
    try {
      const response = isLoggedIn
        ? await listarEspacios(12, 0)
        : await listarEspaciosGeneral(12, 0);

      onSearchResults(response.data); // { espacios, hasMore }
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-100"
    >
      {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}

      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Tipo de búsqueda */}
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="w-full md:w-1/4 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-verde-600"
        >
          <option value="nombre">Nombre o Dirección</option>
          <option value="disciplina">Disciplina</option>
        </select>

        {/* Input dinámico */}
        {searchType === "nombre" ? (
          <div className="flex w-full flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Escribe un nombre o dirección..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-verde-600"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-2 text-gray-400 hover:text-verde-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <select
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-verde-600"
          >
            <option value="">Seleccione una disciplina</option>
            {disciplinas.map((disciplina) => (
              <option key={disciplina} value={disciplina}>
                {disciplina}
              </option>
            ))}
          </select>
        )}

        {/* Botón buscar */}
        <button
          type="submit"
          className="flex items-center gap-2 bg-verde-600 text-white px-5 py-2 rounded-lg shadow hover:bg-verde-700 transition focus:ring-2 focus:ring-offset-1 focus:ring-verde-600"
        >
          <Search className="w-4 h-4" />
          Buscar
        </button>
      </div>
    </form>
  );
}

export default EspacioSearchBar;
