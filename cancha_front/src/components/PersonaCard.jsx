import { Link } from "react-router-dom";

const API_BASE = "http://localhost:3000"; // ajusta según tu backend

function PersonaCard({ persona }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center">
      {/* Imagen centrada y contenida */}
      <div className="w-32 h-32 rounded-full overflow-hidden mb-4 flex items-center justify-center bg-gray-100">
        <img
          src={
            persona.imagen_perfil
              ? `${API_BASE}${persona.imagen_perfil}`
              : "/default-avatar.png"
          }
          alt={persona.nombre}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.src = "/default-avatar.png";
          }} // fallback
        />
      </div>

      {/* Información debajo de la imagen */}
      <h2 className="text-xl font-poppins font-bold text-azul-950">
        {persona.nombre} {persona.apellido}
      </h2>
      <p className="text-gray-700 font-poppins font-bold">
        Usuario: {persona.usuario}
      </p>
      <p className="text-gray-700 font-poppins font-bold">
        Correo: {persona.correo}
      </p>

      {/* Botón centrado debajo */}
      <Link
        to={`/persona/${persona.id_persona}`}
        className="bg-verde-600 text-white px-6 py-2 rounded font-poppins font-bold hover:bg-verde-700 mt-4"
      >
        Ver Detalles
      </Link>
    </div>
  );
}

export default PersonaCard;
