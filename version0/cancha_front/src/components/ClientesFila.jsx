/* eslint-disable no-unused-vars */
import { Link } from "react-router-dom";
import { Pencil, Trash2, Loader2, Eye } from "lucide-react";
import placeholder from "../assets/placeholder.jpeg";

const API_BASE = "http://localhost:3000";

export default function ClienteFila({
  cliente,
  onEliminar, // (cliente) => void
  eliminando = false,
  mostrarAcciones = true,
}) {
  const {
    id_cliente,
    nombre,
    apellido,
    telefono,
    correo,
    usuario,
    sexo,
    imagen_perfil,
  } = cliente || {};

  const nombreCompleto = `${nombre ?? ""} ${apellido ?? ""}`.trim() || "—";
  const srcImg = imagen_perfil ? `${API_BASE}${imagen_perfil}` : placeholder;

  return (
    <tr>
      {/* Imagen_perfil */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-12 h-12">
            <img
              className="w-full h-full rounded-full object-cover bg-gray-100 border border-gray-200"
              src={srcImg}
              alt={nombreCompleto}
              onError={(e) => {
                e.currentTarget.src = placeholder;
              }}
            />
          </div>
        </div>
      </td>

      {/* Nombre Completo */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-azul-950">
        {nombreCompleto}
      </td>

      {/* Teléfono */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        {telefono || "—"}
      </td>

      {/* Correo */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        {correo || "—"}
      </td>

      {/* Usuario */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        {usuario || "—"}
      </td>

      {/* Sexo */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        {sexo || "—"}
      </td>

      {/* Detalles */}
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
        <Link
          to={`/clientes/${id_cliente}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-azul-900 text-white rounded-md hover:opacity-90"
          title="Ver detalles"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Ver</span>
        </Link>
      </td>

      {/* Acciones */}
      {mostrarAcciones && (
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
          <div className="flex items-center gap-2">
            <Link
              to={`/clientes/edit/${id_cliente}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-verde-600 text-white border rounded-md"
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">Editar</span>
            </Link>

            <button
              type="button"
              onClick={() => onEliminar?.(cliente)}
              disabled={eliminando}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md ${
                eliminando
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-rojo-600 text-white hover:opacity-90"
              }`}
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
