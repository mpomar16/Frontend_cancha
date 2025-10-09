import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { listarEspacios, buscarEspaciosPorNombreODireccion, buscarEspaciosPorDisciplina } from "../api/espacio_listar.js";
import EspacioCard from "./EspacioCard.jsx";

export default function EspacioListar({ query, disciplina }) {
  const [espacios, setEspacios] = useState([]);
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

  const fetchEspacios = useCallback(async (currentOffset, fetchType = "general") => {
    if (!hasMore || isLoading || fetchingRef.current) {
      console.log(`Fetch skipped: hasMore=${hasMore}, isLoading=${isLoading}, fetching=${fetchingRef.current}`);
      return;
    }
    fetchingRef.current = true;
    setIsLoading(true);
    try {
      let response;
      if (fetchType === "search") {
        response = await buscarEspaciosPorNombreODireccion(query);
      } else if (fetchType === "disciplina") {
        response = await buscarEspaciosPorDisciplina(disciplina);
      } else {
        response = await listarEspacios(limit, currentOffset);
      }
      const newEspacios = fetchType === "general" ? (response.data.espacios || []) : (response.data || []);
      const filteredNew = newEspacios.filter(p => !seen.current.has(p.id_espacio));
      filteredNew.forEach(p => seen.current.add(p.id_espacio));
      if (filteredNew.length > 0) {
        setEspacios((prev) => fetchType === "general" ? [...prev, ...filteredNew] : filteredNew);
      }
      setHasMore(fetchType === "general" ? (response.data.hasMore && filteredNew.length > 0) : false);
      if (fetchType === "general") setOffset(currentOffset + limit);
    } catch (error) {
      console.error('Fetch error:', error.message);
      setMensaje(error.message);
      if (error.message.includes("iniciar sesión")) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [hasMore, isLoading, navigate, query, disciplina]);

  useEffect(() => {
    setEspacios([]);
    setOffset(0);
    setHasMore(true);
    seen.current.clear();
    initialFetchRef.current = false;
  }, [query, disciplina]);

  useEffect(() => {
    if (initialFetchRef.current) return;
    if (query) {
      fetchEspacios(0, "search");
    } else if (disciplina) {
      fetchEspacios(0, "disciplina");
    } else {
      fetchEspacios(0, "general");
    }
    initialFetchRef.current = true;
  }, [fetchEspacios, query, disciplina]);

  const sentinelRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      if (!node || isLoading || !hasMore || query || disciplina) return;
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            console.log('Sentinel intersected: Fetching next page');
            fetchEspacios(offset, "general");
          }
        },
        { root: null, threshold: 0.1 }
      );
      observer.current.observe(node);
    },
    [isLoading, hasMore, offset, fetchEspacios, query, disciplina]
  );

  if (mensaje) return <p className="text-red-500">{mensaje}</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        {disciplina ? `Espacios para ${disciplina}` : "Lista de Espacios"}
      </h2>
      {espacios.length === 0 && !isLoading ? (
        <p>No hay espacios deportivos registrados.</p>
      ) : (
        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {espacios.map((espacio) => (
            <EspacioCard key={espacio.id_espacio} espacio={espacio} />
          ))}
          {isLoading && <p className="text-center">Cargando más espacios...</p>}
          {hasMore && !query && !disciplina && <div ref={sentinelRef} className="h-5" />}
          {!hasMore && espacios.length > 0 && !query && !disciplina && <p className="text-center">No hay más espacios para mostrar.</p>}
        </div>
      )}
    </div>
  );
}