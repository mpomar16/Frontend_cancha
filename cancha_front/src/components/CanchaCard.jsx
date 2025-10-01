import { Link } from 'react-router-dom';

const API_BASE = "http://localhost:3000"; // ajusta según tu backend

function CanchaCard({ cancha }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {cancha.imagen_cancha && (
          <img
            src={`${API_BASE}${cancha.imagen_cancha}`}
            alt={cancha.nombre}
            className="w-40 h-32 rounded-lg border-2 border-gray-300 mb-4 object-cover"
            onError={(e) => { e.target.src = "/default-avatar.png"; }} // fallback
          />  
      )}
      <h2 className="text-xl font-bold mt-2">{cancha.nombre}</h2>
      <p><strong>Capacidad:</strong> {cancha.capacidad}</p>
      <p><strong>Estado:</strong> {cancha.estado}</p>
      <p><strong>Ubicación:</strong> {cancha.ubicacion || 'No especificada'}</p>
      <p><strong>Monto por hora:</strong> {cancha.monto_por_hora || 'No especificado'}</p>
      <div className="mt-4 flex gap-2">
        <Link to={`/cancha/${cancha.id_cancha}`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Ver Detalles
        </Link>
        <Link to={`/cancha/reviews/${cancha.id_cancha}`} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Ver Reseñas
        </Link>
        <Link to={`/cancha/disciplines/${cancha.id_cancha}`} className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
          Gestionar Disciplinas
        </Link>
      </div>
    </div>
  );
}

export default CanchaCard;