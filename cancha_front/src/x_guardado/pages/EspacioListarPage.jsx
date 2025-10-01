import { useState } from "react";
import EspacioBuscar from "../components/espacio/EspacioBuscar.jsx";
import EspacioFiltroDisciplina from "../components/espacio/EspacioFiltroDisciplina.jsx";

import EspacioListar from "../components/espacio/EspacioListar.jsx";

export default function EspacioListarPage() {
  const [query, setQuery] = useState("");
  const [disciplina, setDisciplina] = useState("");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestión de Espacios Deportivos</h1>
      <div className="flex gap-4 mb-6">
        <EspacioBuscar onChangeQuery={(q) => setQuery(q)} />
        <EspacioFiltroDisciplina onChangeDisciplina={(d) => setDisciplina(d)} />
      </div>
      <EspacioListar query={query} disciplina={disciplina} />
    </div>
  );
}