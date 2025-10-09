import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ClienteFormCreate({
  onSubmit,
  token,
  isCreate = false,
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    id_persona: "",
    membresia: "",
    fecha_registro: "",
    estado: "activo",
  });

  const [errors, setErrors] = useState({});

  // ✅ Manejador de cambios
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // ✅ Validaciones básicas
  const validate = () => {
    const err = {};
    if (!form.id_persona) err.id_persona = "Requerido";
    if (!form.membresia.trim()) err.membresia = "Requerido";
    if (!form.fecha_registro) err.fecha_registro = "Requerido";
    if (!form.estado) err.estado = "Requerido";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ✅ Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      id_persona: Number(form.id_persona),
      membresia: form.membresia.trim(),
      fecha_registro: form.fecha_registro, // YYYY-MM-DD
      estado: form.estado, // 'activo' | 'inactivo'
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
          {isCreate ? "Nuevo Cliente" : "Editar Cliente"}
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white shadow p-5 sm:p-6 space-y-5"
      >
        {/* ID Persona y Estado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ID Persona */}
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

          {/* Estado */}
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

        {/* Membresía */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Membresía
          </label>
          <input
            type="text"
            name="membresia"
            value={form.membresia}
            onChange={handleChange}
            className={`w-full rounded-md border px-3 py-2 text-sm outline-none ${
              errors.membresia ? "border-red-400" : "border-gray-300"
            }`}
            placeholder="Ej: Premium, Básica, etc."
          />
          {errors.membresia && (
            <p className="mt-1 text-xs text-red-600">{errors.membresia}</p>
          )}
        </div>

        {/* Fecha Registro */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Registro
          </label>
          <input
            type="date"
            name="fecha_registro"
            value={form.fecha_registro}
            onChange={handleChange}
            className={`w-full rounded-md border px-3 py-2 text-sm outline-none ${
              errors.fecha_registro ? "border-red-400" : "border-gray-300"
            }`}
          />
          {errors.fecha_registro && (
            <p className="mt-1 text-xs text-red-600">{errors.fecha_registro}</p>
          )}
        </div>

        {/* Botones */}
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
            {isCreate ? "Crear cliente" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </section>
  );
}
