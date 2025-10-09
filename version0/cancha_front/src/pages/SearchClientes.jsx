/* eslint-disable no-unused-vars */
import { useState, useMemo } from "react";
import SearchBar from "../components/SearchBar";
import ClientesFila from "../components/ClientesFila";
import { User, Mail, Phone } from "lucide-react";
import {
  buscarClientePorNombre,
  //buscarClientePorCorreo,
  //buscarClientePorTelefono,
} from "../services/clienteService";

export default function SearchClientes({ onHayBusquedaChange = () => {} }) {
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
      etiqueta: "Nombre del Cliente",
      placeholder: "Ej: Juan Pérez",
      icon: <User className="text-sm w-4 h-4" />,
    },
    {
      valor: "correo",
      etiqueta: "Correo electrónico",
      placeholder: "Ej: juan@correo.com",
      icon: <Mail className="text-sm w-4 h-4" />,
    },
    {
      valor: "telefono",
      etiqueta: "Teléfono",
      placeholder: "Ej: 77712345",
      icon: <Phone className="text-sm w-4 h-4" />,
    },
  ];

  const ejecutarPorModo = {
    async nombre(termino) {
      const r = await buscarClientePorNombre(termino, token);
      return Array.isArray(r.data) ? r.data : [];
    },
    async correo(termino) {
      const r = await buscarClientePorCorreo(termino, token);
      return Array.isArray(r.data) ? r.data : [];
    },
    async telefono(termino) {
      const r = await buscarClientePorTelefono(termino, token);
      return Array.isArray(r.data) ? r.data : [];
    },
  };

  function validar(modo, termino) {
    if (!termino?.trim()) return "Debes escribir un término de búsqueda.";
    if (
      modo === "correo" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(termino.trim())
    ) {
      return "Correo inválido.";
    }
    if (modo === "telefono" && !/^\d{6,15}$/.test(termino.trim())) {
      return "Teléfono inválido.";
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
                  <Th>Cliente</Th>
                  <Th>Correo</Th>
                  <Th>Teléfono</Th>
                  <Th>Detalles</Th>
                  {isAdmin && <Th>Acciones</Th>}
                </tr>
              </thead>
              <tbody>
                {resultados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isAdmin ? 5 : 4}
                      className="px-5 py-5 bg-white text-sm text-center text-gray-500"
                    >
                      Sin resultados
                    </td>
                  </tr>
                ) : (
                  resultados.map((cliente) => (
                    <ClientesFila
                      key={cliente.id_cliente}
                      cliente={cliente}
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
