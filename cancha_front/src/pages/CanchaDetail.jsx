import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { obtenerCanchaPorId, eliminarCancha, getDisciplinasPorCancha, listarDisciplinasPorCancha, calcularPromedioResenas } from '../services/canchaService';

const API_BASE = "http://localhost:3000"; // ajusta según tu backend

function CanchaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cancha, setCancha] = useState(null);
  const [disciplinas, setDisciplinas] = useState([]);
  const [disciplinaNombres, setDisciplinaNombres] = useState([]);
  const [promedio, setPromedio] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchCancha() {
      try {
        const response = await obtenerCanchaPorId(id, token);
        setCancha(response.data);
        const disciplinasResponse = await getDisciplinasPorCancha(id, token);
        setDisciplinas(disciplinasResponse.data);
        const nombresResponse = await listarDisciplinasPorCancha(id, token);
        setDisciplinaNombres(nombresResponse.data);
        const promedioResponse = await calcularPromedioResenas(id, token);
        setPromedio(promedioResponse.data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchCancha();
  }, [id, token]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar esta cancha?')) {
      try {
        await eliminarCancha(id, token);
        alert('Cancha eliminada exitosamente');
        navigate('/');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (!cancha) return <div>Cargando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{cancha.nombre}</h1>
      {error && <p className="text-red-500">{error}</p>}
      {cancha.imagen_cancha && (
          <img
            src={`${API_BASE}${cancha.imagen_cancha}`}
            alt={cancha.nombre}
            className="w-40 h-32 rounded-lg border-2 border-gray-300 mb-4 object-cover"
            onError={(e) => { e.target.src = "/default-avatar.png"; }} // fallback
          />  
      )}
      <p><strong>Capacidad:</strong> {cancha.capacidad}</p>
      <p><strong>Estado:</strong> {cancha.estado}</p>
      <p><strong>Ubicación:</strong> {cancha.ubicacion || 'No especificada'}</p>
      <p><strong>Monto por hora:</strong> {cancha.monto_por_hora || 'No especificado'}</p>
      <p><strong>Espacio ID:</strong> {cancha.id_espacio}</p>
      <p><strong>Promedio de Reseñas:</strong> {promedio?.promedio_estrellas || 'Sin reseñas'} ({promedio?.total_comentarios || 0} comentarios)</p>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Disciplinas:</h2>
        {disciplinaNombres.length > 0 ? (
          <ul className="list-disc pl-5">
            {disciplinaNombres.map((nombre) => (
              <li key={nombre}>{nombre}</li>
            ))}
          </ul>
        ) : (
          <p>No hay disciplinas asignadas.</p>
        )}
      </div>
      <div className="flex gap-4">
        <Link to={`/cancha/edit/${id}`} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
          Editar Cancha
        </Link>
        <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Eliminar Cancha
        </button>
      </div>
    </div>
  );
}

export default CanchaDetail;