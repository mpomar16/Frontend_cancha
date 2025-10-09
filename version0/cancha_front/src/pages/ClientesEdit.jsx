import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ClientesFormEdit from "../components/ClientesFormEdit";
import {
  obtenerClientePorId,
  actualizarCliente,
} from "../services/clienteService";

function ClienteEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [cliente, setCliente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;

    const fetchCliente = async () => {
      setCargando(true);
      setError("");
      try {
        const resp = await obtenerClientePorId(id, token);
        if (!cancelado) setCliente(resp);
      } catch (err) {
        if (!cancelado)
          setError(
            err?.message || "No se pudo cargar la información del cliente."
          );
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    fetchCliente();

    return () => {
      cancelado = true;
    };
  }, [id, token]);

  const handleSubmit = async (data) => {
    if (enviando) return;
    setEnviando(true);
    setError("");
    try {
      await actualizarCliente(id, data, token);

      if (window.history.length > 1) navigate("/clientes");
      else navigate("/clientes", { replace: true });
    } catch (err) {
      setError(err?.message || "Ocurrió un error al actualizar el cliente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Sidebar>
      <main className="flex-1 p-8">
        {/* === Alerta de error === */}
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-red-700">
            {error}
          </div>
        )}

        {/* === Estado de envío === */}
        {enviando && (
          <p className="mb-3 text-sm text-gray-500 italic">Enviando cambios…</p>
        )}

        {/* === Contenido principal === */}
        {cargando ? (
          <div className="max-w-4xl">
            <div className="h-28 rounded-lg bg-gray-100 animate-pulse mb-4" />
            <div className="h-56 rounded-lg bg-gray-100 animate-pulse" />
          </div>
        ) : (
          cliente && (
            <ClientesFormEdit
              initialData={cliente}
              onSubmit={handleSubmit}
              token={token}
            />
          )
        )}
      </main>
    </Sidebar>
  );
}

export default ClientesEdit;
