/* eslint-disable no-unused-vars */
import { Link } from "react-router-dom";
import { Pencil, Trash2, Loader2, Eye } from "lucide-react";
import placeholder from "../assets/placeholder.jpeg";

const API_BASE = "http://localhost:3000";

function formatFechaDDMMYYYY(fecha) {
  if (!fecha) return "—";
  // Soporta "YYYY-MM-DD" o ISO
  try {
    let d;
    if (/^\d{4}-\d{2}-\d{2}/.test(fecha)) {
      const [y, m, day] = fecha.split("T")[0].split("-");
      d = new Date(Number(y), Number(m) - 1, Number(day));
    } else {
      d = new Date(fecha);
    }
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function normalizeHora(h) {
  if (!h) return null;
  // Acepta "HH:mm" o "HH:mm:ss"
  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(h);
  if (!match) return null;
  return `${match[1]}:${match[2]}`;
}

export default function EncargadoFila({
  encargado,
  onEliminar, // (encargado) => void
  eliminando = false,
  mostrarAcciones = true,
}) {
  const {
    id_encargado,
    nombre,
    apellido,
    responsabilidad,
    fecha_inicio,
    hora_ingreso,
    hora_salida,
    imagen_perfil,
  } = encargado || {};

  const nombreCompleto = `${nombre ?? ""} ${apellido ?? ""}`.trim() || "—";
  const srcImg = imagen_perfil ? `${API_BASE}${imagen_perfil}` : placeholder;

  const fechaMostrar = formatFechaDDMMYYYY(fecha_inicio);

  const hi = normalizeHora(hora_ingreso);
  const hs = normalizeHora(hora_salida);
  const horarioMostrar = hi && hs ? `${hi}–${hs}` : "—";

  return (
    <tr>
      {/* Imagen_perfil */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-12 h-12">
            <img
              className="w-full h-full rounded-full object-cover bg-gray-100 border border-gray-200"
              src={srcImg}
              alt={nombreCompleto}
              onError={(e) => {
                e.currentTarget.src = placeholder;
              }}
            />
          </div>
        </div>
      </td>

      {/* Nombre Completo */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-azul-950">
        {nombreCompleto}
      </td>

      {/* Responsabilidad */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <span className="line-clamp-2 text-azul-950">
          {responsabilidad || "—"}
        </span>
      </td>

      {/* Fecha de inicio (dd/mm/yyyy) */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm whitespace-nowrap text-azul-950">
        {fechaMostrar}
      </td>

      {/* Horario trabajo (00:00–00:00) */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm whitespace-nowrap text-azul-950">
        {horarioMostrar}
      </td>

      {/* Detalles */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
        <Link
          to={`/encargado/${id_encargado}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-azul-900 text-white rounded-md hover:opacity-90"
          title="Ver detalles y reportes"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Ver</span>
        </Link>
      </td>

      {/* Acciones */}
      {mostrarAcciones && (
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
          <div className="flex items-center gap-2">
            <Link
              to={`/encargado/edit/${id_encargado}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-verde-600 text-white border rounded-md"
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">Editar</span>
            </Link>

            <button
              type="button"
              onClick={() => onEliminar?.(encargado)}
              disabled={eliminando}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md ${
                eliminando
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-rojo-600 text-white hover:opacity-90"
              }`}
              title="Eliminar"
            >
              {eliminando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Eliminando…</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Eliminar</span>
                </>
              )}
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}
