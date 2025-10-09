import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  obtenerMiPerfil,
  actualizarMiPerfil,
} from "../services/personaService";
import PersonaForm from "../components/PersonaFormEdit";

const API_BASE = "http://localhost:3000"; // ajusta según tu backend

function Profile() {
  const navigate = useNavigate();
  const [persona, setPersona] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await obtenerMiPerfil(token);
        console.log("Perfil recibido:", response.data);
        setPersona(response.data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchProfile();
  }, [token]);

  const handleSubmit = async (data) => {
    await actualizarMiPerfil(data, token);
    navigate("/profile");
  };

  if (!persona) return <div>Cargando...</div>;

  return (
    <div className="p-8 pt-16 flex flex-col items-center">
      {/* Título */}
      <h1 className="text-4xl font-poppins font-bold text-azul-950 text-center mb-8">
        Mi Perfil
      </h1>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Contenedor principal: tarjeta de imagen + tarjeta de datos */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-10 w-full max-w-4xl">
        {/* Tarjeta de imagen */}
        <div className="bg-white rounded-xl shadow-xl p-6 flex justify-center items-center w-full md:w-1/3 max-w-sm">
          <img
            src={
              persona.imagen_perfil
                ? `${API_BASE}${persona.imagen_perfil}`
                : "/default-avatar.png"
            }
            alt={persona.nombre}
            className="w-40 h-40 rounded-full object-cover"
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
        </div>

        {/* Tarjeta de información */}
        <div className="bg-white rounded-xl shadow-xl p-6 w-full md:w-2/3 max-w-md font-poppins text-azul-950">
          <p className="mb-2">
            <strong>Nombre:</strong> {persona.nombre} {persona.apellido}
          </p>
          <p className="mb-2">
            <strong>Usuario:</strong> {persona.usuario}
          </p>
          <p className="mb-2">
            <strong>Correo:</strong> {persona.correo}
          </p>
          <p className="mb-2">
            <strong>Teléfono:</strong> {persona.telefono || "No especificado"}
          </p>
          <p className="mb-2">
            <strong>Sexo:</strong> {persona.sexo || "No especificado"}
          </p>
        </div>
      </div>

      {/* Formulario de edición */}
      <div className="w-full max-w-3xl">
        <h2 className="text-2xl font-poppins font-bold text-azul-950 text-center mb-6">
          Editar Perfil
        </h2>
        <div className="bg-white rounded-xl shadow-xl p-6">
          <PersonaForm
            initialData={persona}
            onSubmit={handleSubmit}
            token={token}
          />
        </div>
      </div>
    </div>
  );
}

export default Profile;
