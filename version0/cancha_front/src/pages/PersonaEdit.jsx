// pages/PersonaEdit.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import PersonaFormEdit from "../components/PersonaFormEdit";
import { obtenerPersonaPorId, actualizarPersona } from "../services/personaService";

function PersonaEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [persona, setPersona] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;

    (async () => {
      setCargando(true);
      setError("");
      try {
        const resp = await obtenerPersonaPorId(id, token);
        if (!cancelado) setPersona(resp.data);
      } catch (err) {
        if (!cancelado) setError(err?.message || "No se pudo cargar la persona.");
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [id, token]);

  const handleSubmit = async (data) => {
    if (enviando) return;           // evita doble submit
    setEnviando(true);
    setError("");
    try {
      await actualizarPersona(id, data, token);
      // misma UX que PersonaCreate: volver atrás
      if (window.history.length > 1) navigate(-1);
      else navigate(`/persona/${id}`, { replace: true });
    } catch (err) {
      setError(err?.message || "Ocurrió un error al actualizar.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Sidebar>
      <main className="flex-1 p-8">
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-red-700">
            {error}
          </div>
        )}
        {enviando && <p className="mb-3 text-sm text-gray-500">Enviando…</p>}

        {/* Contenido */}
        {cargando ? (
          <div className="max-w-4xl">
            <div className="h-28 rounded-lg bg-gray-100 animate-pulse mb-4" />
            <div className="h-56 rounded-lg bg-gray-100 animate-pulse" />
          </div>
        ) : (
          persona && (
            <PersonaFormEdit
              initialData={persona}
              onSubmit={handleSubmit}
              token={token}
              isSignUp={false}
            />
          )
        )}
      </main>
    </Sidebar>
  );
}

export default PersonaEdit;
