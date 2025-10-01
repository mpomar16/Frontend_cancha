// src/pages/PersonaEditar.jsx
import { useParams } from "react-router-dom";
import PersonaEditarForm from "../components/persona/PersonaEditarForm";

export default function PersonaEditar() {
  const { id } = useParams();

  return (
    <div style={{ padding: "20px" }}>
      <h2>Editar Persona</h2>
      <PersonaEditarForm id={id} />
    </div>
  );
}