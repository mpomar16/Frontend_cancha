import { useState, useEffect } from "react";
import { obtenerEmpresaNavbar } from "../services/empresaService";
import EmpresaDropdown from "./EmpresaDropDown";
import { HamburgerIcon } from "lucide-react";

const API_BASE = "http://localhost:3000";

const navLinksByRole = {
  DEFAULT: [
    { label: "Inicio", href: "/espacios/cercanos" },
    { label: "Mis Reservas", href: "#" },
    { label: "Publicar mi Espacio", href: "#" },
  ],
  ADMIN_ESP_DEP: [
    { label: "Mis Espacios", href: "#" },
    { label: "Ver Personal", href: "#" },
  ],
};

function EmpresaNavbar() {
  const [empresaData, setEmpresaData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 🔹 Obtener roles y datos de usuario desde localStorage
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const userData = {
    nombre: localStorage.getItem("nombre"),
    apellido: localStorage.getItem("apellido"),
    usuario: localStorage.getItem("usuario"),
    imagen_perfil: localStorage.getItem("imagen_perfil"),
  };

  // 🔹 Rol activo (inicia según roles del usuario)
  const [activeRole, setActiveRole] = useState(
    roles.includes("ADMIN_ESP_DEP") ? "ADMIN_ESP_DEP" : "DEFAULT"
  );

  // 🔹 Toggle entre roles
  const handleToggleRole = () => {
    if (activeRole === "ADMIN_ESP_DEP") {
      setActiveRole("DEFAULT"); // Cambia a reservas
    } else if (roles.includes("ADMIN_ESP_DEP")) {
      setActiveRole("ADMIN_ESP_DEP"); // Cambia a admin
    }
  };

  // 🔹 Cargar datos de empresa
  useEffect(() => {
    async function fetchNavbarData() {
      try {
        const response = await obtenerEmpresaNavbar();
        setEmpresaData(response.data);
      } catch (error) {
        console.error("Error cargando datos de empresa:", error);
      }
    }
    fetchNavbarData();
  }, []);

  // 🔹 Definir links según rol activo
  const navLinks = navLinksByRole[activeRole] || navLinksByRole.DEFAULT;

  // 🔹 Fallback imagen
  const handleImageError = (e) => {
    e.target.src = "/default-avatar.png";
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-azul-950 shadow-sm font-poppins z-50">
      <nav className="bg-azul-950 mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo dinámico */}
        <div className="flex lg:flex-1 items-center">
          <a href="/" className="-m-1.5 p-1.5 flex items-center">
            {empresaData?.logo_imagen && (
              <img
                src={`${API_BASE}${empresaData.logo_imagen}`}
                alt="Logo"
                className="h-10 w-10 rounded-full object-cover"
                onError={handleImageError}
              />
            )}
            <span className="ml-3 text-xl font-bold text-blanco-50">
              {empresaData?.nombre_sistema || "Cargando..."}
            </span>
          </a>
        </div>

        {/* Links desktop */}
        <div className="hidden lg:flex lg:gap-x-12 relative">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition hover:-translate-y-1 hover:scale-110 hover:text-verde-600 text-sm font-bold text-blanco-50"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Botón de toggle + Dropdown */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-4">
          {roles.includes("ADMIN_ESP_DEP") &&
            roles.some((r) =>
              ["CLIENTE", "ENCARGADO", "DEPORTISTA", "CONTROL"].includes(r)
            ) && (
              <button
                onClick={handleToggleRole}
                className="ml-4 px-3 py-1 text-sm rounded-lg border border-verde-600 text-verde-600 hover:bg-verde-600 hover:text-blanco-50 transition"
              >
                {activeRole === "ADMIN_ESP_DEP"
                  ? "Cambiar a Reservas"
                  : "Cambiar a Administración"}
              </button>
            )}

          <EmpresaDropdown user={userData} />
        </div>

        {/* Botón hamburguesa móvil */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-blanco-50"
          >
            <svg
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              className="w-6 h-6"
            >
              <path
                d="M4 6h16M4 12h16M4 18h16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-azul-950 p-6 overflow-y-auto">
          {/* Header móvil */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-blanco-50">
              {empresaData?.nombre_sistema || "Cargando..."}
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-blanco-50 hover:text-verde-600 transition"
            >
              <svg
                viewBox="0 0 24 24"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                className="w-6 h-6"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Links móviles */}
          <div className="mt-8 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-semibold text-blanco-50 hover:text-verde-600"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Botón toggle de rol (solo si tiene ambos) */}
          {roles.includes("ADMIN_ESP_DEP") &&
            roles.some((r) =>
              ["CLIENTE", "ENCARGADO", "DEPORTISTA", "CONTROL"].includes(r)
            ) && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleToggleRole}
                  className="px-4 py-2 text-sm rounded-lg border border-verde-600 text-verde-600 hover:bg-verde-600 hover:text-blanco-50 transition"
                >
                  {activeRole === "ADMIN_ESP_DEP"
                    ? "Cambiar a Reservas"
                    : "Cambiar a Administración"}
                </button>
              </div>
            )}

          {/* Foto perfil con dropdown en móvil */}
          <div className="mt-8 flex justify-center">
            <EmpresaDropdown user={userData} />
          </div>
        </div>
      )}

    </header>
  );
}

export default EmpresaNavbar;
