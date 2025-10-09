// PersonaListar.js
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { listarPersonas } from "../api/persona_listar";
import PersonaCard from "./PersonaCard";

export default function PersonaListar() {
  const [personas, setPersonas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 12;
  const navigate = useNavigate();
  const observer = useRef();
  const fetchingRef = useRef(false);
  const initialFetchRef = useRef(false);
  const seen = useRef(new Set());
  const containerRef = useRef(null);

  const fetchPersonas = useCallback(async (currentOffset) => {
    if (!hasMore || isLoading || fetchingRef.current) {
      console.log(`Fetch skipped: hasMore=${hasMore}, isLoading=${isLoading}, fetching=${fetchingRef.current}`);
      return;
    }
    fetchingRef.current = true;
    setIsLoading(true);
    try {
      const response = await listarPersonas(limit, currentOffset);
      //console.log('API Response:', response);
      const newPersonas = response.data.personas || [];
      //console.log('Received personas ids:', newPersonas.map(p => p.id_persona));
      const filteredNew = newPersonas.filter(p => !seen.current.has(p.id_persona));
      if (filteredNew.length < newPersonas.length) {
        console.warn('Duplicates filtered out:', newPersonas.length - filteredNew.length);
      }
      filteredNew.forEach(p => seen.current.add(p.id_persona));
      if (filteredNew.length > 0) {
        setPersonas((prev) => [...prev, ...filteredNew]);
      } else if (newPersonas.length > 0) {
        // If we got data but all were duplicates, assume no more unique data
        setHasMore(false);
        console.log('No new unique personas, setting hasMore=false');
      }
      setHasMore(response.data.hasMore && filteredNew.length > 0);
      setOffset(currentOffset + limit);
    } catch (error) {
      console.error('Fetch error:', error.message);
      setMensaje(error.message);
      if (error.message.includes("iniciar sesión")) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
      //console.log('Fetch completed');
    }
  }, [hasMore, isLoading, navigate]);

  useEffect(() => {
    if (initialFetchRef.current) {
      return;
    }
    //console.log('Component mounted, triggering initial fetch');
    seen.current.clear(); // Clear seen IDs on mount to allow fresh fetch
    fetchPersonas(0);
    initialFetchRef.current = true;
  }, [fetchPersonas]);

  const sentinelRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      if (!node || isLoading || !hasMore) {
        return;
      }
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            console.log('Sentinel intersected: Fetching next page');
            fetchPersonas(offset);
          }
        },
        { root: null, threshold: 0.1 }
      );
      observer.current.observe(node);
    },
    [isLoading, hasMore, offset, fetchPersonas]
  );

  if (mensaje) return <p style={{ color: "red" }}>{mensaje}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Lista de Personas</h2>
      {personas.length === 0 && !isLoading ? (
        <p>No hay personas registradas.</p>
      ) : (
        <div ref={containerRef}>
          {personas.map((persona) => (
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
          {isLoading && <p>Cargando más personas...</p>}
          {hasMore && <div ref={sentinelRef} style={{ height: "20px", background: "transparent" }} />}
          {!hasMore && personas.length > 0 && <p>No hay más personas para mostrar.</p>}
        </div>
      )}
    </div>
  );
}