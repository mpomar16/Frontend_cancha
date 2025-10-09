/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Volleyball, ArrowLeft } from "lucide-react";
import useImagePreview from "../hooks/useImagePreview";
import {
    listarEstadoCanchaEnum,
    listarDisciplinas,
} from "../services/canchaService";
import Sidebar from "./Sidebar";

const API_BASE = "http://localhost:3000";

const buildImageUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    const rel = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE}${rel}`;
};

function CanchaFormEdit({ initialData = {}, onSubmit, token }) {
    const navigate = useNavigate();

    // --- Estados principales ---
    const [formData, setFormData] = useState({
        nombre: "",
        ubicacion: "",
        capacidad: "",
        monto_por_hora: "",
        estado: "",
        disciplinas: [],
        id_espacio: "",
    });

    const [estados, setEstados] = useState([]);
    const [todasDisciplinas, setTodasDisciplinas] = useState([]);
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);

    // --- Imagen inicial ---
    const initialImgUrl = buildImageUrl(initialData?.imagen_cancha);

    const {
        file: imagenFile,
        previewUrl,
        error: imgError,
        inputProps,
        dropzoneProps,
        clear: clearImage,
        setPreviewUrl,
    } = useImagePreview({
        initialUrl: initialImgUrl,
        allowed: ["image/jpeg", "image/png", "image/webp"],
        maxMB: 5,
    });

    // --- Sincronizar datos iniciales ---
useEffect(() => {
  if (initialData && Object.keys(initialData).length > 0) {
    console.log("📦 Datos iniciales recibidos en form:", initialData);

    setFormData({
      nombre: initialData.nombre || "",
      ubicacion: initialData.ubicacion || "",
      capacidad: initialData.capacidad || "",
      monto_por_hora: initialData.monto_por_hora || "",
      estado: initialData.estado || "",
      disciplinas:
        Array.isArray(initialData.disciplinas)
          ? initialData.disciplinas
              .filter((d) => d?.id_disciplina) // ✅ solo válidos
              .map((d) => String(d.id_disciplina))
          : [],
      id_espacio: initialData.id_espacio || "",
    });
  }
}, [initialData]);



    // --- Cargar enums (estados + disciplinas) ---
    useEffect(() => {
        async function cargarOpciones() {
            if (!token) {
                console.warn("⚠️ Token aún no disponible, esperando...");
                return;
            }
            try {
                console.log("🔑 Token recibido en CanchaFormEdit:", token);

                const [respEstados, respDisc] = await Promise.all([
                    listarEstadoCanchaEnum(token),
                    listarDisciplinas(token),
                ]);

                console.log("✅ Estados:", respEstados.data);
                console.log("✅ Disciplinas:", respDisc.data);

                setEstados(respEstados.data || []);
                setTodasDisciplinas(respDisc.data || []);
            } catch (err) {
                console.error("❌ Error al cargar opciones:", err.message);
            }
        }

        // Ejecutar solo si el token está disponible
        if (token) cargarOpciones();
    }, [token]);


    // --- Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((s) => ({ ...s, [name]: value }));
    };

    const handleDisciplinaChange = (e) => {
        const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
        setFormData((s) => ({ ...s, disciplinas: values }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (enviando) return;

        setError("");
        setEnviando(true);

        const data = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
            if (Array.isArray(v)) data.append(k, JSON.stringify(v));
            else if (v !== null && v !== undefined) data.append(k, v);
        });

        if (imagenFile) data.append("imagen_cancha", imagenFile);

        try {
            await onSubmit(data);
            navigate(-1);
        } catch (err) {
            console.error("❌ Error al guardar los cambios:", err);
            setError(err.message || "Error al guardar los cambios.");
        } finally {
            setEnviando(false);
        }
    };
    console.log(formData);
    // --- UI ---
    return (
        <Sidebar>
            <main className="flex-1 p-6 sm:p-8 space-y-8">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            type="button"
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
                        >
                            <ArrowLeft size={16} /> Volver
                        </button>
                        <h1 className="flex items-center text-2xl font-poppins font-bold text-azul-950">
                            <Volleyball className="mr-3" />
                            Editar Cancha Deportiva
                        </h1>
                    </div>
                </header>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="min-h-[0]">
                    <div className="bg-white rounded-md-xl shadow-lg p-4 px-4 md:p-8">
                        <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-2">
                            {/* Columna izquierda */}
                            <div className="text-verde-600 mb-4">
                                <p className="font-medium text-lg">Datos de la cancha</p>
                                <p>Modifica los campos necesarios.</p>
                            </div>

                            {/* Columna derecha */}
                            <div className="lg:col-span-2">
                                <div className="grid gap-4 gap-y-4 text-sm grid-cols-1 md:grid-cols-2">
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
                                            className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full focus:ring-2 focus:ring-verde-600"
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
                                            className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full focus:ring-2 focus:ring-verde-600"
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
                                            className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full focus:ring-2 focus:ring-verde-600"
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
                                            className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full focus:ring-2 focus:ring-verde-600"
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
                                            className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white focus:ring-2 focus:ring-verde-600"
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
                                    <div className="md:col-span-1">
                                        <label htmlFor="disciplinas" className="text-azul-950 font-medium block mb-1">
                                            Disciplinas asignadas
                                        </label>

                                        {/* Chips de las disciplinas actuales */}
                                        {formData.disciplinas.length > 0 ? (
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {todasDisciplinas
                                                    .filter((d) => formData.disciplinas.includes(String(d.id_disciplina)))
                                                    .map((d) => (
                                                        <span
                                                            key={d.id_disciplina}
                                                            className="inline-flex items-center gap-1 bg-verde-600/20 text-verde-800 border border-verde-300 text-xs font-medium px-2 py-0.5 rounded-full"
                                                        >
                                                            <span className="truncate max-w-[80px]">{d.nombre}</span>
                                                        </span>
                                                    ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 text-sm mt-1 italic">
                                                No hay disciplinas asignadas a esta cancha.
                                            </p>
                                        )}

                                        {/* Select múltiple para modificar */}
                                        <label
                                            htmlFor="disciplinas"
                                            className="text-azul-950 font-medium block mt-4"
                                        >
                                            Añadir o quitar disciplinas
                                        </label>
                                        <select
                                            id="disciplinas"
                                            name="disciplinas"
                                            multiple
                                            value={formData.disciplinas.map(String)}
                                            onChange={(e) => {
                                                const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
                                                setFormData((s) => ({ ...s, disciplinas: values }));
                                            }}
                                            className="h-28 border border-gray-300 mt-1 rounded-md px-3 w-full bg-white focus:ring-2 focus:ring-verde-600 text-gray-800 text-sm"
                                        >
                                            {todasDisciplinas.map((d) => (
                                                <option
                                                    key={d.id_disciplina}
                                                    value={String(d.id_disciplina)}
                                                    className={`transition ${formData.disciplinas.includes(String(d.id_disciplina))
                                                            ? "bg-verde-600/20 text-verde-900 font-semibold"
                                                            : "hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {d.nombre}
                                                </option>
                                            ))}
                                        </select>

                                        <p className="text-xs text-gray-500 mt-1">
                                            Usa <strong>Ctrl</strong> o <strong>⌘ Cmd</strong> para seleccionar varias.
                                        </p>
                                    </div>





                                    {/* Imagen */}
                                    <div className="md:col-span-2">
                                        <label htmlFor="imagen_cancha" className="text-azul-950 font-medium">
                                            Imagen de la Cancha
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
                                                    <p className="text-sm text-gray-700">Arrastra una imagen aquí o</p>
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

                                        {(imgError || error) && (
                                            <p className="mt-2 text-red-600 text-sm">{imgError || error}</p>
                                        )}
                                    </div>

                                    {/* Botón guardar */}
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
                                                "Guardar cambios"
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

export default CanchaFormEdit;
