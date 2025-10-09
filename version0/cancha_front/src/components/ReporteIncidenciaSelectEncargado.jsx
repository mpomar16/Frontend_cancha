/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { listarEncargados } from "../services/encargadoService";
import placeholder from "../assets/placeholder.jpeg";

const API_BASE = "http://localhost:3000";

export default function SelectEncargado({ token, selectedId, onSelect }) {
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
        const { encargados, hasMore } = await listarEncargados(limite, desplazamiento, token);
        setData(encargados || []);
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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow p-4">
      <h3 className="text-base font-bold text-azul-950 mb-3">Seleccionar Encargado</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <Th></Th>
              <Th>Foto</Th>
              <Th>Nombre</Th>
              <Th>Correo</Th>
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
              data.map((enc) => {
                const nombreCompleto = `${enc?.nombre ?? ""} ${enc?.apellido ?? ""}`.trim() || enc?.usuario || "—";
                const srcImg = enc?.imagen_perfil ? `${API_BASE}${enc.imagen_perfil}` : placeholder;
                return (
                  <tr
                    key={enc.id_encargado}
                    className={`cursor-pointer ${selectedId === enc.id_encargado ? "bg-verde-50" : "bg-white"}`}
                    onClick={() => onSelect?.(enc.id_encargado)}
                  >
                    <td className="px-4 py-4 border-b border-gray-200 text-sm">
                      <input
                        type="radio"
                        name="encargado_select"
                        checked={selectedId === enc.id_encargado}
                        onChange={() => onSelect?.(enc.id_encargado)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-4 border-b border-gray-200 text-sm">
                      <img
                        src={srcImg}
                        alt={nombreCompleto}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-100"
                        onError={(e) => (e.currentTarget.src = placeholder)}
                      />
                    </td>
                    <td className="px-4 py-4 border-b border-gray-200 text-sm text-azul-950">{nombreCompleto}</td>
                    <td className="px-4 py-4 border-b border-gray-200 text-sm">{enc?.correo || "—"}</td>
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
              setDesplazamiento(0);
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
