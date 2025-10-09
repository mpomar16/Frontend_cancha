import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";

const API_BASE = "http://localhost:3000";

function EmpresaDropdown({ user }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleImageError = (e) => {
    e.target.src = "/default-avatar.png";
  };

  // 🔹 Si no recibimos props, intentamos leer de localStorage
  const nombre = user?.nombre || localStorage.getItem("nombre");
  const apellido = user?.apellido || localStorage.getItem("apellido");
  const usuario = user?.usuario || localStorage.getItem("usuario");
  const imagenPerfil =
    user?.imagen_perfil || localStorage.getItem("imagen_perfil");

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón: imagen */}
      <button onClick={() => setOpen(!open)} className="focus:outline-none">
        <img
          src={
            imagenPerfil ? `${API_BASE}${imagenPerfil}` : "/default-avatar.png"
          }
          alt="Perfil"
          className="h-10 w-10 rounded-full object-cover border-2 border-verde-600 cursor-pointer"
          onError={handleImageError}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-50">
          <div className="px-4 py-3 text-center">
            <p className="text-sm font-semibold text-azul-950">
              {nombre} {apellido}
            </p>
            <p className="text-sm text-gray-500">@{usuario}</p>
          </div>

          <div className="border-t border-gray-200">
            <a
              href="/mi-perfil"
              className="block px-4 py-2 text-sm text-gray-700 hover:text-verde-600"
            >
              Ver mi Perfil
            </a>
          </div>

          <div className="border-t border-gray-200">
            <p className="px-4 pt-2 text-xs font-semibold text-gray-400">
              Ir a Panel
            </p>
            <a
              href="/panel/encargado"
              className="block px-4 py-2 text-sm text-gray-700 hover:text-verde-600"
            >
              Ver Encargado
            </a>
            <a
              href="/panel/control"
              className="block px-4 py-2 text-sm text-gray-700 hover:text-verde-600"
            >
              Ver Control
            </a>
          </div>

          <div className="border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:text-verde-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default EmpresaDropdown;
