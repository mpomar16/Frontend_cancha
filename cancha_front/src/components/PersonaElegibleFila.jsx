/* eslint-disable no-unused-vars */
// components/PersonaElegibleFila.jsx
import { User } from "lucide-react";
import placeholder from "../assets/placeholder.jpeg";

const API_BASE = "http://localhost:3000";

export default function PersonaElegibleFila({
  persona,
  selected = false,
  onSelect, // () => void
}) {
  const {
    id_persona,
    nombre,
    apellido,
    correo,
    telefono,
    sexo,
    imagen_perfil,
  } = persona || {};

  const nombreCompleto = `${nombre ?? ""} ${apellido ?? ""}`.trim() || "—";
  const telefonoMostrar = telefono || "—";
  const sexoMostrar = sexo || "—";
  const srcImg = imagen_perfil ? `${API_BASE}${imagen_perfil}` : placeholder;

  return (
    <tr
      className={`cursor-pointer ${selected ? "bg-verde-50" : "bg-white"}`}
      onClick={onSelect}
    >
      {/* Radio */}
      <td className="px-4 py-4 border-b border-gray-200 text-sm">
        <input
          type="radio"
          name="persona_select"
          checked={selected}
          onChange={onSelect}
          className="w-4 h-4"
          aria-label={`Seleccionar ${nombreCompleto}`}
        />
      </td>

      {/* Foto */}
      <td className="px-4 py-4 border-b border-gray-200 text-sm">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-gris-300 bg-gray-100">
            <img
              src={srcImg}
              alt={nombreCompleto}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = placeholder; }}
            />
          </div>
        </div>
      </td>

      {/* Nombre */}
      <td className="px-4 py-4 border-b border-gray-200 text-sm text-azul-950">
        {nombreCompleto}
      </td>

      {/* Correo */}
      <td className="px-4 py-4 border-b border-gray-200 text-sm">
        <span className="text-azul-950">{correo || "—"}</span>
      </td>

      {/* Teléfono */}
      <td className="px-4 py-4 border-b border-gray-200 text-sm">
        <span className="text-azul-950">{telefonoMostrar}</span>
      </td>

      {/* Sexo */}
      <td className="px-4 py-4 border-b border-gray-200 text-sm">
        <span className="inline-block px-3 py-1 rounded-full bg-gray-200 text-azul-950 text-xs">
          {sexoMostrar}
        </span>
      </td>
    </tr>
  );
}
