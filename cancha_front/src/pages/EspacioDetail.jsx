import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { obtenerEspacioPorId, listarCanchasDisponibles, eliminarEspacio } from '../services/espacioService';

const API_BASE = "http://localhost:3000"; // ajusta según tu backend

function EspacioDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [espacio, setEspacio] = useState(null);
  const [canchas, setCanchas] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    async function fetchEspacio() {
      try {
        const response = await obtenerEspacioPorId(id, token);
        setEspacio(response.data);
        const canchasResponse = await listarCanchasDisponibles(id, token);
        setCanchas(canchasResponse.data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchEspacio();
  }, [id, token]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este espacio deportivo?')) {
      try {
        await eliminarEspacio(id, token);
        alert('Espacio eliminado exitosamente');
        navigate('/espacios');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (!espacio) return <div>Cargando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{espacio.nombre}</h1>
      {error && <p className="text-red-500">{error}</p>}
      {espacio.imagen_principal && (
          <img
            src={`${API_BASE}${espacio.imagen_principal}`}
            alt={espacio.nombre}
            className="w-40 h-32 rounded-lg border-2 border-gray-300 mb-4 object-cover"
            onError={(e) => { e.target.src = "/default-avatar.png"; }} // fallback
          />  
      )}
        <div className="grid grid-cols-2 gap-4 mb-4">
        {espacio.imagen_sec_1 && (
            <img
            src={`${API_BASE}${espacio.imagen_sec_1}`}
            alt="Secundaria 1"
            className="w-50 h-32 object-cover rounded"
            onError={(e) => { e.target.src = "/default-avatar.png"; }}
            />
        )}
        {espacio.imagen_sec_2 && (
            <img
            src={`${API_BASE}${espacio.imagen_sec_2}`}
            alt="Secundaria 2"
            className="w-50 h-32 object-cover rounded"
            onError={(e) => { e.target.src = "/default-avatar.png"; }}
            />
        )}
        {espacio.imagen_sec_3 && (
            <img
            src={`${API_BASE}${espacio.imagen_sec_3}`}
            alt="Secundaria 3"
            className="w-50 h-32 object-cover rounded"
            onError={(e) => { e.target.src = "/default-avatar.png"; }}
            />
        )}
        {espacio.imagen_sec_4 && (
            <img
            src={`${API_BASE}${espacio.imagen_sec_4}`}
            alt="Secundaria 4"
            className="w-50 h-32 object-cover rounded"
            onError={(e) => { e.target.src = "/default-avatar.png"; }}
            />
        )}
        </div>

      <p><strong>Dirección:</strong> {espacio.direccion || 'No especificada'}</p>
      <p><strong>Descripción:</strong> {espacio.descripcion || 'No especificada'}</p>
      <p><strong>Latitud:</strong> {espacio.latitud}</p>
      <p><strong>Longitud:</strong> {espacio.longitud}</p>
      <p><strong>Horario:</strong> {espacio.horario_apertura} - {espacio.horario_cierre}</p>
      <p><strong>Administrador:</strong> {espacio.admin_nombre_completo}</p>
      <h2 className="text-xl font-bold mt-4">Canchas Disponibles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {canchas.map((cancha) => (
          <div key={cancha.id_cancha} className="bg-gray-100 p-4 rounded">
            <p><strong>Nombre:</strong> {cancha.nombre}</p>
            <p><strong>Capacidad:</strong> {cancha.capacidad}</p>
            <p><strong>Disciplinas:</strong> {cancha.disciplinas.join(', ')}</p>
          </div>
        ))}
      </div>
      {(userRole === 'ADMINISTRADOR' || userRole === 'ADMIN_ESP_DEP') && (
        <div className="flex gap-4 mt-4">
          <Link to={`/espacio/edit/${id}`} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
            Editar Espacio
          </Link>
          <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Eliminar Espacio
          </button>
        </div>
      )}
    </div>
  );
}

export default EspacioDetail;