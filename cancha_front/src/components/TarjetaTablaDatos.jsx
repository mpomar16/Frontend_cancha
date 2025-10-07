// tabla.jsx
import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export default function TablaUsuarios({
  datos = [],
  tamPaginaOpciones = [5, 10, 20],
  tamPaginaInicial = 5,
  mostrarControles = true,
}) {
  const [tamPagina, setTamPagina] = useState(tamPaginaInicial);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("Todos");
  const [termino, setTermino] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  // normaliza texto para búsqueda básica
  const norm = (s) => (s ?? "").toString().toLowerCase().trim();

  const datosFiltrados = useMemo(() => {
    const t = norm(termino);
    return datos
      .filter((u) =>
        estadoSeleccionado === "Todos" ? true : norm(u.estado) === norm(estadoSeleccionado)
      )
      .filter((u) => {
        if (!t) return true;
        return (
          norm(u.nombre).includes(t) ||
          norm(u.rol).includes(t) ||
          norm(u.estado).includes(t) ||
          norm(formatearFecha(u.fechaCreacion)).includes(t)
        );
      });
  }, [datos, estadoSeleccionado, termino]);

  const totalRegistros = datosFiltrados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / tamPagina));
  const paginaSegura = Math.min(paginaActual, totalPaginas);

  const inicio = (paginaSegura - 1) * tamPagina;
  const fin = inicio + tamPagina;
  const paginaDatos = datosFiltrados.slice(inicio, fin);

  function irPaginaAnterior() {
    setPaginaActual((p) => Math.max(1, p - 1));
  }
  function irPaginaSiguiente() {
    setPaginaActual((p) => Math.min(totalPaginas, p + 1));
  }

  function onCambiarTamPagina(nuevoTam) {
    setTamPagina(nuevoTam);
    setPaginaActual(1);
  }

  function onCambiarEstado(estado) {
    setEstadoSeleccionado(estado);
    setPaginaActual(1);
  }

  function onBuscar(valor) {
    setTermino(valor);
    setPaginaActual(1);
  }

  return (
    <div className="antialiased font-sans bg-gray-200 min-h-screen">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="py-8">
          <div>
            <h2 className="text-2xl font-semibold leading-tight">Usuarios</h2>
          </div>

          {/* Controles superiores */}
          {mostrarControles && (
            <div className="my-2 flex sm:flex-row flex-col gap-2">
              <div className="flex flex-row">
                {/* Select tamaño de página */}
                <div className="relative">
                  <select
                    value={tamPagina}
                    onChange={(e) => onCambiarTamPagina(Number(e.target.value))}
                    className="appearance-none h-full rounded-l border block w-full bg-white border-gray-400 text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  >
                    {tamPaginaOpciones.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>

                {/* Select estado */}
                <div className="relative">
                  <select
                    value={estadoSeleccionado}
                    onChange={(e) => onCambiarEstado(e.target.value)}
                    className="appearance-none h-full rounded-r border-t sm:rounded-r-none sm:border-r-0 border-r border-b block w-full bg-white border-gray-400 text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:border-l focus:border-r focus:bg-white focus:border-gray-500"
                  >
                    <option>Todos</option>
                    <option>Activo</option>
                    <option>Inactivo</option>
                    <option>Suspended</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Buscador */}
              <div className="block relative sm:ml-auto w-full sm:max-w-xs">
                <span className="h-full absolute inset-y-0 left-0 flex items-center pl-2">
                  <Search className="h-4 w-4 text-gray-500" />
                </span>
                <input
                  value={termino}
                  onChange={(e) => onBuscar(e.target.value)}
                  placeholder="Buscar"
                  className="appearance-none rounded-r rounded-l sm:rounded-l-none border border-gray-400 border-b block pl-8 pr-6 py-2 w-full bg-white text-sm placeholder-gray-400 text-gray-700 focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
            <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    <Th>Usuario</Th>
                    <Th>Rol</Th>
                    <Th>Creado</Th>
                    <Th>Estado</Th>
                  </tr>
                </thead>
                <tbody>
                  {paginaDatos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-5 bg-white text-sm text-center text-gray-500">
                        No hay resultados
                      </td>
                    </tr>
                  ) : (
                    paginaDatos.map((u) => (
                      <tr key={u.id ?? `${u.nombre}-${u.fechaCreacion}`}>
                        <Td>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              <img
                                className="w-full h-full rounded-full object-cover"
                                src={u.avatarUrl || "https://placehold.co/160x160?text=👤"}
                                alt={u.nombre}
                              />
                            </div>
                            <div className="ml-3">
                              <p className="text-gray-900 whitespace-nowrap">{u.nombre}</p>
                            </div>
                          </div>
                        </Td>
                        <Td>
                          <p className="text-gray-900 whitespace-nowrap">{u.rol}</p>
                        </Td>
                        <Td>
                          <p className="text-gray-900 whitespace-nowrap">
                            {formatearFecha(u.fechaCreacion)}
                          </p>
                        </Td>
                        <Td>
                          <EtiquetaEstado estado={u.estado} />
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pie de tabla */}
              <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
                <span className="text-xs xs:text-sm text-gray-900">
                  Mostrando {totalRegistros === 0 ? 0 : inicio + 1} a {Math.min(fin, totalRegistros)} de{" "}
                  {totalRegistros} registros
                </span>
                <div className="inline-flex mt-2 xs:mt-0">
                  <button
                    onClick={irPaginaAnterior}
                    disabled={paginaSegura === 1}
                    className="text-sm bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-800 font-semibold py-2 px-4 rounded-l inline-flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev
                  </button>
                  <button
                    onClick={irPaginaSiguiente}
                    disabled={paginaSegura === totalPaginas}
                    className="text-sm bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-800 font-semibold py-2 px-4 rounded-r inline-flex items-center"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}

/* ---------- Subcomponentes y utilidades ---------- */

function Th({ children }) {
  return (
    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
      {children}
    </th>
  );
}
Th.propTypes = { children: PropTypes.node };

function Td({ children }) {
  return <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{children}</td>;
}
Td.propTypes = { children: PropTypes.node };

function EtiquetaEstado({ estado }) {
  const e = (estado ?? "").toString().toLowerCase();
  const estilos = {
    activo: "text-green-900 bg-green-200",
    inactivo: "text-red-900 bg-red-200",
    suspended: "text-orange-900 bg-orange-200",
  };
  const clase = estilos[e] ?? "text-gray-900 bg-gray-200";

  return (
    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${clase} rounded-full`}>
      <span className="relative capitalize">{estado ?? "—"}</span>
    </span>
  );
}
EtiquetaEstado.propTypes = { estado: PropTypes.string };

function formatearFecha(fecha) {
  try {
    // admite Date, ISO string o timestamp
    const d = fecha instanceof Date ? fecha : new Date(fecha);
    if (isNaN(d.getTime())) return String(fecha ?? "");
    return d.toLocaleDateString("es-BO", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return String(fecha ?? "");
  }
}

/* ---------- PropTypes ---------- */

TablaUsuarios.propTypes = {
  datos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      nombre: PropTypes.string.isRequired,
      rol: PropTypes.string.isRequired,
      fechaCreacion: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)])
        .isRequired,
      estado: PropTypes.string.isRequired, // "Activo" | "Inactivo" | "Suspended"
      avatarUrl: PropTypes.string,
    })
  ),
  tamPaginaOpciones: PropTypes.arrayOf(PropTypes.number),
  tamPaginaInicial: PropTypes.number,
  mostrarControles: PropTypes.bool,
};
