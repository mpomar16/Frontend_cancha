// PersonaBuscar.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buscarPersonasPorNombre } from "../../api/persona_buscar";
import PersonaFila from "./PersonaFila"; // 👈 cambia el import

export default function PersonaBuscar({ onChangeQuery }) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    onChangeQuery?.(query);
    if (!query) { setResultados([]); return; }

    const t = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await buscarPersonasPorNombre(query);
        setResultados(res.data || []);
        setMensaje("");
      } catch (error) {
        setMensaje(error.message);
        setResultados([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [query, onChangeQuery]);

  const hayResultados = resultados.length > 0;

  return (
    <section className="px-6 py-6">
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-xl border border-gris-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-verde-600"
      />

      {isLoading && <p className="mt-3 text-azul-950/70">Cargando resultados...</p>}
      {mensaje && <p className="mt-3 text-red-600">{mensaje}</p>}
      {!isLoading && query && !hayResultados && !mensaje && (
        <p className="mt-3 text-azul-950/70">Sin resultados para “{query}”.</p>
      )}

      {hayResultados && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-gris-200 bg-blanco-50">
          <table className="min-w-[760px] w-full text-left">
            <thead className="text-xs uppercase tracking-wide text-azul-950/60 sticky top-0 bg-blanco-50">
              <tr>
                <th className="px-4 py-3 w-20">Foto</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Sexo</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((p) => (
                <PersonaFila
                  key={p.id_persona}
                  persona={p}
                  onEdit={(per) => navigate(`/editar/${per.id_persona}`)}
                  onDelete={(per) => console.log("eliminar", per)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
