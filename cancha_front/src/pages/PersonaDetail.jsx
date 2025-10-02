import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  obtenerPersonaPorId,
  eliminarPersona,
} from "../services/personaService";

const API_BASE = "http://localhost:3000";

function PersonaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [persona, setPersona] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

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
    if (window.confirm("¿Estás seguro de eliminar esta persona?")) {
      try {
        await eliminarPersona(id, token);
        alert("Persona eliminada exitosamente");
        navigate("/personas"); // ajusta la ruta de regreso
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (!persona) return <div>Cargando...</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md text-center border border-gray-200 hover:shadow-2xl transition-shadow duration-300 text-azul-950 font-poppins">
        {/* Título */}
        <h2 className="text-4xl font-bold mb-6">Información Detallada</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Imagen de perfil */}
        <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-6 bg-gray-100 flex items-center justify-center">
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
            }}
          />
        </div>

        {/* Datos de la persona */}
        <h1 className="text-3xl font-bold mb-4">
          {persona.nombre} {persona.apellido}
        </h1>
        <p className="mb-2">
          <strong>Usuario:</strong> {persona.usuario}
        </p>
        <p className="mb-2">
          <strong>Correo:</strong> {persona.correo}
        </p>
        <p className="mb-2">
          <strong>Teléfono:</strong> {persona.telefono || "No especificado"}
        </p>
        <p className="mb-6">
          <strong>Sexo:</strong> {persona.sexo || "No especificado"}
        </p>

        {/* Botones */}
        <div className="flex flex-col gap-4 justify-center">
          {localStorage.getItem("role") === "ADMINISTRADOR" && (
            <div className="flex gap-4 justify-center">
              <Link
                to={`/persona/edit/${id}`}
                className="bg-gris-200 text-azul-950 px-6 py-2 rounded-lg hover:bg-azul-950 hover:text-white font-semibold transition-colors duration-300"
              >
                Editar Persona
              </Link>
              <button
                onClick={handleDelete}
                className="bg-gris-200 text-azul-950 px-6 py-2 rounded-lg hover:bg-azul-950 hover:text-white font-semibold transition-colors duration-300"
              >
                Eliminar Persona
              </button>
            </div>
          )}
          {/* Botón regresar */}
          <button
            onClick={() => navigate("/personas")} // ajusta la ruta
            className="bg-gris-200 text-azul-950 px-6 py-2 rounded-lg font-semibold hover:bg-verde-600 hover:text-white transition-colors duration-300 mt-4"
          >
            Regresar
          </button>
        </div>
      </div>
    </div>
  );
}

export default PersonaDetail;
