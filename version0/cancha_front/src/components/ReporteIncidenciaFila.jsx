/* eslint-disable no-unused-vars */
import { Link } from "react-router-dom";
import { Pencil, Trash2, Loader2, Eye, User, ChevronRight  } from "lucide-react";

export default function ReporteIncidenciaFila({
  reporte,
  onEliminar, // (reporte) => void
  eliminando = false,
  mostrarAcciones = true,
}) {
  const {
    id_reporte,
    detalle,
    sugerencia,
    id_encargado,
    id_reserva,
    // necesarios para los links:
    id_cliente,
    id_cancha,
    // mostrables:
    nombre_cliente,   // ← usuario del cliente
    nombre_cancha,    // ← nombre de la cancha
    nombre_encargado,
  } = reporte || {};

  const detalleMostrar = detalle?.trim() || "—";
  const sugerenciaMostrar = sugerencia?.trim() || "—";
  const clienteMostrar = nombre_cliente?.trim() || "—";
  const canchaMostrar = nombre_cancha?.trim() || "—";
  const encargadoMostrar = (nombre_encargado ?? "").trim() || `Encargado #${id_encargado ?? "—"}`;

  return (
    <tr>
      {/* Encargado (link) */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        {id_encargado ? (
          <Link
            to={`/encargado/${id_encargado}`}
            className="inline-flex items-center gap-2 text-azul-900 hover:underline"
            title="Ver detalle del encargado"
          >
            <User className="w-4 h-4" />
            {encargadoMostrar}
          </Link>
        ) : (
          <span className="text-gray-500">—</span>
        )}
      </td>

      {/* Reserva (link) */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        {id_reserva ? (
          <Link
            to={`/reserva/${id_reserva}`}
            className="inline-flex items-center gap-2 text-azul-900 hover:underline"
            title="Ver detalle de la reserva"
          >
            <span>Ver</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="text-gray-500">—</span>
        )}
      </td>

      {/* Detalle */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-azul-950 line-clamp-2">{detalleMostrar}</p>
      </td>

      {/* Sugerencia */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-azul-950 line-clamp-2">{sugerenciaMostrar}</p>
      </td>

      {/* Detalles → Ver más (reporte-incidencia/:id) */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
        <Link
          to={`/reporte-incidencia/${id_reporte}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-azul-900 text-white rounded-md hover:opacity-90"
          title="Ver detalles del reporte"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Ver más</span>
        </Link>
      </td>

      {/* Acciones (opcional) */}
      {mostrarAcciones && (
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
          <div className="flex items-center gap-2">
            <Link
              to={`/reporte-incidencia/edit/${id_reporte}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-verde-600 text-white border rounded-md"
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">Editar</span>
            </Link>

            <button
              type="button"
              onClick={() => onEliminar?.(reporte)}
              disabled={eliminando}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md ${eliminando
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
