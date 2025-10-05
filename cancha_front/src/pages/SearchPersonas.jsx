// pages/SearchPersonas.jsx
import { useState, useMemo } from "react";
import SearchBar from "../components/SearchBar";
import PersonaFila from "../components/PersonaFila"; // <- usar la fila
import { Mail, User } from "lucide-react";
import {
  buscarPersonaPorNombre,
  obtenerPersonaPorCorreo,
} from "../services/personaService";

export default function SearchPersonas({ onHayBusquedaChange = () => {} }) {
  const [resultados, setResultados] = useState([]);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const hayBusqueda = useMemo(() => resultados.length > 0, [resultados]);

  useMemo(() => {
    onHayBusquedaChange(hayBusqueda);
  }, [hayBusqueda, onHayBusquedaChange]);

  const modos = [
    { valor: "nombre", etiqueta: "Nombre", placeholder: "Ej: Ana Pérez", icon: <User className="text-sm w-4 h-4" /> },
    { valor: "correo", etiqueta: "Correo", placeholder: "Ej: ana@dominio.com", icon: <Mail className="text-sm -4 h-4" /> },
  ];

  const ejecutarPorModo = {
    async nombre(termino) {
      const r = await buscarPersonaPorNombre(termino, token);
      return r.data;
    },
    async correo(termino) {
      const r = await obtenerPersonaPorCorreo(termino, token);
      return Array.isArray(r.data) ? r.data : [r.data];
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
    <section className="p-4 md:p-6">
      <div className="mb-4 text-center">
        {role !== "ADMINISTRADOR" && (
          <p className="sr-only">Acceso restringido</p>
        )}
      </div>

      <SearchBar
        modos={modos}
        ejecutarPorModo={ejecutarPorModo}
        validar={validar}
        onResultados={setResultados}
        onLimpiar={() => setResultados([])}
        botonTexto="Buscar"
        className="max-w-5xl mx-auto text-sm"
      />

      {/* Resultados en TABLA (mismo estilo del snippet) */}
      {hayBusqueda && (
        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
          <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <Th>Foto</Th>
                  <Th>Nombre</Th>
                  <Th>Correo</Th>
                  <Th>Usuario</Th>
                  <Th>Teléfono</Th>
                  <Th>Sexo/Género</Th>
                  <Th>Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((persona) => (
                  <PersonaFila key={persona.id_persona} persona={persona} mostrarAcciones />
                ))}
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

/* Header cell con el MISMO estilo del snippet */
function Th({ children }) {
  return (
    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
      {children}
    </th>
  );
}
