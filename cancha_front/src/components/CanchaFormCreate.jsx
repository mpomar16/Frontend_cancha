/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PlusCircle, Loader2 } from "lucide-react";
import {
  crearCancha,
  listarEstadoCanchaEnum,
  listarDisciplinas,
} from "../services/canchaService";
import useImagePreview from "../hooks/useImagePreview";
import Sidebar from "./Sidebar";

function CanchaFormCreate() {
  const [searchParams] = useSearchParams();
  const idEspacio = searchParams.get("espacio"); // ✅ viene desde el Link del espacio
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    nombre: "",
    ubicacion: "",
    capacidad: "",
    monto_por_hora: "",
    estado: "",
    disciplinas: [],
    id_espacio: "", 
  });

  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [estados, setEstados] = useState([]);
  const [todasDisciplinas, setTodasDisciplinas] = useState([]);

  useEffect(() => {
    if (idEspacio) {
      setFormData((prev) => ({ ...prev, id_espacio: idEspacio }));
    }
  }, [idEspacio]);

  // === Imagen con previsualización ===
  const {
    file: imagenFile,
    previewUrl,
    inputProps,
    dropzoneProps,
    clear: clearImage,
    error: errorImg,
  } = useImagePreview({
    initialUrl: null,
    allowed: ["image/jpeg", "image/png", "image/webp"],
    maxMB: 5,
  });

  // === Cargar estados y disciplinas ===
  useEffect(() => {
    async function cargarOpciones() {
      try {
        const [respEstados, respDisc] = await Promise.all([
          listarEstadoCanchaEnum(token),
          listarDisciplinas(token),
        ]);
        setEstados(respEstados.data || []);
        setTodasDisciplinas(respDisc.data || []);
      } catch (err) {
        console.error("Error cargando opciones:", err.message);
      }
    }
    cargarOpciones();
  }, [token]);

  // === Handlers ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleDisciplinaChange = (e) => {
    const value = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setFormData((s) => ({ ...s, disciplinas: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setError("");
    setEnviando(true);

    try {
      const data = new FormData();

      // ✅ Incluimos todos los campos, incluyendo id_espacio
      Object.entries(formData).forEach(([k, v]) => {
        if (Array.isArray(v)) data.append(k, JSON.stringify(v));
        else if (v !== null && v !== undefined) data.append(k, v);
      });

      if (imagenFile) data.append("imagen_cancha", imagenFile);

      await crearCancha(data, token);
      navigate(`/espacio/${idEspacio}`); // ✅ redirige al espacio actual
    } catch (err) {
      setError(err.message || "Error al crear la cancha.");
    } finally {
      setEnviando(false);
    }
  };

  // === UI ===
  return (
    <Sidebar>
      <main>
        {/* Header */}
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="flex items-center text-2xl font-poppins font-bold text-azul-950">
            <PlusCircle className="mr-3" />
            Registrar nueva cancha
          </h1>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="min-h-[0]">
          <div className="bg-white rounded-md-xl shadow-lg p-4 px-4 md:p-8">
            <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-2">
              {/* Columna izquierda */}
              <div className="text-verde-600 mb-4">
                <p className="font-medium text-lg">Datos de la cancha</p>
                <p>Por favor, rellena todos los campos requeridos.</p>
              </div>

              {/* Columna derecha */}
              <div className="lg:col-span-2">
                <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-2">
                  {/* Imagen */}
                  <div className="md:col-span-2">
                    <label htmlFor="imagen_cancha" className="text-azul-950 font-medium">
                      Imagen de la cancha
                    </label>

                    <div
                      {...dropzoneProps}
                      className="mt-1 border border-dashed border-gray-300 rounded-lg p-4 bg-white"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-28 h-28 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt="Previsualización"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-gray-400 px-2 text-center leading-tight">
                              Sin imagen
                            </span>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="text-sm text-gray-700">
                            Arrastra una imagen aquí o
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <label
                              htmlFor="imagen_cancha"
                              className="inline-block cursor-pointer bg-verde-600 text-white hover:bg-green-700 text-sm font-medium px-3 py-1.5 rounded-md border"
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

                          <p className="mt-2 text-xs text-gray-500">
                            Formatos: JPG, PNG, WEBP · Máx: 5 MB
                          </p>

                          <input
                            className="sr-only"
                            {...inputProps}
                            onChange={(e) => {
                              inputProps.onChange(e);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {(errorImg || error) && (
                      <p className="mt-2 text-red-600 text-sm">
                        {errorImg || error}
                      </p>
                    )}
                  </div>

                  {/* Nombre */}
                  <div className="md:col-span-2">
                    <label htmlFor="nombre" className="text-azul-950 font-medium">
                      Nombre*
                    </label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      placeholder="Cancha Central"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full focus:ring-2 focus:ring-verde-600 focus:border-0"
                    />
                  </div>

                  {/* Ubicación */}
                  <div className="md:col-span-2">
                    <label htmlFor="ubicacion" className="text-azul-950 font-medium">
                      Ubicación*
                    </label>
                    <input
                      id="ubicacion"
                      name="ubicacion"
                      type="text"
                      placeholder="Planta baja"
                      value={formData.ubicacion}
                      onChange={handleChange}
                      required
                      className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full focus:ring-2 focus:ring-verde-600 focus:border-0"
                    />
                  </div>

                  {/* Capacidad */}
                  <div>
                    <label htmlFor="capacidad" className="text-azul-950 font-medium">
                      Capacidad*
                    </label>
                    <input
                      id="capacidad"
                      name="capacidad"
                      type="number"
                      min="1"
                      value={formData.capacidad}
                      onChange={handleChange}
                      required
                      className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full focus:ring-2 focus:ring-verde-600 focus:border-0"
                    />
                  </div>

                  {/* Monto por hora */}
                  <div>
                    <label htmlFor="monto_por_hora" className="text-azul-950 font-medium">
                      Monto por hora (Bs)*
                    </label>
                    <input
                      id="monto_por_hora"
                      name="monto_por_hora"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.monto_por_hora}
                      onChange={handleChange}
                      required
                      className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full focus:ring-2 focus:ring-verde-600 focus:border-0"
                    />
                  </div>

                  {/* Estado */}
                  <div>
                    <label htmlFor="estado" className="text-azul-950 font-medium">
                      Estado*
                    </label>
                    <select
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      required
                      className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white focus:ring-2 focus:ring-verde-600 focus:border-0"
                    >
                      <option value="">Seleccione...</option>
                      {estados.map((e, i) => (
                        <option key={i} value={e}>
                          {e}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Disciplinas */}
                  <div>
                    <label htmlFor="disciplinas" className="text-azul-950 font-medium">
                      Disciplinas
                    </label>
                    <select
                      id="disciplinas"
                      name="disciplinas"
                      multiple
                      value={formData.disciplinas}
                      onChange={handleDisciplinaChange}
                      className="h-28 border border-gray-300 mt-1 rounded-md px-3 w-full bg-white focus:ring-2 focus:ring-verde-600 focus:border-0"
                    >
                      {todasDisciplinas.map((d) => (
                        <option key={d.id_disciplina} value={d.id_disciplina}>
                          {d.nombre}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Puedes seleccionar una o varias disciplinas manteniendo presionada la tecla{" "}
                      <span className="font-semibold">Ctrl</span> (Windows) o{" "}
                      <span className="font-semibold">⌘ Cmd</span> (Mac).
                    </p>
                  </div>

                  {/* Botón submit */}
                  <div className="md:col-span-2 flex items-end justify-end">
                    <button
                      type="submit"
                      disabled={enviando}
                      className="w-full md:w-auto bg-verde-600 hover:bg-verde-700 disabled:opacity-60 text-white font-semibold py-2 px-5 rounded-md transition flex items-center gap-2"
                    >
                      {enviando ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Guardando…
                        </>
                      ) : (
                        "Registrar cancha"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </Sidebar>
  );
}

export default CanchaFormCreate;
