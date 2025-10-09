import { useState, useEffect } from "react";
import { listarDisciplinas, buscarEspaciosPorDisciplina, listarEspacios, listarEspaciosGeneral } from "../services/espacioService";
import { Filter, X } from "lucide-react";

function EspacioDisciplineFilter({ onSearchResults }) {
  const [disciplinas, setDisciplinas] = useState([]);
  const [selectedDisciplina, setSelectedDisciplina] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  // 🔹 Cargar disciplinas
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

  // 🔹 Filtrar espacios por disciplina
  const handleFilter = async () => {
    if (!selectedDisciplina) {
      // 🟢 Reset → mostrar todos los espacios
      try {
        const response = isLoggedIn
          ? await listarEspacios(12, 0)
          : await listarEspaciosGeneral(12, 0);
        onSearchResults(response.data);
        setError("");
      } catch (err) {
        setError(err.message);
      }
      return;
    }

    try {
      const response = await buscarEspaciosPorDisciplina(selectedDisciplina);
      onSearchResults(response.data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // 🔹 Limpiar filtro
  const handleClear = async () => {
    setSelectedDisciplina("");
    try {
      const response = isLoggedIn
        ? await listarEspacios(12, 0)
        : await listarEspaciosGeneral(12, 0);
      onSearchResults(response.data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-100">
      {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}

      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Selector disciplina */}
        <select
          value={selectedDisciplina}
          onChange={(e) => setSelectedDisciplina(e.target.value)}
          className="w-full flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-verde-600"
        >
          <option value="">🏅 Selecciona una disciplina</option>
          {disciplinas.map((disciplina) => (
            <option key={disciplina} value={disciplina}>
              {disciplina}
            </option>
          ))}
        </select>

        {/* Botón filtrar */}
        <button
          onClick={handleFilter}
          className="flex items-center gap-2 bg-verde-600 text-white px-5 py-2 rounded-lg shadow hover:bg-verde-700 transition focus:ring-2 focus:ring-offset-1 focus:ring-verde-600"
        >
          <Filter className="w-4 h-4" />
          Filtrar
        </button>

        {/* Botón limpiar */}
        {selectedDisciplina && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-300 transition"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}

export default EspacioDisciplineFilter;
