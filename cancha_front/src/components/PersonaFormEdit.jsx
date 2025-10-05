/* eslint-disable no-unused-vars */
// components/PersonaFormEdit.jsx
import { useState, useEffect } from "react";
import { listarSexoEnum } from "../services/personaService";
import { Users, Eye, EyeClosed } from "lucide-react";
import useImagePreview from "../hooks/useImagePreview";

const API_BASE = "http://localhost:3000";

const buildImageUrl = (p) => {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;                  // ya es absoluta
  const rel = p.startsWith("/") ? p : `/${p}`;            // asegura slash
  return `${API_BASE}${rel}`;
};

function PersonaFormEdit({ initialData = {}, onSubmit, token }) {
  const [formData, setFormData] = useState({
    nombre: initialData.nombre || "",
    usuario: initialData.usuario || "",
    apellido: initialData.apellido || "",
    contrasena: "",
    telefono: initialData.telefono || "",
    correo: initialData.correo || "",
    sexo: initialData.sexo || "",
  });
  const [imagen_perfil, setImagenPerfil] = useState(null); // <— se mantiene
  const [sexos, setSexos] = useState([]);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [verContrasena, setVerContrasena] = useState(false);

  const initialImgUrl = buildImageUrl(initialData?.imagen_perfil);
  const {
    file: imagenFile,
    previewUrl,
    error: imgError,
    inputProps,
    dropzoneProps,
    clear: clearImage,
  } = useImagePreview({
    initialUrl: initialImgUrl,
    allowed: ["image/jpeg", "image/png", "image/webp"],
    maxMB: 2,
  });

  useEffect(() => {
    setImagenPerfil(imagenFile || null);
  }, [imagenFile]);

  useEffect(() => {
    async function fetchSexos() {
      try {
        const response = await listarSexoEnum(token);
        setSexos(response.data || []);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchSexos();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleFileChange = (e) => {
    setImagenPerfil(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;

    setError("");
    setEnviando(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== "" && formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    if (imagen_perfil) data.append("imagen_perfil", imagen_perfil);

    try {
      await onSubmit(data);
    } catch (err) {
      setError(err.message || "Ocurrió un error al guardar.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main>
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="flex items-center text-2xl font-poppins font-bold text-azul-950">
          <Users className="mr-3" />
          Edite el perfil de una Persona
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="min-h-[0]">
        <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8">
          <div className="mb-4">
            <h2 className="font-semibold text-xl text-azul-950">
              Editar Perfil
            </h2>
            <p className="text-gray-500">
              Actualiza los datos y guarda los cambios.
            </p>
          </div>

          <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3">
            <div className="text-gray-600">
              <p className="font-medium text-lg">Datos personales</p>
              <p>Por favor, rellena los campos necesarios.</p>
            </div>

            <div className="lg:col-span-2">
              <div className="grid gap-4 gap-y-4 text-sm grid-cols-1 md:grid-cols-2">
                <div className="md:col-span-1">
                  <label htmlFor="nombre" className="text-azul-950 font-medium">
                    Nombre(s)*
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    placeholder="Juan"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>

                {/* Apellido */}
                <div className="md:col-span-1">
                  <label htmlFor="apellido" className="text-azul-950 font-medium">
                    Apellido(s)
                  </label>
                  <input
                    id="apellido"
                    name="apellido"
                    type="text"
                    placeholder="Pérez"
                    value={formData.apellido}
                    onChange={handleChange}
                    className="h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>

                {/* Correo */}
                <div className="md:col-span-2">
                  <label htmlFor="correo" className="text-azul-950 font-medium">
                    Correo*
                  </label>
                  <input
                    id="correo"
                    name="correo"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                    className="h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>

                {/* Usuario */}
                <div className="md:col-span-1">
                  <label htmlFor="usuario" className="text-azul-950 font-medium">
                    Usuario*
                  </label>
                  <input
                    id="usuario"
                    name="usuario"
                    type="text"
                    placeholder="juan123"
                    value={formData.usuario}
                    onChange={handleChange}
                    required
                    className="h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>

                {/* Teléfono */}
                <div className="md:col-span-1">
                  <label htmlFor="telefono" className="text-azul-950 font-medium">
                    Teléfono
                  </label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    placeholder="+591 71234567"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>

                {/* Sexo */}
                <div className="md:col-span-1">
                  <label htmlFor="sexo" className="text-azul-950 font-medium">
                    Sexo
                  </label>
                  <select
                    id="sexo"
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                    className="h-10 border mt-1 rounded px-4 w-full bg-gray-50h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  >
                    <option value="">Seleccione un sexo</option>
                    {sexos.map((sx) => (
                      <option key={sx} value={sx}>
                        {sx}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contraseña */}
                <div className="md:col-span-1">
                  <label htmlFor="contrasena" className="text-azul-950 font-medium">
                    Contraseña
                  </label>

                  <div className="relative">
                    <input
                      id="contrasena"
                      name="contrasena"
                      type={verContrasena ? "text" : "password"}
                      placeholder="********"
                      value={formData.contrasena}
                      onChange={handleChange}
                      className="h-10 border border-gray-300 mt-1 rounded-md pl-4 pr-10 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600"
                    />
                    <button
                      type="button"
                      onClick={() => setVerContrasena((v) => !v)}
                      aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                      aria-pressed={verContrasena}
                      className="absolute inset-y-0 right-2 mt-1 flex items-center justify-center px-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      tabIndex={0}
                    >
                      {verContrasena ? <EyeClosed className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Imagen de perfil */}
                <div className="md:col-span-2">
                  <label htmlFor="imagen_perfil" className="text-azul-950 font-medium">
                    Imagen de Perfil
                  </label>

                  <div
                    {...dropzoneProps}
                    className="mt-1 border border-dashed border-gray-300 rounded-lg p-4 bg-white"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Previsualización" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-400 px-2 text-center leading-tight">Sin imagen</span>
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm text-gray-700">Arrastra una imagen aquí o</p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <label
                            htmlFor="imagen_perfil"
                            className="inline-block cursor-pointer bg-verde-600 text-white hover:bg-green-700 text-gray-800 text-sm font-medium px-3 py-1.5 rounded-md border"
                          >
                            Seleccionar archivo
                          </label>

                          {previewUrl && (
                            <button
                              type="button"
                              onClick={clearImage}
                              className="inline-block bg-white hover:bg-gray-50 text-gray-800 text-sm font-medium px-3 py-1.5 rounded-md border"
                            >
                              Quitar
                            </button>
                          )}
                        </div>

                        <p className="mt-2 text-xs text-gray-500">Formatos: JPG, PNG, WEBP · Máx: 5 MB</p>

                        {/* input real (oculto visualmente) */}
                        <input
                          className="sr-only"
                          {...inputProps}
                          onChange={(e) => {
                            inputProps.onChange(e);   // hook
                            // (opcional) mantiene compatibilidad con tu antiguo estado:
                            setImagenPerfil(e.target.files?.[0] || null);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {(imgError || error) && (
                    <p className="mt-2 text-red-600 text-sm">{imgError || error}</p>
                  )}
                </div>

                {/* Submit */}
                <div className="md:col-span-2 flex items-end justify-end">
                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full md:w-auto bg-verde-600 hover:bg-verde-700 disabled:opacity-60 text-white font-semibold py-2 px-5 rounded transition"
                  >
                    {enviando ? "Guardando…" : "Guardar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}

export default PersonaFormEdit;
