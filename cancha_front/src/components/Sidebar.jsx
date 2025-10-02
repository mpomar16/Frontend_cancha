/* eslint-disable no-unused-vars */
import { useState } from "react";
import { LogOut } from "lucide-react"; // Icono de logout
import EmpresaDropdown from "./EmpresaDropDown"; // puedes reutilizar este para perfil si quieres

const API_BASE = "http://localhost:3000";

const navLinksByRole = {
  DEFAULT: [
    { label: "Inicio", href: "/espacios/cercanos" },
    { label: "Mis Reservas", href: "#" },
    { label: "Publicar mi Espacio", href: "#" },
  ],
  ADMIN_ESP_DEP: [
    { label: "Inicio", href: "/espacios" },
    { label: "Mis Espacios", href: "#" },
    { label: "Ver Personal", href: "#" },
  ],
  ADMINISTRADOR: [
    { label: "Panel de Personas", href: "/personas" },
    { label: "Reportes", href: "#" },
  ]
};

function SideBar() {
  const [open, setOpen] = useState(true);

  // 🔹 Datos de usuario desde localStorage
  const userData = {
    nombre: localStorage.getItem("nombre"),
    apellido: localStorage.getItem("apellido"),
    usuario: localStorage.getItem("usuario"),
    imagen_perfil: localStorage.getItem("imagen_perfil"),
    roles: JSON.parse(localStorage.getItem("roles") || "[]"),
  };

  // 🔹 Determinar qué links mostrar según rol
  let navLinks = navLinksByRole.DEFAULT;
  if (userData.roles.includes("ADMIN_ESP_DEP")) {
    navLinks = navLinksByRole.ADMIN_ESP_DEP;
  }
  if (userData.roles.includes("ADMINISTRADOR")) {
    navLinks = navLinksByRole.ADMINISTRADOR;
  }

  const handleImageError = (e) => {
    e.target.src = "/default-avatar.png";
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-64 bg-azul-950 text-white shadow-lg transform transition-transform duration-300 z-40
      ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Header con datos del usuario */}
      <div className="flex flex-col items-center py-6 border-b border-gray-700">
        <img
          src={
            userData.imagen_perfil
              ? `${API_BASE}${userData.imagen_perfil}`
              : "/default-avatar.png"
          }
          alt="Perfil"
          className="h-16 w-16 rounded-full border-2 border-verde-600 object-cover"
          onError={handleImageError}
        />
        <p className="mt-2 text-lg font-semibold">
          {userData.nombre} {userData.apellido}
        </p>
        <p className="text-sm text-gray-400">@{userData.usuario}</p>
      </div>

      {/* Opciones de navegación */}
      <nav className="flex flex-col mt-6 space-y-2 px-4">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="px-4 py-2 rounded hover:bg-verde-600 hover:text-white transition"
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Botón de logout */}
      <div className="absolute bottom-4 left-0 w-full px-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 rounded bg-red-500 hover:bg-red-600 transition"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

export default SideBar;
