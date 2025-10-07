// pages/EncargadoCreate.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import EncargadoFormCreate from "../components/EncargadoFormCreate";
import { crearEncargado } from "../services/encargadoService";

function EncargadoCreate() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (data) => {
    if (enviando) return;
    setEnviando(true);
    try {
      await crearEncargado(data, token);
      navigate(-1); // volver a la página anterior
    } catch (err) {
      console.error(err);
      alert(err?.message || "Ocurrió un error al crear el encargado.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Sidebar>
      <main className="flex-1 p-8">
        <EncargadoFormCreate onSubmit={handleSubmit} token={token} isCreate />
        {enviando && <p className="mt-3 text-sm text-gray-500">Enviando…</p>}
      </main>
    </Sidebar>
  );
}

export default EncargadoCreate;
