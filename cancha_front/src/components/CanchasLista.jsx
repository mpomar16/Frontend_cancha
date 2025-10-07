// components/CanchasLista.jsx
import { useState, useMemo } from "react";
import CanchaFila from "./CanchaFila";
import Paginacion from "./Paginacion";

export default function CanchasLista({
  canchas = [],
  mostrarAcciones = false,
  eliminandoId = null,
  onEliminar,
}) {
  const [limite, setLimite] = useState(5); // elementos por página
  const [desplazamiento, setDesplazamiento] = useState(0);

  // Cálculo de la porción actual de datos
  const canchasPaginadas = useMemo(() => {
    return canchas.slice(desplazamiento, desplazamiento + limite);
  }, [canchas, desplazamiento, limite]);

  const totalRegistros = canchas.length;

  return (
    <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
      <div className="inline-block min-w-full shadow rounded-lg overflow-hidden bg-white">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <Th>Imagen</Th>
              <Th>Nombre</Th>
              <Th>Ubicación</Th>
              <Th>Capacidad</Th>
              <Th>Monto-Hora(Bs)</Th>
              <Th>Estado</Th>
              <Th>Disciplinas</Th>
              {mostrarAcciones && <Th>Acciones</Th>}
            </tr>
          </thead>
          <tbody>
            {canchasPaginadas.length === 0 ? (
              <tr>
                <td
                  colSpan={mostrarAcciones ? 7 : 6}
                  className="px-5 py-5 bg-white text-sm text-center text-gray-500"
                >
                  Sin registros
                </td>
              </tr>
            ) : (
              canchasPaginadas.map((c) => (
                <CanchaFila
                  key={c.id_cancha}
                  cancha={c}
                  mostrarAcciones={mostrarAcciones}
                  onEliminar={onEliminar}
                  eliminando={eliminandoId === c.id_cancha}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalRegistros > 0 && (
        <Paginacion
          limite={limite}
          desplazamiento={desplazamiento}
          totalRegistros={totalRegistros}
          onCambiarDesplazamiento={setDesplazamiento}
          onCambiarLimite={(n) => {
            setLimite(n);
            setDesplazamiento(0); // reset al cambiar límite
          }}
          clase="mt-4"
        />
      )}
    </div>
  );
}

// === Componente interno para encabezados de tabla ===
function Th({ children }) {
  return (
    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}
