import { Link } from 'react-router-dom';

const API_BASE = "http://localhost:3000"; // ajusta según tu backend

function EspacioCard({ espacio }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {espacio.imagen_principal && (
          <img
            src={`${API_BASE}${espacio.imagen_principal}`}
            alt={espacio.nombre}
            className="w-40 h-32 rounded-lg border-2 border-gray-300 mb-4 object-cover"
            onError={(e) => { e.target.src = "/default-avatar.png"; }} // fallback
          />  
      )}
      <h2 className="text-xl font-bold">{espacio.nombre}</h2>
      <p><strong>Dirección:</strong> {espacio.direccion || 'No especificada'}</p>
      {espacio.distancia_km && (
        <p><strong>Distancia:</strong> {espacio.distancia_km.toFixed(2)} km</p>
      )}
      <Link to={`/espacio/${espacio.id_espacio}`} className="bg-verde-600 text-white px-4 py-2 rounded hover:bg-azul-900 mt-4 inline-block">
        Ver Detalles
      </Link>
    </div>
  );
}

export default EspacioCard;