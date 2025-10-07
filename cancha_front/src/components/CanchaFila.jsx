import { Link } from "react-router-dom";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getDisciplinasPorCancha } from "../services/canchaService";

const API_BASE = "http://localhost:3000";

export default function CanchaFila({ cancha, mostrarAcciones, onEliminar, eliminando }) {
  const token = localStorage.getItem("token");
  const [disciplinas, setDisciplinas] = useState([]);
  const [cargandoDisciplinas, setCargandoDisciplinas] = useState(true);

  useEffect(() => {
    async function fetchDisciplinas() {
      try {
        const res = await getDisciplinasPorCancha(cancha.id_cancha, token);
        const lista = Array.isArray(res?.data)
          ? res.data.map((d) =>
            typeof d === "string" ? { nombre: d } : d
          )
          : [];
        setDisciplinas(lista);
      } catch (err) {
        console.error(
          `Error al obtener disciplinas de cancha ${cancha.id_cancha}:`,
          err.message
        );
        setDisciplinas([]);
      } finally {
        setCargandoDisciplinas(false);
      }
    }
    if (cancha?.id_cancha) fetchDisciplinas();
  }, [cancha?.id_cancha, token]);

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition">
      {/* Imagen */}
      <td className="px-5 py-3">
        {cancha.imagen_cancha ? (
          <img
            src={`${API_BASE}${cancha.imagen_cancha}`}
            alt={cancha.nombre}
            className="w-14 h-14 object-cover rounded-lg border border-gray-200"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
            Sin imagen
          </div>
        )}
      </td>

      {/* Nombre */}
      <td className="px-5 py-3 text-sm font-semibold text-azul-950">{cancha.nombre}</td>

      {/* Ubicación */}
      <td className="px-5 py-3 text-sm text-gray-700">{cancha.ubicacion || "—"}</td>

      {/* Capacidad */}
      <td className="px-5 py-3 text-sm text-gray-700">{cancha.capacidad || "—"}</td>

      {/* Monto por hora */}
      <td className="px-5 py-3 text-sm text-gray-700">
        {cancha.monto_por_hora ? `${cancha.monto_por_hora} Bs` : "—"}
      </td>

      {/* Estado */}
      <td className="px-5 py-3 text-sm">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${cancha.estado?.toLowerCase() === "disponible"
              ? "bg-green-100 text-green-700"
              : cancha.estado?.toLowerCase() === "mantenimiento"
                ? "bg-blue-100 text-blue-700"
                : "bg-red-100 text-red-700"
            }`}
        >
          {cancha.estado || "—"}
        </span>
      </td>

      {/* Disciplinas */}
      <td className="px-5 py-4 text-sm">
        {cargandoDisciplinas ? (
          <div className="flex items-center text-gray-400 text-xs">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Cargando...
          </div>
        ) : disciplinas.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-w-[220px]">
            {disciplinas.map((d, i) => (
              <span
                key={`${cancha.id_cancha}-${d.nombre || i}`}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <span className="truncate">{d.nombre}</span>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400 text-xs italic">—</span>
        )}
      </td>


      {/* Acciones */}
      {mostrarAcciones && (
        <td className="px-5 py-3 text-sm text-right">
          <div className="flex items-center gap-2">
            <Link
              to={``}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-verde-600 text-white border rounded-md"
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline"></span>
            </Link>

            <button
              type="button"
              onClick={() => onEliminar?.(cancha.id_cancha)}
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
                  <span className="hidden sm:inline"></span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline"></span>
                </>
              )}
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}
