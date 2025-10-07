// components/DisciplinaFila.jsx
import { Link } from "react-router-dom";
import { useState } from "react";
import { Info, Pencil, Trash2, Loader2, Eye } from "lucide-react";

export default function DisciplinaFila({
  disciplina,
  onEliminar,               // (disciplina) => void
  eliminando = false,        // bool para mostrar loader al eliminar
  mostrarAcciones = true,    // puedes ocultarla si no hay permisos
}) {
  const { id_disciplina, nombre, descripcion } = disciplina || {};
  const nombreMostrar = nombre || "—";
  const descripcionMostrar = descripcion || "—";

  const [expandida, setExpandida] = useState(false);
  const esLarga =
    descripcionMostrar && descripcionMostrar !== "—" && descripcionMostrar.length > 120;

  return (
    <tr>
      {/* Nombre */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-azul-950">
        <Link
          className="font-medium cursor-default"
          title="Ver detalle"
        >
          {nombreMostrar}
        </Link>
      </td>

      {/* Descripción con toggle */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm max-w-[360px] cursor-default">
        <div className="text-azul-950">
          <p
            className={expandida ? "" : "line-clamp-2"}
            title={expandida ? undefined : descripcionMostrar}
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

      {/* Acciones */}
      {mostrarAcciones && (
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
          <div className="flex items-center gap-2">
            {/* Botón Editar */}
            <Link
              to={`/disciplina/edit/${id_disciplina}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-verde-600 text-white border rounded-md"
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">Editar</span>
            </Link>

            {/* Botón Eliminar */}
            <button
              type="button"
              onClick={() => onEliminar?.(disciplina)}
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
