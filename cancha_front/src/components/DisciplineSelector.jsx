import { useState, useEffect } from 'react';
import { listarDisciplinasUnicas, asignarDisciplinas } from '../services/canchaService';

function DisciplineSelector({ canchaId, token, onDisciplinesUpdated }) {
  const [disciplinas, setDisciplinas] = useState([]);
  const [selectedDisciplinas, setSelectedDisciplinas] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDisciplinas() {
      try {
        const response = await listarDisciplinasUnicas();
        setDisciplinas(response.data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchDisciplinas();
  }, []);

  const handleSelect = (e) => {
    const { value } = e.target;
    if (!selectedDisciplinas.includes(value)) {
      setSelectedDisciplinas([...selectedDisciplinas, { id_disciplina: value, frecuencia_practica: null }]);
    }
  };

  const handleRemove = (id) => {
    setSelectedDisciplinas(selectedDisciplinas.filter((d) => d.id_disciplina !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { disciplinas: selectedDisciplinas };
      console.log("📤 Enviando payload:", JSON.stringify(payload, null, 2));

      await asignarDisciplinas(canchaId, payload, token);

      alert('Disciplinas asignadas correctamente');
      onDisciplinesUpdated();
      setSelectedDisciplinas([]);
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && <p className="text-red-500">{error}</p>}
      <h2 className="text-xl font-bold mb-4">Asignar Disciplinas</h2>
      <select onChange={handleSelect} className="w-full p-2 border rounded mb-4">
        <option value="">Seleccione una disciplina</option>
        {disciplinas.map((disciplina) => (
          <option key={disciplina} value={disciplina}>{disciplina}</option>
        ))}
      </select>
      <div className="mb-4">
        <h3 className="font-bold">Disciplinas seleccionadas:</h3>
        {selectedDisciplinas.length === 0 ? (
          <p>No hay disciplinas seleccionadas.</p>
        ) : (
          <ul className="list-disc pl-5">
            {selectedDisciplinas.map((d) => (
              <li key={d.id_disciplina} className="flex justify-between">
                {d.id_disciplina}
                <button
                  onClick={() => handleRemove(d.id_disciplina)}
                  className="text-red-500 hover:text-red-700"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={selectedDisciplinas.length === 0}
      >
        Asignar Disciplinas
      </button>
    </div>
  );
}

export default DisciplineSelector;