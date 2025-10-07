/* eslint-disable no-unused-vars */
import { useState, useMemo } from "react";
import SearchBar from "../components/SearchBar";
import EncargadoFila from "../components/EncargadoFila";
import { UserCog, Mail, Briefcase } from "lucide-react";
import {
  buscarEncargadoPorNombre,
  buscarEncargadoPorResponsabilidad,
  buscarEncargadoPorCorreo,
} from "../services/encargadoService";

export default function SearchEncargados({ onHayBusquedaChange = () => {} }) {
  const [resultados, setResultados] = useState([]);
  const token = localStorage.getItem("token");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdmin = Array.isArray(roles) && roles.includes("ADMINISTRADOR");

  const hayBusqueda = useMemo(() => resultados.length > 0, [resultados]);
  useMemo(() => {
    onHayBusquedaChange(hayBusqueda);
  }, [hayBusqueda, onHayBusquedaChange]);

  const modos = [
    {
      valor: "nombre",
      etiqueta: "Nombre del Encargado",
      placeholder: "Ej: Juan Pérez",
      icon: <UserCog className="text-sm w-4 h-4" />,
    },
    {
      valor: "responsabilidad",
      etiqueta: "Responsabilidad",
      placeholder: "Ej: Mantenimiento, Control de ingreso...",
      icon: <Briefcase className="text-sm w-4 h-4" />,
    },
    {
      valor: "correo",
      etiqueta: "Correo electrónico",
      placeholder: "Ej: juan@correo.com",
      icon: <Mail className="text-sm w-4 h-4" />,
    },
  ];

  const ejecutarPorModo = {
    async nombre(termino) {
      const r = await buscarEncargadoPorNombre(termino, token);
      return Array.isArray(r.data) ? r.data : [];
    },
    async responsabilidad(termino) {
      const r = await buscarEncargadoPorResponsabilidad(termino, token);
      return Array.isArray(r.data) ? r.data : [];
    },
    async correo(termino) {
      const r = await buscarEncargadoPorCorreo(termino, token);
      return Array.isArray(r.data) ? r.data : [];
    },
  };

  function validar(modo, termino) {
    if (!termino?.trim()) return "Debes escribir un término de búsqueda.";
    if (modo === "correo" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(termino.trim())) {
      return "Correo inválido.";
    }
    return null;
  }

  return (
    <section className="py-4 md:py-6">
      <SearchBar
        modos={modos}
        ejecutarPorModo={ejecutarPorModo}
        validar={validar}
        onResultados={setResultados}
        onLimpiar={() => setResultados([])}
        botonTexto="Buscar"
        className="max-w-5xl mx-auto text-sm"
      />

      {hayBusqueda && (
        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
          <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <Th>Encargado</Th>
                  <Th>Correo</Th>
                  <Th>Teléfono</Th>
                  <Th>Responsabilidad</Th>
                  <Th>Horario</Th>
                  <Th>Fecha Inicio</Th>
                  <Th>Detalles</Th>
                  {isAdmin && <Th>Acciones</Th>}
                </tr>
              </thead>
              <tbody>
                {resultados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isAdmin ? 8 : 7}
                      className="px-5 py-5 bg-white text-sm text-center text-gray-500"
                    >
                      Sin resultados
                    </td>
                  </tr>
                ) : (
                  resultados.map((encargado) => (
                    <EncargadoFila
                      key={encargado.id_encargado}
                      encargado={encargado}
                      mostrarAcciones={isAdmin}
                    />
                  ))
                )}
              </tbody>
            </table>

            <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
              <span className="text-xs xs:text-sm text-gray-900">
                Resultados: {resultados.length}
              </span>
              <div className="inline-flex mt-2 xs:mt-0" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Th({ children }) {
  return (
    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
      {children}
    </th>
  );
}
