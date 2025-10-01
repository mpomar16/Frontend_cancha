import { Link } from 'react-router-dom';

const API_BASE = "http://localhost:3000"; // ajusta según tu backend

function PersonaCard({ persona }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {persona.imagen_perfil && (
          <img
            src={`${API_BASE}${persona.imagen_perfil}`}
            alt={persona.nombre}
            className="w-32 h-32 rounded-full mb-4"
            onError={(e) => { e.target.src = "/default-avatar.png"; }} // fallback
          />
      )}
      <h2 className="text-xl font-bold">{persona.nombre} {persona.apellido}</h2>
      <p><strong>Usuario:</strong> {persona.usuario}</p>
      <p><strong>Correo:</strong> {persona.correo}</p>
      <p><strong>Teléfono:</strong> {persona.telefono || 'No especificado'}</p>
      <p><strong>Sexo:</strong> {persona.sexo || 'No especificado'}</p>
      <Link to={`/persona/${persona.id_persona}`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4 inline-block">
        Ver Detalles
      </Link>
    </div>
  );
}

export default PersonaCard;