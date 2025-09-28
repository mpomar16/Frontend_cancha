import { Pencil, Trash } from "lucide-react";
import usarImagenPerfil from "../../hooks/usarImagenPerfil";

export default function PersonaFila({ persona, onEdit, onDelete }) {
  const img = usarImagenPerfil(persona?.imagen_perfil);
  const fullName =
    `${persona?.nombre ?? ""} ${persona?.apellido ?? ""}`.trim() || "Sin nombre";

  const sexoLabel = persona?.sexo
    ? /^(m|masculino)$/i.test(persona.sexo)
      ? "Masculino"
      : /^(f|femenino)$/i.test(persona.sexo)
      ? "Femenino"
      : persona.sexo
    : "—";

  return (
    <tr className="text-base border-b border-gris-200 hover:bg-gris-50">
      {/* Avatar */}
      <td className="px-4 py-4">
        <img
          src={img}
          alt={fullName}
          loading="lazy"
          className="h-12 w-12 rounded-full object-cover ring-1 ring-azul-600"
        />
      </td>

      {/* Nombre */}
      <td className="px-4 py-4 align-top">
        <div className="text-base text-azul-950">{fullName}</div>
      </td>

      {/* Correo */}
      <td className="px-4 py-4 align-top">
        {persona?.correo ? (
          <a href={`mailto:${persona.correo}`} className="text-azul-950 truncate block">
            {persona.correo}
          </a>
        ) : (
          "—"
        )}
      </td>

      {/* Teléfono */}
      <td className="px-4 py-4 align-top">
        {persona?.telefono ? (
          <a href={`tel:${persona.telefono}`} className="text-azul-950">
            {persona.telefono}
          </a>
        ) : (
          "—"
        )}
      </td>

      {/* Sexo */}
      <td className="px-4 py-4 align-top">
        <span className="inline-flex rounded-full bg-gris-100 px-2.5 py-1 text-xs font-medium text-azul-950">
          {sexoLabel}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-4 py-4 align-top">
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => onEdit?.(persona)}
            className="rounded-xl bg-verde-600 px-3 py-2 text-blanco-50 hover:bg-verde-600"
          >
            <Pencil size={18}/>
          </button>
          <button
            onClick={() => onDelete?.(persona)}
            className="rounded-xl bg-rojo-600 px-3 py-2 text-blanco-50 hover:bg-rojo-700"
          >
            <Trash size={18}/>
          </button>
        </div>
      </td>
    </tr>
  );
}
