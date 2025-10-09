/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Plus, ArrowLeft } from "lucide-react";
import { listarAdminsUnicos, crearEspacio } from "../services/espacioService";
import { listarCanchas, eliminarCancha } from "../services/canchaService";
import CanchasLista from "./CanchasLista";
import Alerta from "./Alerta";
import useImagePreview from "../hooks/useImagePreview";

const API_BASE = "http://localhost:3000";

function EspacioFormCreate({ token }) {
    const [formData, setFormData] = useState({
        nombre: "",
        direccion: "",
        descripcion: "",
        latitud: "",
        longitud: "",
        horario_apertura: "",
        horario_cierre: "",
        id_admin_esp_dep: "",
    });

    const [admins, setAdmins] = useState([]);
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [espacioCreado, setEspacioCreado] = useState(null);
    const [mostrarCanchas, setMostrarCanchas] = useState(false);
    const [canchas, setCanchas] = useState([]);
    const navigate = useNavigate();

    // Modal y estados para eliminar cancha
    const [alerta, setAlerta] = useState({ open: false, idObjetivo: null });
    const [eliminandoId, setEliminandoId] = useState(null);

    // === Hooks para imágenes ===
    const imgPrincipal = useImagePreview({
        allowed: ["image/jpeg", "image/png", "image/webp"],
        maxMB: 3,
        inputId: "imagen_principal",
    });
    const imgSec1 = useImagePreview({ allowed: ["image/jpeg", "image/png", "image/webp"], maxMB: 3, inputId: "imagen_sec_1" });
    const imgSec2 = useImagePreview({ allowed: ["image/jpeg", "image/png", "image/webp"], maxMB: 3, inputId: "imagen_sec_2" });
    const imgSec3 = useImagePreview({ allowed: ["image/jpeg", "image/png", "image/webp"], maxMB: 3, inputId: "imagen_sec_3" });
    const imgSec4 = useImagePreview({ allowed: ["image/jpeg", "image/png", "image/webp"], maxMB: 3, inputId: "imagen_sec_4" });

    const imagenes = {
        imagen_principal: imgPrincipal,
        imagen_sec_1: imgSec1,
        imagen_sec_2: imgSec2,
        imagen_sec_3: imgSec3,
        imagen_sec_4: imgSec4,
    };

    // === Cargar administradores ===
    useEffect(() => {
        async function fetchAdmins() {
            try {
                const res = await listarAdminsUnicos(token);
                setAdmins(res.data || []);
            } catch {
                setError("No se pudieron cargar los administradores.");
            }
        }
        fetchAdmins();
    }, [token]);

    // === Manejar cambios de formulario ===
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((s) => ({ ...s, [name]: value }));
    };

    // === Crear espacio ===
    const handleSubmit = async (e, mostrarCanchasDespues = false) => {
        e.preventDefault();
        if (enviando) return;

        setError("");
        setEnviando(true);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([k, v]) => {
                if (v !== null && v !== undefined) data.append(k, v);
            });

            // Agregar imágenes
            Object.entries(imagenes).forEach(([key, obj]) => {
                if (obj.file) data.append(key, obj.file);
            });

            const res = await crearEspacio(data, token);
            const nuevoEspacio = res.data || res;
            setEspacioCreado(nuevoEspacio);

            // Si se elige guardar y añadir canchas
            if (mostrarCanchasDespues) {
                const resCanchas = await listarCanchas(token);
                const filtradas = (resCanchas.data || []).filter(
                    (c) => c.id_espacio === nuevoEspacio.id_espacio
                );
                setCanchas(filtradas);
                setMostrarCanchas(true);
            } else {
                // Si solo guarda
                window.location.href = "/espacios";
            }
        } catch (err) {
            setError(err.message || "Error al crear el espacio.");
        } finally {
            setEnviando(false);
        }
    };

    // === Mostrar mapa ===
    const handleVerEnMapa = () => {
        const lat = formData.latitud || -16.5;
        const lng = formData.longitud || -68.1;
        const iframe = document.getElementById("mapPreview");
        if (iframe) {
            iframe.src = `https://www.google.com/maps?q=${lat},${lng}&hl=es&z=15&output=embed`;
        }
    };

    // === Eliminar cancha ===
    const solicitarEliminacion = (idCancha) => {
        setAlerta({ open: true, idObjetivo: idCancha });
    };

    const confirmarEliminacion = async () => {
        const id = alerta.idObjetivo;
        if (!id) return;

        try {
            setEliminandoId(id);
            await eliminarCancha(id, token);
            setCanchas((prev) => prev.filter((c) => c.id_cancha !== id));
            setAlerta({ open: false, idObjetivo: null });
        } catch (err) {
            alert("No se pudo eliminar la cancha: " + err.message);
        } finally {
            setEliminandoId(null);
        }
    };

    // === UI ===
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
                        Registrar nuevo Espacio Deportivo
                    </h1>
                </div>
            </div>

            <form onSubmit={(e) => handleSubmit(e, false)}>
                <div className="bg-white rounded-md-xl shadow-lg p-4 px-4 md:p-8">
                    <div className="mb-6">
                        <h2 className="font-medium text-xl text-verde-600">Información General</h2>
                        <p className="font-light text-verde-600">Actualiza los datos y guarda los cambios.</p>
                    </div>
                    <div className="grid gap-4 text-sm grid-cols-1 lg:grid-cols-2">
                        <div className="lg:col-span-2">
                            <div className="grid gap-4 gap-y-4 text-sm grid-cols-1 md:grid-cols-2">
                                <div>
                                    <label className="text-azul-950 font-medium">
                                        Nombre del espacio*
                                    </label>
                                    <input
                                        name="nombre"
                                        type="text"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                        placeholder="Polideportivo Miraflores"
                                        className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 
                    focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                                    />
                                </div>

                                <div>
                                    <label className="text-azul-950 font-medium">Dirección</label>
                                    <input
                                        name="direccion"
                                        type="text"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        placeholder="Av. Busch #123"
                                        className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 
                    focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-azul-950 font-medium">
                                        Descripción
                                    </label>
                                    <textarea
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        placeholder="Instalación moderna con canchas múltiples..."
                                        className="border border-gray-300 mt-1 rounded-md px-4 py-2 w-full focus:ring-2 focus:ring-verde-600"
                                    />
                                </div>

                                {/* === Coordenadas + mapa === */}
                                <div className="md:col-span-2 mt-6">
                                    <label className="text-azul-950 font-medium">
                                        Ubicación del espacio
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Introduce las coordenadas o copia desde Google Maps.
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                                        <div>
                                            <label className="text-azul-950 font-medium">
                                                Latitud
                                            </label>
                                            <input
                                                name="latitud"
                                                value={formData.latitud}
                                                onChange={handleChange}
                                                placeholder="-16.5000"
                                                className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full focus:ring-2 focus:ring-verde-600"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-azul-950 font-medium">
                                                Longitud
                                            </label>
                                            <input
                                                name="longitud"
                                                value={formData.longitud}
                                                onChange={handleChange}
                                                placeholder="-68.1193"
                                                className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full focus:ring-2 focus:ring-verde-600"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleVerEnMapa}
                                            className="h-10 bg-verde-600 hover:bg-verde-700 text-white font-medium rounded-md transition"
                                        >
                                            Ver en mapa
                                        </button>
                                    </div>

                                    <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
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

                                <div>
                                    <label className="text-azul-950 font-medium">
                                        Horario apertura*
                                    </label>
                                    <input
                                        required
                                        type="time"
                                        name="horario_apertura"
                                        value={formData.horario_apertura}
                                        onChange={handleChange}
                                        className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full focus:ring-2 focus:ring-verde-600"
                                    />
                                </div>

                                <div>
                                    <label className="text-azul-950 font-medium">
                                        Horario cierre*
                                    </label>
                                    <input
                                        required
                                        type="time"
                                        name="horario_cierre"
                                        value={formData.horario_cierre}
                                        onChange={handleChange}
                                        className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full focus:ring-2 focus:ring-verde-600"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-azul-950 font-medium">
                                        Administrador Deportivo*
                                    </label>
                                    <select
                                        required
                                        name="id_admin_esp_dep"
                                        value={formData.id_admin_esp_dep}
                                        onChange={handleChange}
                                        className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white focus:ring-2 focus:ring-verde-600"
                                    >
                                        <option value="">Seleccione un administrador</option>
                                        {admins.map((a) => (
                                            <option key={a.id} value={a.id}>
                                                {a.nombre_completo || `ID ${a.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* === Galería de imágenes === */}
                                <div className="md:col-span-2 mt-6">
                                    <h3 className="text-lg font-semibold text-azul-950 mb-3">
                                        Galería de imágenes
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(imagenes).map(([key, obj], idx) => {
                                            const label =
                                                idx === 0 ? "Imagen Principal" : `Imagen Secundaria ${idx}`;
                                            return (
                                                <div
                                                    key={key}
                                                    className="border border-gray-200 rounded-lg bg-white p-3 shadow-sm hover:shadow-md transition"
                                                >
                                                    <label
                                                        htmlFor={key}
                                                        className="text-azul-950 font-medium text-sm"
                                                    >
                                                        {label}
                                                    </label>

                                                    <div
                                                        {...obj.dropzoneProps}
                                                        className="mt-2 border border-dashed border-gray-300 rounded-md p-3 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                                                                {obj.previewUrl ? (
                                                                    <img
                                                                        src={obj.previewUrl}
                                                                        alt="Previsualización"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className="text-xs text-gray-400 text-center px-2">
                                                                        Sin imagen
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex-1">
                                                                <label
                                                                    htmlFor={key}
                                                                    className="cursor-pointer bg-verde-600 text-white hover:bg-green-700 text-xs font-medium px-3 py-1.5 rounded-md"
                                                                >
                                                                    Seleccionar
                                                                </label>
                                                                {obj.previewUrl && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={obj.clear}
                                                                        className="ml-2 bg-white hover:bg-gray-50 text-gray-800 text-xs font-medium px-3 py-1.5 rounded-md border"
                                                                    >
                                                                        Quitar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {obj.imgError && (
                                                        <p className="mt-1 text-red-600 text-xs">
                                                            {obj.imgError}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-4 text-sm grid-cols-1 md:grid-cols-2">
                                {/* === Campos del formulario === */}                        
                                {/* === Botones de acción === */}
                                <div className="md:col-span-2 flex flex-wrap justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={(e) => handleSubmit(e, false)}
                                        disabled={enviando}
                                        className="bg-verde-600 hover:bg-verde-700 text-white font-semibold py-2 px-5 rounded-md transition disabled:opacity-60"
                                    >
                                        Guardar espacio
                                    </button>

                                    <button
                                        type="button"
                                        onClick={(e) => handleSubmit(e, true)}
                                        disabled={enviando}
                                        className="bg-azul-950 hover:bg-azul-900 text-white font-semibold py-2 px-5 rounded-md transition disabled:opacity-60"
                                    >
                                        Guardar y añadir canchas
                                    </button>
                                </div>
                                {/* === Bloque de canchas === */}
                                {mostrarCanchas && espacioCreado && (
                                    <div className="md:col-span-2 mt-8">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-lg font-semibold text-azul-950">
                                                Añadir canchas al nuevo espacio
                                            </h3>
                                            <Link
                                                to={`/cancha/create?espacio=${espacioCreado.id_espacio}`}
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
                                            onEliminar={solicitarEliminacion}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* === Modal confirmación === */}
            <Alerta
                open={alerta.open}
                variant="confirm"
                title="¿Eliminar cancha?"
                message="Esta acción eliminará permanentemente la cancha seleccionada."
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

export default EspacioFormCreate;
