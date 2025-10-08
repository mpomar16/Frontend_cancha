// pages/EncargadoEdit.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import EncargadoFormEdit from "../components/EncargadoFormEdit";
import { obtenerEncargadoPorId, actualizarEncargado } from "../services/encargadoService";

function EncargadoEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [encargado, setEncargado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;

    const fetchEncargado = async () => {
      setCargando(true);
      setError("");
      try {
        const resp = await obtenerEncargadoPorId(id, token);
        // resp puede ser el objeto directo o { data }
        const enc = resp?.data ?? resp;
        if (!cancelado) setEncargado(enc);
      } catch (err) {
        if (!cancelado)
          setError(err?.message || "No se pudo cargar la información del encargado.");
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    fetchEncargado();
    return () => { cancelado = true; };
  }, [id, token]);

  // El form recomendado llama onSubmit(idEncargado, payload)
  const handleSubmit = async (idEncargado, data) => {
    if (enviando) return;
    setEnviando(true);
    setError("");
    try {
      await actualizarEncargado(idEncargado, data, token);
      if (window.history.length > 1) navigate("/encargados");
      else navigate("/encargados", { replace: true });
    } catch (err) {
      setError(err?.message || "Ocurrió un error al actualizar el encargado.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Sidebar>
      <main className="flex-1 p-8">
        {/* Error */}
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-red-700">
            {error}
          </div>
        )}

        {/* Estado de envío */}
        {enviando && (
          <p className="mb-3 text-sm text-gray-500 italic">Enviando cambios…</p>
        )}

        {/* Contenido */}
        {cargando ? (
          <div className="max-w-4xl">
            <div className="h-28 rounded-lg bg-gray-100 animate-pulse mb-4" />
            <div className="h-56 rounded-lg bg-gray-100 animate-pulse" />
          </div>
        ) : (
          encargado && (
            <EncargadoFormEdit
              token={token}
              encargadoId={id}                 // por si el form necesita recargar
              initialEncargado={encargado}     // objeto inicial
              onSubmit={handleSubmit}
            />
          )
        )}
      </main>
    </Sidebar>
  );
}

export default EncargadoEdit;
