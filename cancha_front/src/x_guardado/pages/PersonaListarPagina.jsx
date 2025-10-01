import { useState } from "react";
import PersonaListar from "../components/persona/PersonaListar";
import PersonaBuscar from "../components/persona/PersonaBuscar";

export default function PersonaListarPagina() {
  const [query, setQuery] = useState("");

  return (
    <div>
      <h1>Gestión de Personas</h1>
      <PersonaBuscar onChangeQuery={(q) => setQuery(q)} />
      {query === "" && <PersonaListar />} {/* Mostrar listado solo si el buscador está vacío */}
    </div>
  );
}
