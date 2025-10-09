import { useState, useEffect } from "react";
import { listarDisciplinas } from "../api/espacio_listar.js";

export default function EspacioFiltroDisciplina({ onChangeDisciplina }) {
  const [disciplinas, setDisciplinas] = useState([]);
  const [selectedDisciplina, setSelectedDisciplina] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function fetchDisciplinas() {
      try {
        setIsLoading(true);
        const res = await listarDisciplinas();
        setDisciplinas(res.data || []);
      } catch (error) {
        setMensaje(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDisciplinas();
  }, []);

  const handleDisciplinaChange = (e) => {
    const disciplina = e.target.value;
    setSelectedDisciplina(disciplina);
    if (onChangeDisciplina) onChangeDisciplina(disciplina);
  };

  return (
    <div className="mb-6">
      <select
        value={selectedDisciplina}
        onChange={handleDisciplinaChange}
        className="p-2 border rounded"
      >
        <option value="">Filtrar por disciplina</option>
        {disciplinas.map((disciplina) => (
          <option key={disciplina} value={disciplina}>
            {disciplina}
          </option>
        ))}
      </select>
      {isLoading && <p className="text-center">Cargando disciplinas...</p>}
      {mensaje && <p className="text-red-500 mt-2">{mensaje}</p>}
    </div>
  );
}