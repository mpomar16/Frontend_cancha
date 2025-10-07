/* eslint-disable no-unused-vars */
// components/EspacioFormEdit.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listarAdminsUnicos } from "../services/espacioService";
import { listarCanchas, eliminarCancha } from "../services/canchaService";
import { Building2, Plus, ArrowLeft } from "lucide-react";
import CanchasLista from "../components/CanchasLista";
import useImagePreview from "../hooks/useImagePreview";
import Alerta from "../components/Alerta";

const API_BASE = "http://localhost:3000";

const buildImageUrl = (p) => {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p; // ya es absoluta
  const rel = p.startsWith("/") ? p : `/${p}`;
  return `${API_BASE}${rel}`;
};

function EspacioFormEdit({ initialData = {}, onSubmit, token }) {
  const [formData, setFormData] = useState({
    nombre: initialData.nombre || "",
    direccion: initialData.direccion || "",
    descripcion: initialData.descripcion || "",
    latitud: initialData.latitud || "",
    longitud: initialData.longitud || "",
    horario_apertura: initialData.horario_apertura || "",
    horario_cierre: initialData.horario_cierre || "",
    id_admin_esp_dep: initialData.id_admin_esp_dep || "",
    id_espacio: initialData.id_espacio || "",
  });

  const [admins, setAdmins] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  // Hooks fijos para imágenes
  const imgPrincipal = useImagePreview({
    initialUrl: buildImageUrl(initialData.imagen_principal),
    allowed: ["image/jpeg", "image/png", "image/webp"],
    maxMB: 3,
    inputId: "imagen_principal",
  });
  const imgSec1 = useImagePreview({
    initialUrl: buildImageUrl(initialData.imagen_sec_1),
    allowed: ["image/jpeg", "image/png", "image/webp"],
    maxMB: 3,
    inputId: "imagen_sec_1",
  });
  const imgSec2 = useImagePreview({
    initialUrl: buildImageUrl(initialData.imagen_sec_2),
    allowed: ["image/jpeg", "image/png", "image/webp"],
    maxMB: 3,
    inputId: "imagen_sec_2",
  });
  const imgSec3 = useImagePreview({
    initialUrl: buildImageUrl(initialData.imagen_sec_3),
    allowed: ["image/jpeg", "image/png", "image/webp"],
    maxMB: 3,
    inputId: "imagen_sec_3",
  });
  const imgSec4 = useImagePreview({
    initialUrl: buildImageUrl(initialData.imagen_sec_4),
    allowed: ["image/jpeg", "image/png", "image/webp"],
    maxMB: 3,
    inputId: "imagen_sec_4",
  });

  const imagenes = {
    imagen_principal: imgPrincipal,
    imagen_sec_1: imgSec1,
    imagen_sec_2: imgSec2,
    imagen_sec_3: imgSec3,
    imagen_sec_4: imgSec4,
  };

  // Cargar admins
  useEffect(() => {
    async function fetchAdmins() {
      try {
        const res = await listarAdminsUnicos(token);
        setAdmins(res.data || []);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los administradores.");
      }
    }
    fetchAdmins();
  }, [token]);

  // Cargar canchas y filtrar por espacio actual
  useEffect(() => {
    async function fetchCanchas() {
      try {
        const res = await listarCanchas(token);
        const canchasFiltradas = (res.data || []).filter(
          (c) => c.id_espacio === initialData.id_espacio
        );
        setCanchas(canchasFiltradas);
      } catch (err) {
        console.error("Error al cargar canchas:", err.message);
      }
    }
    if (initialData.id_espacio) fetchCanchas();
  }, [initialData.id_espacio, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setError("");
    setEnviando(true);

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        // si es latitud o longitud, siempre incluir aunque sea vacío
        if (["latitud", "longitud"].includes(k)) data.append(k, String(v || ""));
        else if (v !== "") data.append(k, v);
      }
    });

    Object.entries(imagenes).forEach(([key, obj]) => {
      if (obj.file) data.append(key, obj.file);
    });

    try {
      await onSubmit(data);
    } catch (err) {
      setError(err.message || "Ocurrió un error al guardar.");
    } finally {
      setEnviando(false);
    }
  };

  // Estado para control del modal
  const [alerta, setAlerta] = useState({ open: false, idObjetivo: null });
  const [eliminandoId, setEliminandoId] = useState(null);

  // Abrir modal de confirmación
  const solicitarEliminacion = (idCancha) => {
    setAlerta({ open: true, idObjetivo: idCancha });
  };

  // Confirmar eliminación
  const confirmarEliminacion = async () => {
    const id = alerta.idObjetivo;
    if (!id) return;

    try {
      setEliminandoId(id);
      await eliminarCancha(id, token);

      // quitar de la lista local
      setCanchas((prev) => prev.filter((c) => c.id_cancha !== id));

      setAlerta({ open: false, idObjetivo: null });
    } catch (err) {
      console.error("❌ Error al eliminar cancha:", err.message);
      alert("No se pudo eliminar la cancha: " + err.message);
    } finally {
      setEliminandoId(null);
    }
  };


  return (
    <main>
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/espacios")}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <h1 className="flex items-center text-2xl font-poppins font-bold text-azul-950">
            <Building2 className="mr-3" />
            Edite la información del Espacio Deportivo
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="min-h-[0]">
        {/* === Sección Información General === */}
        <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8">
          <div className="mb-6">
            <h2 className="font-medium text-xl text-verde-600">Información General</h2>
            <p className="font-light text-verde-600">Actualiza los datos y guarda los cambios.</p>
          </div>

          <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <div className="grid gap-4 gap-y-4 text-sm grid-cols-1 md:grid-cols-2">
                {/* Nombre */}
                <div>
                  <label htmlFor="nombre" className="text-azul-950 font-medium">
                    Nombre del espacio*
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    placeholder="Polideportivo Miraflores"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 
                    focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>

                {/* Dirección */}
                <div>
                  <label htmlFor="direccion" className="text-azul-950 font-medium">
                    Dirección
                  </label>
                  <input
                    id="direccion"
                    name="direccion"
                    type="text"
                    placeholder="Av. Busch #123"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 
                    focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>

                {/* Descripción */}
                <div className="md:col-span-2">
                  <label htmlFor="descripcion" className="text-azul-950 font-medium">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    placeholder="Instalación moderna con canchas múltiples..."
                    value={formData.descripcion}
                    onChange={handleChange}
                    className="border border-gray-300 mt-1 rounded-md px-4 py-2 w-full bg-white text-azul-950 
                    focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>

                {/* Coordenadas */}
                {/* === Coordenadas con mapa (sin API adicional) === */}
                <div className="md:col-span-2 mt-6">
                  <label className="text-azul-950 font-medium">Ubicación del espacio</label>
                  <p className="text-xs text-gray-500 mb-2">
                    Introduce manualmente las coordenadas o copia/pega desde Google Maps.
                    Luego presiona “Ver en mapa”.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label htmlFor="latitud" className="text-azul-950 font-medium">Latitud</label>
                      <input
                        id="latitud"
                        name="latitud"
                        type="text"
                        step="any"
                        placeholder="-16.5000"
                        value={formData.latitud}
                        onChange={handleChange}
                        className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                      />
                    </div>

                    <div>
                      <label htmlFor="longitud" className="text-azul-950 font-medium">Longitud</label>
                      <input
                        id="longitud"
                        name="longitud"
                        type="text"
                        step="any"
                        placeholder="-68.1193"
                        value={formData.longitud}
                        onChange={handleChange}
                        className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const lat = formData.latitud || -16.5;
                        const lng = formData.longitud || -68.1;
                        const iframe = document.getElementById("mapPreview");
                        if (iframe) {
                          iframe.src = `https://www.google.com/maps?q=${lat},${lng}&hl=es&z=15&output=embed`;
                        }
                      }}
                      className="h-10 bg-verde-600 hover:bg-verde-700 text-white font-medium rounded-md transition"
                    >
                      Ver en mapa
                    </button>
                  </div>
                  {/* Vista previa del mapa */}
                  <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                    <iframe
                      id="mapPreview"
                      title="Mapa de ubicación"
                      src={
                        formData.latitud && formData.longitud
                          ? `https://www.google.com/maps?q=${formData.latitud},${formData.longitud}&hl=es&z=15&output=embed`
                          : "https://www.google.com/maps?q=-16.5000,-68.1193&hl=es&z=12&output=embed"
                      }
                      className="w-full h-64"
                      loading="lazy"
                    ></iframe>
                  </div>
                </div>

                {/* Horarios */}
                <div>
                  <label htmlFor="horario_apertura" className="text-azul-950 font-medium">
                    Horario de Apertura
                  </label>
                  <input
                    id="horario_apertura"
                    name="horario_apertura"
                    type="time"
                    value={formData.horario_apertura}
                    onChange={handleChange}
                    className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 
                    focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>

                <div>
                  <label htmlFor="horario_cierre" className="text-azul-950 font-medium">
                    Horario de Cierre
                  </label>
                  <input
                    id="horario_cierre"
                    name="horario_cierre"
                    type="time"
                    value={formData.horario_cierre}
                    onChange={handleChange}
                    className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 
                    focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>

                {/* Admin */}
                <div className="md:col-span-2">
                  <label htmlFor="id_admin_esp_dep" className="text-azul-950 font-medium">
                    Administrador Deportivo
                  </label>
                  <select
                    id="id_admin_esp_dep"
                    name="id_admin_esp_dep"
                    value={formData.id_admin_esp_dep}
                    onChange={handleChange}
                    className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 
                    focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  >
                    <option value="">Seleccione un administrador</option>
                    {admins.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre_completo || `ID ${a.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === Galería + Canchas === */}
        <div className="bg-white rounded shadow-lg p-4 px-4 md:px-8 md:p-2 mt-6">
          <div className="mb-6">
            <h2 className="font-medium text-xl text-verde-600">Galería de fotos y canchas</h2>
            <p className="font-light text-verde-600">Actualiza las fotos y canchas del espacio</p>
          </div>

          {/* === Imágenes === */}
          {/* === Imágenes (en 2 columnas) === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {Object.entries(imagenes).map(([key, obj], idx) => {
              const label = idx === 0 ? "Imagen Principal" : `Imagen Secundaria ${idx}`;
              return (
                <div key={key} className="border border-gray-200 rounded-lg bg-white p-3 shadow-sm hover:shadow-md transition">
                  <label htmlFor={key} className="text-azul-950 font-medium text-sm">
                    {label}
                  </label>

                  <div
                    {...obj.dropzoneProps}
                    className="mt-2 border border-dashed border-gray-300 rounded-md p-3 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {/* Miniatura */}
                      <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                        {obj.previewUrl ? (
                          <img
                            src={obj.previewUrl}
                            alt="Previsualización"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-400 text-center leading-tight px-2">
                            Sin imagen
                          </span>
                        )}
                      </div>

                      {/* Controles */}
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 mb-2">
                          Arrastra una imagen o selecciona un archivo
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                          <label
                            htmlFor={key}
                            className="cursor-pointer bg-verde-600 text-white hover:bg-green-700 text-xs font-medium px-2.5 py-1.5 rounded-md border"
                          >
                            Seleccionar
                          </label>

                          {obj.previewUrl && (
                            <button
                              type="button"
                              onClick={obj.clear}
                              className="bg-white hover:bg-gray-50 text-gray-800 text-xs font-medium px-2.5 py-1.5 rounded-md border"
                            >
                              Quitar
                            </button>
                          )}
                        </div>

                        <p className="mt-1 text-[11px] text-gray-400">
                          JPG, PNG o WEBP · máx. 5 MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {obj.imgError && (
                    <p className="mt-1 text-red-600 text-xs">{obj.imgError}</p>
                  )}
                </div>
              );
            })}
          </div>


          {/* === Lista de Canchas con acciones === */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-azul-950">
                Canchas disponibles
              </h3>

              <Link
                to={`/cancha/create?espacio=${formData.id_espacio}`}
                className="inline-flex items-center gap-2 bg-verde-600 hover:bg-verde-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir cancha</span>
              </Link>

            </div>

            <CanchasLista
              canchas={canchas}
              mostrarAcciones={true}
              eliminandoId={eliminandoId}
              onEliminar={solicitarEliminacion} // 👈 este nombre debe coincidir
            />
          </div>

          {/* === Botón Guardar === */}
          <div className="md:col-span-2 flex items-end justify-end mb-4 mt-4">
            <button
              type="submit"
              disabled={enviando}
              className="w-full md:w-auto bg-verde-600 hover:bg-verde-700 disabled:opacity-60 text-white font-semibold py-2 px-5 rounded transition"
            >
              {enviando ? "Guardando…" : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </form>
      <Alerta
        open={alerta.open}
        variant="confirm"
        title="¿Eliminar cancha?"
        message="Esta acción eliminará permanentemente la cancha seleccionada. ¿Deseas continuar?"
        primaryAction={{
          label: "Eliminar",
          onClick: confirmarEliminacion,
          loading: eliminandoId !== null,
        }}
        secondaryAction={{
          label: "Cancelar",
          onClick: () => setAlerta({ open: false, idObjetivo: null }),
        }}
        onClose={() => setAlerta({ open: false, idObjetivo: null })}
      />

    </main>
  );
}

export default EspacioFormEdit;
