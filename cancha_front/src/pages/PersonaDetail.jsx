import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { obtenerPersonaPorId, eliminarPersona } from '../services/personaService';

const API_BASE = "http://localhost:3000"; // ajusta según tu backend

function PersonaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [persona, setPersona] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchPersona() {
      try {
        const response = await obtenerPersonaPorId(id, token);
        setPersona(response.data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchPersona();
  }, [id, token]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar esta persona?')) {
      try {
        await eliminarPersona(id, token);
        alert('Persona eliminada exitosamente');
        navigate('/');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (!persona) return <div>Cargando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{persona.nombre} {persona.apellido}</h1>
      {error && <p className="text-red-500">{error}</p>}
      {persona.imagen_perfil && (
          <img
            src={`${API_BASE}${persona.imagen_perfil}`}
            alt={persona.nombre}
            className="w-32 h-32 rounded-full mb-4"
            onError={(e) => { e.target.src = "/default-avatar.png"; }} // fallback
          />  
      )}
      <p><strong>Usuario:</strong> {persona.usuario}</p>
      <p><strong>Correo:</strong> {persona.correo}</p>
      <p><strong>Teléfono:</strong> {persona.telefono || 'No especificado'}</p>
      <p><strong>Sexo:</strong> {persona.sexo || 'No especificado'}</p>
      {localStorage.getItem('role') === 'ADMINISTRADOR' && (
        <div className="flex gap-4 mt-4">
          <Link to={`/persona/edit/${id}`} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
            Editar Persona
          </Link>
          <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Eliminar Persona
          </button>
        </div>
      )}
    </div>
  );
}

export default PersonaDetail;