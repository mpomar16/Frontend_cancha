/* eslint-disable no-unused-vars */
// pages/SearchEspacios.jsx
import { useState, useEffect, useMemo } from "react";
import SearchBar from "../components/SearchBar";
import EspacioFila from "../components/EspacioFila";
import { MapPin, Dumbbell } from "lucide-react";
import {
  buscarEspaciosPorNombreODireccion,
  buscarEspaciosPorDisciplina,
  listarDisciplinas,
} from "../services/espacioService";
import Alerta from "../components/Alerta";

export default function SearchEspacios({ onSearchResults = () => {} }) {
  const [resultados, setResultados] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [errorAlert, setErrorAlert] = useState({ open: false, msg: "" });
  //const token = localStorage.getItem("token");

  const hayBusqueda = useMemo(() => resultados.length > 0, [resultados]);

  useEffect(() => {
    (async () => {
      try {
        const r = await listarDisciplinas();
        setDisciplinas(Array.isArray(r.data) ? r.data : []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const modos = [
    {
      valor: "nombre",
      etiqueta: "Nombre o Dirección",
      placeholder: "Ej: Coliseo Julio Borelli o Av. 16 de Julio",
      icon: <MapPin className="text-sm w-4 h-4" />,
    },
    {
      valor: "disciplina",
      etiqueta: "Disciplina",
      placeholder: "Selecciona una disciplina…",
      icon: <Dumbbell className="text-sm w-4 h-4" />,
    },
  ];

  const ejecutarPorModo = {
    async nombre(termino) {
      if (!termino?.trim()) return [];
      const r = await buscarEspaciosPorNombreODireccion(termino.trim());
      return Array.isArray(r.data) ? r.data : [];
    },
    async disciplina(termino) {
      if (!termino) return [];
      const r = await buscarEspaciosPorDisciplina(termino);
      return Array.isArray(r.data) ? r.data : [];
    },
  };

  function validar(modo, termino) {
    if (modo === "nombre" && !termino.trim()) return "Debes escribir un nombre o dirección.";
    if (modo === "disciplina" && !termino) return "Selecciona una disciplina.";
    return null;
  }

  function renderCampo({ modo, value, setValue, disabled, cargando, placeholder }) {
    if (modo === "disciplina") {
      return (
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled || cargando}
          className="w-full h-[44px] pl-3 pr-10 rounded-lg border border-gris-200 text-gray-900 focus:outline-none focus:ring-1 focus:ring-verde-600 disabled:opacity-50"
        >
          <option value="">{placeholder || "Selecciona una disciplina"}</option>
          {disciplinas.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      );
    }

    return (
      <>
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <MapPin className="w-5 h-5 text-azul-950" />
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || cargando}
          className="w-full h-[44px] pl-10 pr-10 rounded-lg border border-gris-200 text-gray-900 focus:outline-none focus:ring-1 focus:ring-verde-600 placeholder-gray-400 disabled:opacity-50"
        />
        {value && !cargando && (
          <button
            type="button"
            onClick={() => setValue("")}
            className="absolute inset-y-0 right-3 flex items-center"
            title="Limpiar texto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500 hover:text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </>
    );
  }

  const handleResultados = (rows) => {
    setResultados(rows);
    onSearchResults(rows);
  };

  return (
    <section className="p-4 md:p-6">
      {errorAlert.open && (
        <div className="mb-3">
          <Alerta
            open
            display="inline"
            variant="error"
            title="Ocurrió un error"
            message={errorAlert.msg}
            onClose={() => setErrorAlert({ open: false, msg: "" })}
          />
        </div>
      )}

      <SearchBar
        modos={modos}
        ejecutarPorModo={ejecutarPorModo}
        validar={validar}
        onResultados={handleResultados}
        onLimpiar={async () => {
  try {
    setResultados([]);
    // Notificamos al padre para que muestre el listado general otra vez
    onSearchResults({ espacios: [], limpiar: true });
  } catch (err) {
    setErrorAlert({
      open: true,
      msg: "No se pudo recargar los espacios.",
    });
  }
}}

        botonTexto="Buscar"
        className="max-w-5xl mx-auto text-sm"
        renderCampo={renderCampo}
      />

      {hayBusqueda && (
        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto mt-6">
          <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <Th>Nombre</Th>
                  <Th>Dirección</Th>
                  <Th>Descripción</Th>
                  <Th>Horario</Th>
                  <Th>Detalles</Th>
                  <Th>Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {resultados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-5 bg-white text-sm text-center text-gray-500">
                      Sin resultados
                    </td>
                  </tr>
                ) : (
                  resultados.map((espacio) => (
                    <EspacioFila key={espacio.id_espacio} espacio={espacio} mostrarAcciones />
                  ))
                )}
              </tbody>
            </table>
            <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
              <span className="text-xs xs:text-sm text-gray-900">
                Resultados: {resultados.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Th({ children }) {
  return (
    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}
