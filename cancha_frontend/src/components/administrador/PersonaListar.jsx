/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { listarPersonas } from "../../api/persona_listar";
import { obtenerPersona } from "../../api/persona_obtener";
import PersonaFila from "./PersonaFila";
import Modal from "../comunes/Modal";
import PersonaEditarForm from "./PersonaEditarForm";

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
  const [editingId, setEditingId] = useState(null);

  // abrir/cerrar modal
  const openEdit = (p) => setEditingId(p.id_persona);
  const closeEdit = () => setEditingId(null);

  // refrescar una persona editada dentro del estado local
  const refreshPersona = useCallback(async (idPersona) => {
    try {
      const r = await obtenerPersona(idPersona);
      if (r.success && r.data) {
        setPersonas((prev) =>
          prev.map((x) => (x.id_persona === idPersona ? { ...x, ...r.data } : x))
        );
      }
    } catch (e) { /* opcional: mostrar toast */ }
  }, []);

  const fetchPersonas = useCallback(async (currentOffset) => {
    if (!hasMore || isLoading || fetchingRef.current) return;
    fetchingRef.current = true;
    setIsLoading(true);
    try {
      const response = await listarPersonas(limit, currentOffset);
      const newPersonas = response.data.personas || [];
      const filteredNew = newPersonas.filter(p => !seen.current.has(p.id_persona));
      filteredNew.forEach(p => seen.current.add(p.id_persona));
      if (filteredNew.length > 0) {
        setPersonas(prev => [...prev, ...filteredNew]);
      }
      setHasMore(Boolean(response.data.hasMore) && filteredNew.length > 0);
      setOffset(currentOffset + limit);
    } catch (error) {
      setMensaje(error.message);
      if (error.message.includes("iniciar sesión")) navigate("/login");
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [hasMore, isLoading, navigate]);

  useEffect(() => {
    if (initialFetchRef.current) return;
    seen.current.clear();
    fetchPersonas(0);
    initialFetchRef.current = true;
  }, [fetchPersonas]);

  const sentinelRef = useCallback((node) => {
    if (observer.current) observer.current.disconnect();
    if (!node || isLoading || !hasMore) return;
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) fetchPersonas(offset);
    }, { root: null, threshold: 0.1 });
    observer.current.observe(node);
  }, [isLoading, hasMore, offset, fetchPersonas]);

  if (mensaje) return <p className="text-red-600 px-6 py-4">{mensaje}</p>;

  return (
    <section className="px-6 py-6">
      {personas.length === 0 && !isLoading ? (
        <p className="text-azul-950/70">No hay personas registradas.</p>
      ) : (
        <div ref={containerRef} className="max-w-7xl mx-auto">
          {/* Wrapper para scroll horizontal en pantallas pequeñas */}
          <div className="overflow-x-auto rounded-2xl border border-gris-200 bg-blanco-50">
            <table className="min-w-[760px] w-full text-left">
              <thead className="text-sm uppercase tracking-wide text-azul-950/60 sticky top-0 bg-blanco-50">
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
                {personas.map((p) => (
                  <PersonaFila
                    key={p.id_persona}
                    persona={p}
                     onEdit={() => openEdit(p)}
                    onDelete={(per) => console.log("eliminar", per)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {isLoading && <p className="mt-4 text-azul-950/70">Cargando más personas…</p>}
          {hasMore && <div ref={sentinelRef} className="h-8" />}
          {!hasMore && personas.length > 0 && (
            <p className="mt-4 text-azul-950/70">No hay más personas para mostrar.</p>
          )}
        </div>
      )}

      <Modal open={!!editingId} onClose={closeEdit}>
        {editingId && (
          <PersonaEditarForm
            id={editingId}
            onSuccess={async () => {
              await refreshPersona(editingId); // actualiza la fila en la tabla
              closeEdit();
            }}
          />
        )}
      </Modal>
    </section>
  );
}
