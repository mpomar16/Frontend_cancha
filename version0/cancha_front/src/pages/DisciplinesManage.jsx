import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDisciplinasPorCancha } from '../services/canchaService';
import DisciplineSelector from '../components/DisciplineSelector';

function DisciplinesManage() {
  const { id } = useParams();
  const [disciplinas, setDisciplinas] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const fetchDisciplinas = async () => {
    try {
      const response = await getDisciplinasPorCancha(id, token);
      setDisciplinas(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchDisciplinas();
  }, [id, token]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestionar Disciplinas</h1>
      {error && <p className="text-red-500">{error}</p>}
      <DisciplineSelector canchaId={id} token={token} onDisciplinesUpdated={fetchDisciplinas} />
      <h2 className="text-xl font-bold mt-4">Disciplinas Actuales</h2>
      {disciplinas.length === 0 ? (
        <p>No hay disciplinas asignadas.</p>
      ) : (
        <ul className="list-disc pl-5">
          {disciplinas.map((disciplina) => (
            <li key={disciplina.id_disciplina}>
              {disciplina.nombre} {disciplina.frecuencia_practica && `(${disciplina.frecuencia_practica})`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DisciplinesManage;