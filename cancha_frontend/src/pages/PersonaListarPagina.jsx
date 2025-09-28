import { useState } from "react";
import PersonaListar from "../components/administrador/PersonaListar";
import PersonaBuscar from "../components/administrador/PersonaBuscar";

export default function PersonaListarPagina() {
  const [query, setQuery] = useState("");

  return (
    <div className="font-poppins">
      <h2 className="text-2xl font-bold text-azul-950 mb-4 mt-4 mx-6">Gestión de Personas</h2>
      <PersonaBuscar onChangeQuery={(q) => setQuery(q)} />
      {query === "" && <PersonaListar />} {/* Mostrar listado solo si el buscador está vacío */}
    </div>
  );
}
