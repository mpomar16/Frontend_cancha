import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ReporteIncidenciaFormEdit from "../components/ReporteIncidenciaFormEdit";
import { obtenerReportePorId, actualizarReporte } from "../services/reporteIncidenciaService";

function ReporteIncidenciaEdit() {
  const { id } = useParams();
  console.log("ID del reporte:", id);  // Verifica el valor de id
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  // === Verificar si el ID es válido antes de hacer la solicitud ===
  useEffect(() => {
    if (!id) {
      setError("ID del reporte no válido.");
      setCargando(false);
      return;
    }

    let cancelado = false;

    const fetchReporte = async () => {
      setCargando(true);
      setError("");
      try {
        const resp = await obtenerReportePorId(id, token);
        const reporteData = resp?.data ?? resp;
        if (!cancelado) setReporte(reporteData);
      } catch (err) {
        if (!cancelado)
          setError(err?.message || "No se pudo cargar la información del reporte de incidencia.");
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    fetchReporte();

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
      await actualizarReporte(id, data, token);

      // Redirige a la lista de reportes de incidencia después de actualizar
      if (window.history.length > 1) navigate("/reporte-incidencias");
      else navigate("/reporte-incidencias", { replace: true });
    } catch (err) {
      setError(err?.message || "Ocurrió un error al actualizar el reporte de incidencia.");
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
          reporte && (
            <ReporteIncidenciaFormEdit
              initialData={reporte}
              onSubmit={handleSubmit}
              token={token}
            />
          )
        )}
      </main>
    </Sidebar>
  );
}

export default ReporteIncidenciaEdit;
