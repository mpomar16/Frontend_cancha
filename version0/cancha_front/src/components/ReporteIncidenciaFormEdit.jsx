/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";
import Alerta from "./Alerta";
import SelectEncargado from "./ReporteIncidenciaSelectEncargado";
import SelectReserva from "./ReporteIncidenciaSelectReserva";
import { obtenerReportePorId } from "../services/reporteIncidenciaService"; // Asegúrate de tener esta función

export default function ReporteIncidenciaFormEdit({ token, onSubmit, id }) {
  const [formData, setFormData] = useState({
    detalle: "",
    sugerencia: "",
    id_encargado: null,
    id_reserva: null,
  });

  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [successAlert, setSuccessAlert] = useState({ open: false, msg: "" });
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  // === Cargar datos del reporte ===
  useEffect(() => {
    const fetchReporte = async () => {
      try {
        console.log("ID del reporteform:", id);
        const response = await obtenerReportePorId(id, token);
        const { detalle, sugerencia, id_encargado, id_reserva } = response.data;

        setFormData({
          detalle: detalle || "",
          sugerencia: sugerencia || "",
          id_encargado: id_encargado || null,
          id_reserva: id_reserva || null,
        });
      } catch (err) {
        setError("No se pudo cargar la información del reporte.");
      } finally {
        setCargando(false);
      }
    };

    fetchReporte();
  }, [id, token]);

  // === Manejar cambios ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  // === Manejar selección de encargado ===
  const handleSelectEncargado = (id_encargado) => {
    setFormData((s) => ({ ...s, id_encargado }));
  };

  // === Manejar selección de reserva ===
  const handleSelectReserva = (id_reserva) => {
    setFormData((s) => ({ ...s, id_reserva }));
  };

  // === Validación y Envío del formulario ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;

    // Validaciones mínimas
    if (!formData.detalle?.trim()) {
      return setError("El detalle es obligatorio.");
    }
    if (!formData.id_encargado) {
      return setError("Debes seleccionar un encargado.");
    }
    if (!formData.id_reserva) {
      return setError("Debes seleccionar una reserva.");
    }

    setError("");
    setEnviando(true);

    try {
      await onSubmit({
        detalle: formData.detalle.trim(),
        sugerencia: formData.sugerencia?.trim() || null,
        id_encargado: Number(formData.id_encargado),
        id_reserva: Number(formData.id_reserva),
      });
      setSuccessAlert({ open: true, msg: "Reporte actualizado correctamente." });
      setTimeout(() => navigate("/reporte-incidencias"), 1200);
    } catch (err) {
      setError(err.message || "Error al actualizar el reporte de incidencia.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main>
      {/* Header uniforme */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/reporte-incidencias")}
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <h1 className="flex items-center text-2xl font-poppins font-bold text-azul-950">
            <FileText className="mr-3" />
            Editar Reporte de Incidencia
          </h1>
        </div>
      </div>

      {/* Formulario principal */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-md-xl shadow-lg p-4 px-4 md:p-8">
          <div className="mb-6">
            <h2 className="font-medium text-xl text-verde-600">
              Información del Reporte
            </h2>
            <p className="font-light text-verde-600">
              Modifica los datos necesarios y guarda los cambios.
            </p>
          </div>

          {/* Campos de texto */}
          <div className="grid gap-4 text-sm grid-cols-1 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-azul-950 font-medium">
                Detalle de la incidencia*
              </label>
              <textarea
                required
                name="detalle"
                value={formData.detalle}
                onChange={handleChange}
                placeholder="Describe la incidencia…"
                className="border border-gray-300 mt-1 rounded-md px-4 py-2 w-full focus:ring-2 focus:ring-verde-600"
                rows={4}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-azul-950 font-medium">Sugerencia (opcional)</label>
              <textarea
                name="sugerencia"
                value={formData.sugerencia}
                onChange={handleChange}
                placeholder="Recomendación o acción sugerida…"
                className="border border-gray-300 mt-1 rounded-md px-4 py-2 w-full focus:ring-2 focus:ring-verde-600"
                rows={3}
              />
            </div>
          </div>

          {/* Selectores lado a lado */}
          <div className="mt-6 grid gap-6 grid-cols-1 md:grid-cols-2">
            <SelectEncargado
              token={token}
              selectedId={formData.id_encargado}
              onSelect={handleSelectEncargado}
            />
            <SelectReserva
              token={token}
              selectedId={formData.id_reserva}
              onSelect={handleSelectReserva}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => navigate("/reporte-incidencias")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-5 rounded-md transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={enviando}
              className="bg-verde-600 hover:bg-verde-700 text-white font-semibold py-2 px-5 rounded-md transition disabled:opacity-60"
            >
              {enviando ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>

          {/* Mensajes de error */}
          {error && <p className="mt-3 text-red-600 text-sm font-medium">{error}</p>}
        </div>
      </form>

      {/* Alerta de éxito */}
      {successAlert.open && (
        <div className="mt-4">
          <Alerta
            open
            display="inline"
            variant="success"
            title="Operación exitosa"
            message={successAlert.msg}
            onClose={() => setSuccessAlert({ open: false, msg: "" })}
          />
        </div>
      )}
    </main>
  );
}
