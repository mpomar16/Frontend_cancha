/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { listarReservas } from "../services/reservaService"; // Asegúrate de tenerlo

export default function SelectReserva({ token, selectedId, onSelect }) {
  const [data, setData] = useState([]);
  const [limite, setLimite] = useState(5);
  const [desplazamiento, setDesplazamiento] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setCargando(true);
        const { reservas, hasMore } = await listarReservas(limite, desplazamiento, token);
        setData(reservas || []);
        setHasMore(Boolean(hasMore));
        setErr("");
      } catch (e) {
        setErr(e.message);
      } finally {
        setCargando(false);
      }
    }
    fetchData();
  }, [limite, desplazamiento, token]);

  // Función para formatear la fecha con formato "dd/MM/yyyy"
  const fmt = (d) => {
    try {
      if (!d) return "—";
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return "—"; // Verifica si la fecha es válida
      const day = dateObj.getDate().toString().padStart(2, '0'); // Día con 2 dígitos
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Mes con 2 dígitos (recuerda que los meses en JS empiezan desde 0)
      const year = dateObj.getFullYear(); // Año
      return `${day}/${month}/${year}`; // Devolver fecha en formato dd/MM/yyyy
    } catch {
      return "—"; // En caso de error, devolver guion
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow p-4">
      <h3 className="text-base font-bold text-azul-950 mb-3">Seleccionar Reserva</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <Th></Th>
              <Th>Reserva</Th>
              <Th>Cliente</Th>
              <Th>Cancha</Th>
              <Th>Fecha</Th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                  Cargando…
                </td>
              </tr>
            ) : err ? (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-red-600">
                  {err}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                  Sin resultados
                </td>
              </tr>
            ) : (
              data.map((res) => {
                const cliente = (res?.nombre_cliente ?? res?.usuario_cliente ?? "").trim() || `#${res?.id_cliente ?? "—"}`;
                const cancha = res?.nombre_cancha || `#${res?.id_cancha ?? "—"}`;
                return (
                  <tr
                    key={res.id_reserva}
                    className={`cursor-pointer ${selectedId === res.id_reserva ? "bg-verde-50" : "bg-white"}`}
                    onClick={() => onSelect?.(res.id_reserva)}
                  >
                    <td className="px-4 py-4 border-b border-gray-200 text-sm">
                      <input
                        type="radio"
                        name="reserva_select"
                        checked={selectedId === res.id_reserva}
                        onChange={() => onSelect?.(res.id_reserva)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-4 border-b border-gray-200 text-sm text-azul-950">
                      #{res.id_reserva}
                    </td>
                    <td className="px-4 py-4 border-b border-gray-200 text-sm">{cliente}</td>
                    <td className="px-4 py-4 border-b border-gray-200 text-sm">{cancha}</td>
                    <td className="px-4 py-4 border-b border-gray-200 text-sm">{fmt(res?.fecha_reserva)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación mini */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span>Mostrar</span>
          <select
            value={limite}
            onChange={(e) => {
              setLimite(Number(e.target.value));
              setDesplazamiento(0); // Reiniciamos el desplazamiento cuando se cambia el límite
            }}
            className="border border-gray-300 rounded-md px-2 py-1"
          >
            {[5, 10, 20].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>por página</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDesplazamiento(Math.max(0, desplazamiento - limite))}
            disabled={desplazamiento === 0}
            className="px-3 py-1 rounded-md border disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => hasMore && setDesplazamiento(desplazamiento + limite)}
            disabled={!hasMore}
            className="px-3 py-1 rounded-md border disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-2 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
      {children}
    </th>
  );
}
