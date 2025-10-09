// components/PersonaFila.jsx
import { Link } from "react-router-dom";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import placeholder from "../assets/placeholder.jpeg";

const API_BASE = "http://localhost:3000";

export default function PersonaFila({
  persona,
  onEliminar,
  mostrarAcciones = true,
  eliminando = false, 
}) {
  const {
    id_persona,
    nombre,
    apellido,
    correo,
    usuario,
    telefono,
    sexo,
    imagen_perfil,
  } = persona;

  const telefonoMostrar = telefono || "—";
  const sexoMostrar = sexo || "—";
  const nombreCompleto = `${nombre ?? ""} ${apellido ?? ""}`.trim() || "—";
  const srcImg = imagen_perfil ? `${API_BASE}${imagen_perfil}` : placeholder;

  return (
    <tr>
      {/* Foto */}
      <td className="px-5 py-5 border-b border-gris-300 bg-white text-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-12 h-12">
            <img
              className="w-full h-full rounded-full object-cover bg-gray-100"
              src={srcImg}
              alt={nombreCompleto}
              onError={(e) => { e.currentTarget.src = placeholder; }}
            />
          </div>
        </div>
      </td>

      {/* Nombre (link a detalle) */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-azul-950 text-sm">
          {nombreCompleto}
      </td>

      {/* Correo */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-azul-950 whitespace-no-wrap">{correo || "—"}</p>
      </td>

      {/* Usuario */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-azul-950 whitespace-no-wrap">{usuario || "—"}</p>
      </td>

      {/* Teléfono */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-azul-950 whitespace-no-wrap">{telefonoMostrar}</p>
      </td>

      {/* Sexo (chip estilo snippet) */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <span className="relative inline-block px-3 py-1 font-semibold text-azul-950 leading-tight">
          <span aria-hidden className="absolute inset-0 bg-gray-200 opacity-50 rounded-full" />
          <span className="relative">{sexoMostrar}</span>
        </span>
      </td>

      {/* Acciones */}
      {mostrarAcciones && (
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
          <div className="flex items-center gap-2">

              <Link
                to={`/persona/edit/${id_persona}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-verde-600 text-white border rounded-md"
                title="Editar"
              >
                <Pencil className="w-4 h-4" />
                <span className="hidden sm:inline">Editar</span>
              </Link>

            <button
              type="button"
              onClick={() => onEliminar?.(persona)}
              disabled={eliminando}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md
                ${eliminando ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-rojo-600 text-white hover:opacity-90"}`}
              title="Eliminar"
            >
              {eliminando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Eliminando…</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Eliminar</span>
                </>
              )}
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}