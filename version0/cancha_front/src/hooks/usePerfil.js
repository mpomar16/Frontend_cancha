// usePerfil.js
import { useEffect, useState } from "react";
import { obtenerMiPerfil } from "../services/personaService";

export function usePerfil(token) {
  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        const res = await obtenerMiPerfil(token);
        if (!alive) return;
        setPersona(res?.data || null);
      } catch (e) {
        if (!alive) return;
        setError(e);
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (token) run(); else { setLoading(false); }
    return () => { alive = false; };
  }, [token]);

  return { persona, loading, error };
}
