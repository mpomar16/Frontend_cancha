import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buscarPersonasPorNombre } from "../api/persona_buscar";
import PersonaCard from "./PersonaCard";

export default function PersonaBuscar({ onChangeQuery }) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Comunicar el estado de la búsqueda al componente padre
    if (onChangeQuery) onChangeQuery(query);

    if (!query) {
      setResultados([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
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

    return () => clearTimeout(delayDebounce);
  }, [query, onChangeQuery]);

  return (
    <div style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />
      {isLoading && <p>Cargando resultados...</p>}
      {mensaje && <p style={{ color: "red" }}>{mensaje}</p>}
      {resultados.map((persona) => (
        <div key={persona.id_persona} style={{ marginBottom: "10px" }}>
          <PersonaCard persona={persona} />
          <button
            onClick={() => navigate(`/editar/${persona.id_persona}`)}
            style={{ marginLeft: "10px" }}
          >
            Editar
          </button>
        </div>
      ))}
    </div>
  );
}
