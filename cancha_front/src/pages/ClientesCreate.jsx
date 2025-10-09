// pages/ClienteCreate.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ClientesFormCreate from "../components/ClientesFormCreate";
import { crearCliente } from "../services/clienteService";

function ClienteCreate() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (data) => {
    if (enviando) return;
    setEnviando(true);
    try {
      await crearCliente(data, token);
      navigate(-1); // vuelve a la página anterior
    } catch (err) {
      console.error(err);
      alert(err?.message || "Ocurrió un error al crear el cliente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Sidebar>
      <main className="flex-1 p-8">
        <ClientesFormCreate onSubmit={handleSubmit} token={token} isCreate />
        {enviando && <p className="mt-3 text-sm text-gray-500">Enviando…</p>}
      </main>
    </Sidebar>
  );
}

export default ClientesCreate;
