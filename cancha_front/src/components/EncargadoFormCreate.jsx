/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCog, ArrowLeft, Loader2, Search } from "lucide-react";
import Alerta from "./Alerta";
import Paginacion from "./Paginacion";
import EncargadoSelectPersona from "./EncargadoSelectPersona";
import { listarPersonasElegiblesEncargado } from "../services/personaService";

function Th({ children }) {
  return (
    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
      {children}
    </th>
  );
}

export default function EncargadoFormCreate({ token, onSubmit }) {
  const navigate = useNavigate();

  // ===== Form principal =====
  const [form, setForm] = useState({
    id_persona: "",
    responsabilidad: "",
    fecha_inicio: "",
    hora_ingreso: "",
    hora_salida: "",
    estado: true, // UI como boolean; se mapea a 'activo'/'inactivo' al enviar
  });

  const [errors, setErrors] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [successAlert, setSuccessAlert] = useState({ open: false, msg: "" });

  // ===== Tabla de personas elegibles =====
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [personas, setPersonas] = useState([]);
  const [limite, setLimite] = useState(6);
  const [desplazamiento, setDesplazamiento] = useState(0); // offset
  const [hasMore, setHasMore] = useState(false);
  const [cargandoLista, setCargandoLista] = useState(false);

  // debounce búsqueda
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  async function fetchElegibles(currentLimit = limite, currentOffset = desplazamiento, reset = false) {
    setCargandoLista(true);
    try {
      const { personas: items, hasMore: hm } = await listarPersonasElegiblesEncargado(
        { limit: currentLimit, offset: currentOffset, q: qDebounced },
        token
      );
      setHasMore(hm);
      if (reset) {
        setPersonas(items);
      } else {
        setPersonas((prev) => (currentOffset === 0 ? items : [...prev, ...items]));
      }
    } catch (e) {
      setPersonas([]);
      setHasMore(false);
    } finally {
      setCargandoLista(false);
    }
  }

  // cargar cuando cambian búsqueda/limite
  useEffect(() => {
    setDesplazamiento(0);
    fetchElegibles(limite, 0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced, limite]);

  // paginación tipo cursor (offset + hasMore)
  const handleCambiarLimite = (n) => {
    setLimite(n);
    setDesplazamiento(0);
  };

  const handleCambiarDesplazamiento = (nuevo) => {
    if (nuevo < desplazamiento) {
      setDesplazamiento(nuevo);
      fetchElegibles(limite, nuevo, true);
      return;
    }
    setDesplazamiento(nuevo);
    fetchElegibles(limite, nuevo, false);
  };

  // ===== Validación y submit =====
  const validate = () => {
    const err = {};
    if (!form.id_persona) err.id_persona = "Requerido";
    if (!form.responsabilidad.trim()) err.responsabilidad = "Requerido";
    if (!form.fecha_inicio) err.fecha_inicio = "Requerido";
    if (!form.hora_ingreso) err.hora_ingreso = "Requerido";
    if (!form.hora_salida) err.hora_salida = "Requerido";
    if (form.estado === undefined || form.estado === null) err.estado = "Requerido";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    if (!validate()) return;

    const payload = {
      id_persona: Number(form.id_persona),
      responsabilidad: form.responsabilidad.trim(),
      fecha_inicio: form.fecha_inicio, // YYYY-MM-DD
      hora_ingreso: form.hora_ingreso, // HH:mm
      hora_salida: form.hora_salida,   // HH:mm
      // 🔴 IMPORTANTE: backend espera 'activo'/'inactivo', no boolean
      estado: form.estado ? "activo" : "inactivo",
    };

    setError("");
    setEnviando(true);
    try {
      await onSubmit?.(payload);
      setSuccessAlert({ open: true, msg: "Encargado creado correctamente." });
      setTimeout(() => navigate("/encargados"), 1500);
    } catch (err) {
      setError(err?.message || "Error al crear el encargado.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main>
      {/* ===== Header ===== */}
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
            Registrar nuevo Encargado
          </h1>
        </div>
      </div>

      {/* ===== Formulario principal ===== */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-md-xl shadow-lg p-4 px-4 md:p-8">
          <div className="mb-6">
            <h2 className="font-medium text-xl text-verde-600">Información General</h2>
            <p className="font-light text-verde-600">
              Ingresa los datos del encargado y guarda los cambios.
            </p>
          </div>

          {/* Campos */}
          <div className="grid gap-4 text-sm grid-cols-1 md:grid-cols-2">
            {/* Estado (boolean en UI) */}
            <div>
              <label className="text-azul-950 font-medium">Estado*</label>
              <select
                name="estado"
                value={String(form.estado)}
                onChange={(e) =>
                  setForm((f) => ({ ...f, estado: e.target.value === "true" }))
                }
                className={`h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0 ${
                  errors.estado ? "ring-2 ring-red-400" : ""
                }`}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
              {errors.estado && <p className="mt-1 text-xs text-red-600">{errors.estado}</p>}
            </div>

            {/* Fecha inicio */}
            <div>
              <label className="text-azul-950 font-medium">Fecha de inicio*</label>
              <input
                type="date"
                name="fecha_inicio"
                value={form.fecha_inicio}
                onChange={(e) => setForm((f) => ({ ...f, fecha_inicio: e.target.value }))}
                className={`h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0 ${
                  errors.fecha_inicio ? "ring-2 ring-red-400" : ""
                }`}
              />
              {errors.fecha_inicio && <p className="mt-1 text-xs text-red-600">{errors.fecha_inicio}</p>}
            </div>

            {/* Hora ingreso */}
            <div>
              <label className="text-azul-950 font-medium">Hora ingreso*</label>
              <input
                type="time"
                name="hora_ingreso"
                value={form.hora_ingreso}
                onChange={(e) => setForm((f) => ({ ...f, hora_ingreso: e.target.value }))}
                className={`h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0 ${
                  errors.hora_ingreso ? "ring-2 ring-red-400" : ""
                }`}
              />
              {errors.hora_ingreso && <p className="mt-1 text-xs text-red-600">{errors.hora_ingreso}</p>}
            </div>

            {/* Hora salida */}
            <div>
              <label className="text-azul-950 font-medium">Hora salida*</label>
              <input
                type="time"
                name="hora_salida"
                value={form.hora_salida}
                onChange={(e) => setForm((f) => ({ ...f, hora_salida: e.target.value }))}
                className={`h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0 ${
                  errors.hora_salida ? "ring-2 ring-red-400" : ""
                }`}
              />
              {errors.hora_salida && <p className="mt-1 text-xs text-red-600">{errors.hora_salida}</p>}
            </div>

            {/* Responsabilidad (2 col) */}
            <div className="md:col-span-2">
              <label className="text-azul-950 font-medium">Responsabilidad*</label>
              <textarea
                name="responsabilidad"
                rows={3}
                value={form.responsabilidad}
                onChange={(e) => setForm((f) => ({ ...f, responsabilidad: e.target.value }))}
                placeholder="Describe la responsabilidad del encargado"
                className={`border border-gray-300 mt-1 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0 ${
                  errors.responsabilidad ? "ring-2 ring-red-400" : ""
                }`}
              />
              {errors.responsabilidad && (
                <p className="mt-1 text-xs text-red-600">{errors.responsabilidad}</p>
              )}
            </div>
          </div>

          {/* ===== Seleccionar persona (tabla) ===== */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-azul-950 mb-2">Seleccionar Persona</h3>
            <p className="text-sm text-gray-600 mb-3">
              Solo aparecen personas que <strong>no</strong> son ENCARGADO ni ADMINISTRADOR.
            </p>

            {/* Buscador */}
            <div className="flex items-center gap-2 mb-3 rounded-md border border-gray-300 px-2 py-1.5">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setDesplazamiento(0);
                }}
                placeholder="Buscar por nombre, apellido o correo"
                className="w-full outline-none text-sm"
              />
            </div>

            {/* Selección actual */}
            {form.id_persona ? (
              <div className="mb-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-verde-50 text-azul-950 rounded-lg text-sm">
                  Seleccionado: <strong>#{form.id_persona}</strong>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, id_persona: "" }))}
                    className="ml-2 text-xs underline"
                  >
                    Cambiar
                  </button>
                </span>
              </div>
            ) : null}
            {errors.id_persona && (
              <p className="mt-1 text-xs text-red-600">{errors.id_persona}</p>
            )}

            {/* Tabla */}
            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
              <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <Th></Th>
                      <Th>Foto</Th>
                      <Th>Nombre</Th>
                      <Th>Correo</Th>
                      <Th>Teléfono</Th>
                      <Th>Sexo</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargandoLista ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-5 text-center text-sm">
                          <span className="inline-flex items-center gap-2 text-gray-600">
                            <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
                          </span>
                        </td>
                      </tr>
                    ) : personas.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-5 text-center text-sm text-gray-500">
                          No hay resultados
                        </td>
                      </tr>
                    ) : (
                      personas.map((p) => (
                        <EncargadoSelectPersona
                          key={p.id_persona}
                          persona={p}
                          selected={Number(form.id_persona) === p.id_persona}
                          onSelect={() =>
                            setForm((f) => ({ ...f, id_persona: p.id_persona }))
                          }
                        />
                      ))
                    )}
                  </tbody>
                </table>

                {/* Footer paginación (cursor) */}
                <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
                  <span className="text-xs xs:text-sm text-gray-900">
                    Mostrando{" "}
                    {personas.length > 0
                      ? `${desplazamiento + 1} a ${desplazamiento + personas.length}`
                      : 0}
                  </span>

                  <div className="inline-flex mt-2 xs:mt-0">
                    <Paginacion
                      limite={limite}
                      desplazamiento={desplazamiento}
                      onCambiarDesplazamiento={handleCambiarDesplazamiento}
                      onCambiarLimite={handleCambiarLimite}
                      totalRegistros={null}
                      hasMore={hasMore}
                      opcionesLimite={[6, 12, 24]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Botones ===== */}
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
              {enviando ? "Guardando…" : "Crear encargado"}
            </button>
          </div>

          {/* Mensajes */}
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
