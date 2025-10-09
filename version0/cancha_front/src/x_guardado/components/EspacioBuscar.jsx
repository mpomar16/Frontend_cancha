import { useState, useEffect } from "react";

export default function EspacioBuscar({ onChangeQuery }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (onChangeQuery) onChangeQuery(query);
  }, [query, onChangeQuery]);

  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder="Buscar por nombre o dirección..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 border rounded"
      />
    </div>
  );
}