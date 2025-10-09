import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ReporteIncidenciaFormCreate from "../components/ReporteIncidenciaFormCreate";
import { crearReporte } from "../services/reporteIncidenciaService";

function ReporteIncidenciaCreate() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (data) => {
    if (enviando) return;
    setEnviando(true);
    try {
      await crearReporte(data, token);
      navigate("/reporte-incidencias");
    } catch (err) {
      console.error(err);
      alert(err?.message || "Ocurrió un error al crear el reporte.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Sidebar>
      <main className="flex-1 p-8">
        <ReporteIncidenciaFormCreate token={token} onSubmit={handleSubmit} />
        {enviando && <p className="mt-3 text-sm text-gray-500">Enviando…</p>}
      </main>
    </Sidebar>
  );
}

export default ReporteIncidenciaCreate;
