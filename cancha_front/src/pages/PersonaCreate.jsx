// pages/PersonaCreate.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import PersonaRegistro from "../components/PersonaRegistroCasual";
import { crearPersonaCasual } from "../services/personaService";

function PersonaCreate() {
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (data) => {
    if (enviando) return; // evita doble submit
    setEnviando(true);
    try {
      await crearPersonaCasual(data);
      navigate(-1); // volver a la página anterior
    } catch (err) {
      console.error(err);
      alert(err?.message || "Ocurrió un error al crear la persona.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Sidebar>
      <main className="flex-1 p-8">
        <PersonaRegistro onSubmit={handleSubmit} isSignUp />
        {enviando && (
          <p className="mt-3 text-sm text-gray-500">Enviando…</p>
        )}
      </main>
    </Sidebar>
  );
}

export default PersonaCreate;
