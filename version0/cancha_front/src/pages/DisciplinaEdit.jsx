import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DisciplinaFormEdit from "../components/DisciplinaFormEdit";
import { obtenerDisciplinaPorId, actualizarDisciplina } from "../services/disciplinaService";

function DisciplinaEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [disciplina, setDisciplina] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  // === Cargar disciplina por ID ===
  useEffect(() => {
    let cancelado = false;

    const fetchDisciplina = async () => {
      setCargando(true);
      setError("");
      try {
        const resp = await obtenerDisciplinaPorId(id, token);
        if (!cancelado) setDisciplina(resp.data);
      } catch (err) {
        if (!cancelado)
          setError(err?.message || "No se pudo cargar la información de la disciplina.");
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    fetchDisciplina();

    return () => {
      cancelado = true;
    };
  }, [id, token]);

  // === Enviar cambios ===
  const handleSubmit = async (data) => {
    if (enviando) return;
    setEnviando(true);
    setError("");
    try {
      await actualizarDisciplina(id, data, token);

      if (window.history.length > 1) navigate("/disciplinas");
      else navigate("/disciplinas", { replace: true });
    } catch (err) {
      setError(err?.message || "Ocurrió un error al actualizar la disciplina.");
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
          <p className="mb-3 text-sm text-gray-500 italic">
            Enviando cambios…
          </p>
        )}

        {/* === Contenido principal === */}
        {cargando ? (
          <div className="max-w-4xl">
            <div className="h-28 rounded-lg bg-gray-100 animate-pulse mb-4" />
            <div className="h-56 rounded-lg bg-gray-100 animate-pulse" />
          </div>
        ) : (
          disciplina && (
            <DisciplinaFormEdit
              initialData={disciplina}
              onSubmit={handleSubmit}
              token={token}
            />
          )
        )}
      </main>
    </Sidebar>
  );
}

export default DisciplinaEdit;
