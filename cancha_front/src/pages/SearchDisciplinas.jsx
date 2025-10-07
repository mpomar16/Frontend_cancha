/* eslint-disable no-unused-vars */
import { useState, useMemo } from "react";
import SearchBar from "../components/SearchBar";
import DisciplinaFila from "../components/DisciplinaFila";
import { BookOpen, X } from "lucide-react"; // 👈 usamos Lucide icons
import {
  buscarDisciplinasPorNombre,
  eliminarDisciplina,
} from "../services/disciplinaService";
import Alerta from "../components/Alerta";

export default function SearchDisciplinas({ onSearchResults = () => {} }) {
  const [resultados, setResultados] = useState([]);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [errorAlert, setErrorAlert] = useState({ open: false, msg: "" });
  const hayBusqueda = useMemo(() => resultados.length > 0, [resultados]);

  const modos = [
    {
      valor: "nombre",
      etiqueta: "Nombre de la Disciplina",
      placeholder: "Ej: Fútbol, Natación, Tenis...",
      icon: <BookOpen className="text-sm w-4 h-4" />,
    },
  ];

  // === Buscar por nombre ===
  const ejecutarPorModo = {
    async nombre(termino) {
      if (!termino?.trim()) return [];
      try {
        const token = localStorage.getItem("token");
        const r = await buscarDisciplinasPorNombre(termino.trim(), token);
        return Array.isArray(r.data) ? r.data : [];
      } catch (err) {
        console.error(err);
        setErrorAlert({ open: true, msg: err.message || "Error al buscar disciplinas." });
        return [];
      }
    },
  };

  function validar(modo, termino) {
    if (modo === "nombre" && !termino.trim()) return "Debes escribir un nombre de disciplina.";
    return null;
  }

  // === Campo de búsqueda ===
  function renderCampo({ modo, value, setValue, disabled, cargando, placeholder }) {
    return (
      <>
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <BookOpen className="w-5 h-5 text-azul-950" />
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
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            title="Limpiar texto"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </>
    );
  }

  const handleResultados = (rows) => {
    setResultados(rows);
    onSearchResults(rows);
  };

  // === Eliminar disciplina ===
  const handleEliminar = async (disciplina) => {
    const token = localStorage.getItem("token");
    if (!window.confirm(`¿Seguro que deseas eliminar la disciplina "${disciplina.nombre}"?`))
      return;
    setEliminandoId(disciplina.id_disciplina);

    try {
      const res = await eliminarDisciplina(disciplina.id_disciplina, token);
      if (res.success) {
        setResultados((prev) =>
          prev.filter((d) => d.id_disciplina !== disciplina.id_disciplina)
        );
      } else {
        setErrorAlert({ open: true, msg: res.message });
      }
    } catch (err) {
      setErrorAlert({ open: true, msg: err.message });
    } finally {
      setEliminandoId(null);
    }
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
        onLimpiar={() => {
          setResultados([]);
          onSearchResults({ disciplinas: [], limpiar: true });
        }}
        botonTexto="Buscar"
        className="max-w-4xl mx-auto text-sm"
        renderCampo={renderCampo}
      />

      {hayBusqueda && (
        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto mt-6">
          <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <Th>Nombre</Th>
                  <Th>Descripción</Th>
                  <Th>Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {resultados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-5 bg-white text-sm text-center text-gray-500"
                    >
                      Sin resultados
                    </td>
                  </tr>
                ) : (
                  resultados.map((disciplina) => (
                    <DisciplinaFila
                      key={disciplina.id_disciplina}
                      disciplina={disciplina}
                      onEliminar={handleEliminar}
                      eliminando={eliminandoId === disciplina.id_disciplina}
                      mostrarAcciones
                    />
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
