// components/EncargadoFormCreate.jsx
/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function EncargadoFormCreate({
  onSubmit,
  token,
  isCreate = false,
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    id_persona: "",
    responsabilidad: "",
    fecha_inicio: "",
    hora_ingreso: "",
    hora_salida: "",
    estado: "activo",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const err = {};
    if (!form.id_persona) err.id_persona = "Requerido";
    if (!form.responsabilidad.trim()) err.responsabilidad = "Requerido";
    if (!form.fecha_inicio) err.fecha_inicio = "Requerido";
    if (!form.hora_ingreso) err.hora_ingreso = "Requerido";
    if (!form.hora_salida) err.hora_salida = "Requerido";
    if (!form.estado) err.estado = "Requerido";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      id_persona: Number(form.id_persona),
      responsabilidad: form.responsabilidad.trim(),
      fecha_inicio: form.fecha_inicio,       // YYYY-MM-DD
      hora_ingreso: form.hora_ingreso,       // HH:mm
      hora_salida: form.hora_salida,         // HH:mm
      estado: form.estado,                   // 'activo' | 'inactivo'
    };

    await onSubmit?.(payload);
  };

  return (
    <section className="max-w-3xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        <h1 className="text-2xl font-bold text-azul-950">
          {isCreate ? "Nuevo Encargado" : "Editar Encargado"}
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white shadow p-5 sm:p-6 space-y-5"
      >
        {/* id_persona */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Persona
            </label>
            <input
              type="number"
              name="id_persona"
              value={form.id_persona}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 text-sm outline-none ${
                errors.id_persona ? "border-red-400" : "border-gray-300"
              }`}
              placeholder="Ej: 123"
              min={1}
            />
            {errors.id_persona && (
              <p className="mt-1 text-xs text-red-600">{errors.id_persona}</p>
            )}
            <p className="mt-1 text-[11px] text-gray-500">
              Debe corresponder a una PERSONA existente.
            </p>
          </div>

          {/* estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 text-sm outline-none ${
                errors.estado ? "border-red-400" : "border-gray-300"
              }`}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            {errors.estado && (
              <p className="mt-1 text-xs text-red-600">{errors.estado}</p>
            )}
          </div>
        </div>

        {/* responsabilidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Responsabilidad
          </label>
          <textarea
            name="responsabilidad"
            value={form.responsabilidad}
            onChange={handleChange}
            rows={3}
            className={`w-full rounded-md border px-3 py-2 text-sm outline-none ${
              errors.responsabilidad ? "border-red-400" : "border-gray-300"
            }`}
            placeholder="Describe la responsabilidad del encargado"
          />
          {errors.responsabilidad && (
            <p className="mt-1 text-xs text-red-600">{errors.responsabilidad}</p>
          )}
        </div>

        {/* fecha + horario */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de inicio
            </label>
            <input
              type="date"
              name="fecha_inicio"
              value={form.fecha_inicio}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 text-sm outline-none ${
                errors.fecha_inicio ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.fecha_inicio && (
              <p className="mt-1 text-xs text-red-600">{errors.fecha_inicio}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora ingreso
            </label>
            <input
              type="time"
              name="hora_ingreso"
              value={form.hora_ingreso}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 text-sm outline-none ${
                errors.hora_ingreso ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.hora_ingreso && (
              <p className="mt-1 text-xs text-red-600">{errors.hora_ingreso}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora salida
            </label>
            <input
              type="time"
              name="hora_salida"
              value={form.hora_salida}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 text-sm outline-none ${
                errors.hora_salida ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.hora_salida && (
              <p className="mt-1 text-xs text-red-600">{errors.hora_salida}</p>
            )}
          </div>
        </div>

        {/* acciones */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-verde-600 hover:bg-verde-700 text-white text-sm"
          >
            {isCreate ? "Crear encargado" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </section>
  );
}
