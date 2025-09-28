// src/components/PersonaEditarForm.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerPersona } from "../../api/persona_obtener";
import { actualizarPersona } from "../../api/persona_actualizar";
import usarImagenPerfil from "../../hooks/usarImagenPerfil";

export default function PersonaEditarForm({ id, onSuccess }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    sexo: "",
  });
  const [imagenPerfil, setImagenPerfil] = useState(null); // ruta/clave de la imagen actual (del backend)
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // preview del archivo seleccionado
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Cargar datos
  useEffect(() => {
    let revoke;
    async function fetchPersona() {
      setIsLoading(true);
      try {
        const response = await obtenerPersona(id);
        if (response.success && response.data) {
          const d = response.data;
          setFormData({
            nombre: d.nombre || "",
            apellido: d.apellido || "",
            telefono: d.telefono || "",
            correo: d.correo || "",
            sexo: d.sexo || "",
          });
          setImagenPerfil(d.imagen_perfil || null);
        } else {
          setMensaje("Error al cargar datos: " + response.message);
        }
      } catch (error) {
        setMensaje(error.message);
      } finally {
        setIsLoading(false);
      }
      return () => {
        if (revoke) URL.revokeObjectURL(revoke);
      };
    }
    fetchPersona();
  }, [id]);

  // Imagen actual del backend (si existe)
  const imagenActual = usarImagenPerfil(imagenPerfil);

  // Manejo de cambios
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Archivo y preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : null);
  };

  // Enviar
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMensaje("");
    try {
      const response = await actualizarPersona(id, formData, file);
      if (response.success) {
        setMensaje("Persona actualizada exitosamente");
        // ✅ si viene onSuccess (modal), úsalo; si no, navega como antes
        if (onSuccess) {
          onSuccess(); // el padre cierra modal y refresca lista
        } else {
          setTimeout(() => navigate("/personas"), 1500);
        }
      } else {
        setMensaje("Error: " + response.message);
      }
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const avatarSrc = previewUrl || imagenActual;

  return (
    <section className="px-6 py-6">
      <div className="max-w-3xl mx-auto rounded-2xl border border-gris-200 bg-blanco-50 shadow-sm">
        {/* Header */}
        <div className="border-b border-gris-200 px-6 py-4">
          <h2 className="text-xl font-bold text-azul-950">Editar persona</h2>
          <p className="text-sm text-azul-950/70">
            Actualiza los datos de contacto y la imagen de perfil.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* Avatar + subir imagen */}
          <div className="flex items-center gap-4">
            <img
              src={avatarSrc}
              alt={`${formData.nombre || "Usuario"}`}
              className="h-20 w-20 rounded-full object-cover ring-2 ring-gris-200"
            />
            <div>
              <label
                htmlFor="file"
                className="inline-flex cursor-pointer items-center rounded-xl bg-azul-950 px-4 py-2 text-blanco-50 hover:opacity-90"
              >
                Cambiar foto
              </label>
              <input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="mt-1 text-xs text-azul-950/70">
                PNG o JPG, tamaño recomendado 256×256.
              </p>
              {file && (
                <p className="mt-1 text-xs text-azul-950/80">
                  Seleccionado: <span className="font-medium">{file.name}</span>
                </p>
              )}
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Juan"
            />
            <Field
              label="Apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              placeholder="Pérez"
            />
            <Field
              label="Correo"
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="usuario@correo.com"
              required
            />
            <Field
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="70500000"
            />
            <SelectField
              label="Sexo"
              name="sexo"
              value={formData.sexo}
              onChange={handleChange}
              options={[
                { value: "", label: "Seleccione" },
                { value: "masculino", label: "Masculino" },
                { value: "femenino", label: "Femenino" },
              ]}
            />
            {/* espacio para crecer o agregar otro campo */}
            <div className="hidden md:block" />
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center rounded-xl bg-verde-600 px-4 py-2 text-blanco-50 hover:bg-verde-700 disabled:opacity-60"
            >
              {isLoading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>

          {/* Mensaje */}
          {mensaje && (
            <div
              className={`mt-2 rounded-xl px-4 py-3 text-sm ${mensaje.includes("exitosamente")
                  ? "bg-verde-600/10 text-verde-700"
                  : "bg-rojo-600/10 text-rojo-700"
                }`}
            >
              {mensaje}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

/* ---------- Subcomponentes de campo ---------- */
function Field({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  required = false,
}) {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm font-medium text-azul-950">
        {label} {required && <span className="text-rojo-600">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete="off"
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-gris-200 px-3 py-2 text-azul-950 placeholder:text-azul-950/40 focus:outline-none focus:ring-2 focus:ring-verde-600"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options = [] }) {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm font-medium text-azul-950">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-xl border border-gris-200 px-3 py-2 text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
