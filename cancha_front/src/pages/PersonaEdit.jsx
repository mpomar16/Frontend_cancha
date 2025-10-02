import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  obtenerPersonaPorId,
  actualizarPersona,
} from "../services/personaService";
import PersonaForm from "../components/PersonaForm";

function PersonaEdit() {
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

  const handleSubmit = async (data) => {
    await actualizarPersona(id, data, token);
    navigate(`/persona/${id}`);
  };

  if (!persona) return <div>Cargando...</div>;

  return (
    <div className="pt-10">
      {" "}
      {/* agrega padding superior para separar del borde */}
      <h1 className="text-4xl font-poppins font-bold text-azul-950 text-center mb-6">
        Editar Persona
      </h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="flex justify-center">
        <div className="w-full md:w-3/4">
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

export default PersonaEdit;
