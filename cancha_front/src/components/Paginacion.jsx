import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";

/**
 * Componente de paginación reutilizable.
 * Soporta dos modos:
 * 1) totalRegistros !== null -> calcula total de páginas.
 * 2) totalRegistros === null -> usa hasMore (paginación tipo cursor).
 */
export default function Paginacion({
  limite,
  desplazamiento,
  onCambiarDesplazamiento,
  onCambiarLimite,
  totalRegistros = null, // si es null, se usa hasMore
  hasMore = false,
  opcionesLimite = [5, 10, 20, 50],
  mostrarSelectorLimite = true,
  clase = "",
}) {
  // --- Cálculos comunes ---
  const paginaActual =
    totalRegistros === null ? Math.floor(desplazamiento / limite) + 1
                            : Math.min(Math.floor(desplazamiento / limite) + 1,
                                      Math.max(1, Math.ceil(totalRegistros / limite)));

  const totalPaginas =
    totalRegistros === null ? null : Math.max(1, Math.ceil(totalRegistros / limite));

  const deshabilitadoPrev = desplazamiento === 0;
  const deshabilitadoNext =
    totalRegistros === null ? !hasMore : paginaActual >= totalPaginas;

  function irPrimera() {
    if (desplazamiento === 0) return;
    onCambiarDesplazamiento(0);
  }
  function irAnterior() {
    if (deshabilitadoPrev) return;
    onCambiarDesplazamiento(Math.max(0, desplazamiento - limite));
  }
  function irSiguiente() {
    if (deshabilitadoNext) return;
    onCambiarDesplazamiento(desplazamiento + limite);
  }
  function irUltima() {
    if (totalRegistros === null || totalPaginas === null) return;
    const nuevoOffset = (totalPaginas - 1) * limite;
    if (nuevoOffset !== desplazamiento) onCambiarDesplazamiento(nuevoOffset);
  }

  // páginas vecinas (solo si conocemos total)
  const paginasVecinas = (() => {
    if (totalPaginas === null) return [];
    const windowSize = 5;
    const mitad = Math.floor(windowSize / 2);
    let inicio = Math.max(1, paginaActual - mitad);
    let fin = Math.min(totalPaginas, inicio + windowSize - 1);
    if (fin - inicio + 1 < windowSize) {
      inicio = Math.max(1, fin - windowSize + 1);
    }
    return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
  })();

  const desde = totalRegistros === null
    ? desplazamiento + 1
    : totalRegistros === 0 ? 0 : desplazamiento + 1;

  const hasta = totalRegistros === null
    ? desplazamiento + limite
    : Math.min(desplazamiento + limite, totalRegistros);

  return (
    <div className={`mt-6 flex flex-col sm:flex-row items-center sm:justify-between gap-3 ${clase}`}>
      {/* Info */}
      <span className="text-xs sm:text-sm text-azul-950">
        Mostrando {desde}–{hasta}
        {totalRegistros !== null ? ` de ${totalRegistros}` : ""}
      </span>

      {/* Controles */}
      <div className="flex items-center gap-2">
        {mostrarSelectorLimite && (
          <select
            value={limite}
            onChange={(e) => onCambiarLimite(Number(e.target.value))}
            className="px-2 py-2 rounded-md border border-gray-300 bg-white text-azul-950 text-sm"
          >
            {opcionesLimite.map((n) => (
              <option key={n} value={n}>{n} / pág</option>
            ))}
          </select>
        )}

        {/* Primera / Anterior */}
        <button
          onClick={irPrimera}
          disabled={deshabilitadoPrev || totalRegistros === null}
          className="px-3 py-2 rounded-md bg-gray-300 hover:bg-gray-400 disabled:opacity-50 hidden"
          title="Primera"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={irAnterior}
          disabled={deshabilitadoPrev}
          className="px-3 py-2 rounded-md bg-azul-950 hover:bg-azul-900 disabled:opacity-50"
          title="Anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Números de página (solo si conocemos total) */}
        {totalPaginas === null ? (
          <span className="px-3 py-2 text-sm text-azul-950 flex items-center">
            Página {paginaActual}
            <MoreHorizontal className="w-4 h-4 ml-1" />
          </span>
        ) : (
          <div className="flex items-center gap-1">
            {paginasVecinas[0] > 1 && (
              <>
                <BotonPagina
                  activo={paginaActual === 1}
                  onClick={() => onCambiarDesplazamiento(0)}
                >
                  1
                </BotonPagina>
                {paginasVecinas[0] > 2 && (
                  <span className="px-2 text-azul-950 text-sm">…</span>
                )}
              </>
            )}
            {paginasVecinas.map((p) => (
              <BotonPagina
                key={p}
                activo={p === paginaActual}
                onClick={() => onCambiarDesplazamiento((p - 1) * limite)}
              >
                {p}
              </BotonPagina>
            ))}
            {paginasVecinas.at(-1) < totalPaginas && (
              <>
                {paginasVecinas.at(-1) < totalPaginas - 1 && (
                  <span className="px-2 text-azul-950 text-sm">…</span>
                )}
                <BotonPagina
                  activo={paginaActual === totalPaginas}
                  onClick={() => onCambiarDesplazamiento((totalPaginas - 1) * limite)}
                >
                  {totalPaginas}
                </BotonPagina>
              </>
            )}
          </div>
        )}

        {/* Siguiente / Última */}
        <button
          onClick={irSiguiente}
          disabled={deshabilitadoNext}
          className="px-3 py-2 rounded-md bg-azul-950 hover:bg-azul-900 disabled:opacity-50"
          title="Siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={irUltima}
          disabled={totalRegistros === null || deshabilitadoNext}
          className="px-3 py-2 rounded-md bg-gray-300 hover:bg-gray-400 disabled:opacity-50 hidden"
          title="Última"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function BotonPagina({ activo, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm ${
        activo
          ? "bg-azul-850 text-white"
          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
      }`}
    >
      {children}
    </button>
  );
}
