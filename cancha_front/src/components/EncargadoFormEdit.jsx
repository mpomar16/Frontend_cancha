/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  UserCog,
  ArrowLeft,
  Mail,
  Phone,
  User,
  CalendarDays,
  Clock,
} from "lucide-react";
import Alerta from "./Alerta";
import { obtenerEncargadoPorId } from "../services/encargadoService";
import placeholder from "../assets/placeholder.jpeg";

const API_BASE = "http://localhost:3000";

// Puedes usarlo de dos maneras:
// 1) <EncargadoFormEdit token={token} encargadoId={id} onSubmit={fn} />
// 2) <EncargadoFormEdit token={token} initialEncargado={obj} onSubmit={fn} />
export default function EncargadoFormEdit({
  token,
  initialEncargado,
  encargadoId,
  onSubmit,
}) {
  const navigate = useNavigate();
  const params = useParams(); // por si lo montas directo en /encargados/:id/editar
  const idFromRoute = params?.id;

  const effectiveId = encargadoId ?? idFromRoute;

  const [loadedEncargado, setLoadedEncargado] = useState(
    initialEncargado || null
  );
  const [loadError, setLoadError] = useState("");

  // Si no viene initialEncargado, lo cargo por id
  useEffect(() => {
    let ignore = false;
    async function fetchIt() {
      if (loadedEncargado || !effectiveId) return;
      try {
        const resp = await obtenerEncargadoPorId(effectiveId, token);
        const enc = resp?.data ?? resp;
        if (!ignore) setLoadedEncargado(enc);
      } catch (e) {
        if (!ignore)
          setLoadError(e?.message || "No se pudo cargar el encargado");
      }
    }
    fetchIt();
    return () => {
      ignore = true;
    };
  }, [effectiveId, token, loadedEncargado]);

  // normalizar valores para inputs
  const init = useMemo(() => {
    const src = loadedEncargado || initialEncargado;
    if (!src) return null;
    return {
      id_encargado: src.id_encargado, // PK (== id_persona)
      responsabilidad: src.responsabilidad || "",
      fecha_inicio: (src.fecha_inicio || "").slice(0, 10), // YYYY-MM-DD
      hora_ingreso: (src.hora_ingreso || "").slice(0, 5), // HH:mm
      hora_salida: (src.hora_salida || "").slice(0, 5), // HH:mm
      estado: Boolean(src.estado), // boolean
      persona: {
        id_persona: src.id_persona,
        nombre: src.nombre,
        apellido: src.apellido,
        correo: src.correo,
        telefono: src.telefono,
        sexo: src.sexo,
        imagen_perfil: src.imagen_perfil,
      },
    };
  }, [loadedEncargado, initialEncargado]);

  const [form, setForm] = useState({
    responsabilidad: "",
    fecha_inicio: "",
    hora_ingreso: "",
    hora_salida: "",
    estado: true,
  });

  const [errors, setErrors] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [successAlert, setSuccessAlert] = useState({ open: false, msg: "" });

  useEffect(() => {
    if (init) {
      setForm({
        responsabilidad: init.responsabilidad,
        fecha_inicio: init.fecha_inicio,
        hora_ingreso: init.hora_ingreso,
        hora_salida: init.hora_salida,
        estado: init.estado,
      });
    }
  }, [init]);

  const validate = () => {
    const err = {};
    if (!form.responsabilidad.trim()) err.responsabilidad = "Requerido";
    if (!form.fecha_inicio) err.fecha_inicio = "Requerido";
    if (!form.hora_ingreso) err.hora_ingreso = "Requerido";
    if (!form.hora_salida) err.hora_salida = "Requerido";
    if (form.estado === undefined || form.estado === null)
      err.estado = "Requerido";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    if (!validate()) return;
    if (!init?.id_encargado) {
      setError("No se encontró el ID del encargado.");
      return;
    }

    const payload = {
      responsabilidad: form.responsabilidad.trim(),
      fecha_inicio: form.fecha_inicio, // YYYY-MM-DD
      hora_ingreso: form.hora_ingreso, // HH:mm
      hora_salida: form.hora_salida, // HH:mm
      estado: Boolean(form.estado), // boolean
    };

    setError("");
    setEnviando(true);
    try {
      await onSubmit?.(init.id_encargado, payload);
      setSuccessAlert({
        open: true,
        msg: "Encargado actualizado correctamente.",
      });
      setTimeout(() => navigate("/encargados"), 1200);
    } catch (err) {
      setError(err?.message || "Error al actualizar el encargado.");
    } finally {
      setEnviando(false);
    }
  };

  // estados de carga
  if (loadError) {
    return (
      <div className="p-6">
        <p className="text-red-600">{loadError}</p>
      </div>
    );
  }

  if (!init) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Cargando encargado…</p>
      </div>
    );
  }

  // Datos visuales
  const nombreCompleto = `${init.persona?.nombre ?? ""} ${
    init.persona?.apellido ?? ""
  }`.trim();
  const imagenSrc = init.persona?.imagen_perfil
    ? `${API_BASE}${init.persona.imagen_perfil}`
    : placeholder;

  return (
    <main>
      {/* Header */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/encargados")}
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <h1 className="flex items-center text-2xl font-poppins font-bold text-azul-950">
            <UserCog className="mr-3" />
            Editar Encargado
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-md-xl shadow-lg p-4 px-4 md:p-8">
          <div className="mb-6">
            <h2 className="font-medium text-xl text-verde-600">
              Información General
            </h2>
            <p className="font-light text-verde-600">
              Actualiza los campos del encargado. La persona asignada no se
              puede cambiar.
            </p>
          </div>

          {/* ====== Ficha compacta de la persona (estilo EncargadoDetalle, versión compacta) ====== */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 mb-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 shrink-0">
                <img
                  src={imagenSrc}
                  alt={nombreCompleto || "Persona"}
                  className="w-16 h-16 rounded-full object-cover bg-gray-100 border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = placeholder;
                  }}
                />
              </div>

              {/* Datos */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoRow
                  icon={<User className="w-4 h-4" />}
                  label="Persona"
                  value={
                    nombreCompleto
                      ? `${nombreCompleto}`
                      : ``
                  }
                />
                <InfoRow
                  icon={<Mail className="w-4 h-4" />}
                  label="Correo"
                  value={init.persona.correo || "—"}
                />
                <InfoRow
                  icon={<Phone className="w-4 h-4" />}
                  label="Teléfono"
                  value={init.persona.telefono || "—"}
                />
                <InfoRow
                  icon={<UserCog className="w-4 h-4" />}
                  label="Sexo"
                  value={init.persona.sexo || "—"}
                />
              </div>
            </div>
          </section>

          {/* Campos editables */}
          <div className="grid gap-4 text-sm grid-cols-1 md:grid-cols-2">
            {/* Estado (boolean en UI como Activo/Inactivo) */}
            <div>
              <label className="text-azul-950 font-medium">Estado*</label>
              <select
                name="estado"
                value={String(form.estado)}
                onChange={(e) =>
                  setForm((f) => ({ ...f, estado: e.target.value === "true" }))
                }
                className={`h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 
                  focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0 ${
                    errors.estado ? "ring-2 ring-red-400" : ""
                  }`}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
              {errors.estado && (
                <p className="mt-1 text-xs text-red-600">{errors.estado}</p>
              )}
            </div>

            {/* Fecha */}
            <div>
              <label className="text-azul-950 font-medium">
                Fecha de inicio*
              </label>
              <input
                type="date"
                name="fecha_inicio"
                value={form.fecha_inicio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fecha_inicio: e.target.value }))
                }
                className={`h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 
                  focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0 ${
                    errors.fecha_inicio ? "ring-2 ring-red-400" : ""
                  }`}
              />
              {errors.fecha_inicio && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.fecha_inicio}
                </p>
              )}
            </div>

            {/* Hora ingreso */}
            <div>
              <label className="text-azul-950 font-medium">Hora ingreso*</label>
              <div className="relative">
                <input
                  type="time"
                  name="hora_ingreso"
                  value={form.hora_ingreso}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, hora_ingreso: e.target.value }))
                  }
                  className={`h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 
                    focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0 ${
                      errors.hora_ingreso ? "ring-2 ring-red-400" : ""
                    }`}
                />
                <Clock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.hora_ingreso && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.hora_ingreso}
                </p>
              )}
            </div>

            {/* Hora salida */}
            <div>
              <label className="text-azul-950 font-medium">Hora salida*</label>
              <div className="relative">
                <input
                  type="time"
                  name="hora_salida"
                  value={form.hora_salida}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, hora_salida: e.target.value }))
                  }
                  className={`h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 
                    focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0 ${
                      errors.hora_salida ? "ring-2 ring-red-400" : ""
                    }`}
                />
                <Clock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.hora_salida && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.hora_salida}
                </p>
              )}
            </div>

            {/* Responsabilidad */}
            <div className="md:col-span-2">
              <label className="text-azul-950 font-medium">
                Responsabilidad*
              </label>
              <textarea
                name="responsabilidad"
                rows={3}
                value={form.responsabilidad}
                onChange={(e) =>
                  setForm((f) => ({ ...f, responsabilidad: e.target.value }))
                }
                placeholder="Describe la responsabilidad del encargado"
                className={`border border-gray-300 mt-1 rounded-md px-4 py-2 w-full 
                  focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0 ${
                    errors.responsabilidad ? "ring-2 ring-red-400" : ""
                  }`}
              />
              {errors.responsabilidad && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.responsabilidad}
                </p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => navigate("/encargados")}
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

          {/* Mensajes */}
          {error && (
            <p className="mt-3 text-red-600 text-sm font-medium">{error}</p>
          )}
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

function InfoRow({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-verde-600 mb-1 flex items-center gap-1">
        {icon} {label}
      </div>
      <div className="text-sm font-semibold text-azul-950 break-words">
        {value || "—"}
      </div>
    </div>
  );
}
