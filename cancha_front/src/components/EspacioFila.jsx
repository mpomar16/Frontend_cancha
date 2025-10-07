// components/EspacioFila.jsx
import { Link } from "react-router-dom";
import { useState } from "react";
import { Clock, UserCog, Info, Pencil, Trash2, Loader2, Eye } from "lucide-react";

export default function EspacioFila({
  espacio,
  onEliminar,               // (espacio) => void
  eliminando = false,        // bool para mostrar loader al eliminar
  mostrarAcciones = true,    // puedes ocultarla si no hay permisos
}) {
  const {
    id_espacio,
    nombre,
    direccion,
    descripcion,
    horario_apertura,
    horario_cierre,
  } = espacio || {};

  const nombreMostrar = nombre || "—";
  const direccionMostrar = direccion || "—";
  const descripcionMostrar = descripcion || "—";
  const horarioMostrar = [horario_apertura, horario_cierre].filter(Boolean).join(" – ") || "—";
  const [expandida, setExpandida] = useState(false);
  const esLarga = (descripcionMostrar && descripcionMostrar !== "—" && descripcionMostrar.length > 120);

  return (
    <tr>
      {/* Nombre */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-azul-950">
        <Link
          to={`/espacio/${id_espacio}`}
          className="font-medium hover:underline hover:text-verde-700"
          title="Ver detalle"
        >
          {nombreMostrar}
        </Link>
      </td>

      {/* Dirección */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <span className="text-azul-950">{direccionMostrar}</span>
      </td>

      {/* Descripción con toggle */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm max-w-[360px] cursor-default">
        <div className="text-azul-950">
          <p
            className={expandida ? "" : "line-clamp-2"}
            title={expandida ? undefined : (descripcionMostrar || "")} // tooltip nativo en colapsado
          >
            {descripcionMostrar}
          </p>

          {esLarga && (
            <button
              type="button"
              onClick={() => setExpandida((v) => !v)}
              className="mt-1 text-xs font-medium text-verde-700 hover:underline"
            >
              {expandida ? "Ver menos" : "Ver más"}
            </button>
          )}
        </div>
      </td>


      {/* Horario */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <div className="inline-flex items-center gap-2 text-azul-950">
          <Clock className="w-4 h-4" />
          <span className="whitespace-nowrap">{horarioMostrar}</span>
        </div>
      </td>

      {/* Detalles */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <Link
          to={`/espacio/${id_espacio}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-azul-900 text-white rounded-md hover:opacity-90"
          title="Ver detalles (imágenes y canchas disponibles)"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Ver</span>
        </Link>
      </td>

      {/* Acciones (Editar / Eliminar) */}
      {mostrarAcciones && (
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
          <div className="flex items-center gap-2">
            <Link
              to={`/espacio/edit/${id_espacio}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-verde-600 text-white border rounded-md"
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">Editar</span>
            </Link>

            <button
              type="button"
              onClick={() => onEliminar?.(espacio)}
              disabled={eliminando}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md
                ${eliminando
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
