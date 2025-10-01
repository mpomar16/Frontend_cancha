import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerMiPerfil, actualizarMiPerfil } from '../services/personaService';
import PersonaForm from '../components/PersonaForm';

const API_BASE = "http://localhost:3000"; // ajusta según tu backend

function Profile() {
  const navigate = useNavigate();
  const [persona, setPersona] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await obtenerMiPerfil(token);
        console.log("Perfil recibido:", response.data); // 👀 revisar aquí
        setPersona(response.data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchProfile();
  }, [token]);


  const handleSubmit = async (data) => {
    await actualizarMiPerfil(data, token);
    navigate('/profile');
  };

  if (!persona) return <div>Cargando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="bg-white p-6 rounded-lg shadow-md mb-4">
        {persona.imagen_perfil && (
          <img
            src={`${API_BASE}${persona.imagen_perfil}`}
            alt={persona.nombre}
            className="w-32 h-32 rounded-full mb-4"
            onError={(e) => { e.target.src = "/default-avatar.png"; }} // fallback
          />
        )}
        <p><strong>Nombre:</strong> {persona.nombre} {persona.apellido}</p>
        <p><strong>Usuario:</strong> {persona.usuario}</p>
        <p><strong>Correo:</strong> {persona.correo}</p>
        <p><strong>Teléfono:</strong> {persona.telefono || 'No especificado'}</p>
        <p><strong>Sexo:</strong> {persona.sexo || 'No especificado'}</p>
      </div>
      <h2 className="text-xl font-bold mb-4">Editar Perfil</h2>
      <PersonaForm initialData={persona} onSubmit={handleSubmit} token={token} />
    </div>
  );
}

export default Profile;