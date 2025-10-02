import { useState, useEffect } from "react";
import { obtenerEmpresaNavbar } from "../services/empresaService";

const API_BASE = "http://localhost:3000";

function EmpresaNavbarCasual() {
  const [empresaData, setEmpresaData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(false);

  // cargar info de empresa (logo, nombre, etc.)
  useEffect(() => {
    async function fetchNavbarData() {
      try {
        const response = await obtenerEmpresaNavbar();
        setEmpresaData(response.data); // 👈 importante: en tus services, los datos vienen dentro de "data"
      } catch (error) {
        console.error("Error cargando datos de empresa:", error);
      }
    }
    fetchNavbarData();
  }, []);

  // fallback de imagen
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

        {/* Botón hamburguesa (móvil) */}
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

        {/* Links desktop */}
        <div className="hidden lg:flex lg:gap-x-12 relative">
          <a
            href="#hero"
            className="transition hover:-translate-y-1 hover:scale-110 hover:text-verde-600 text-sm font-bold text-blanco-50"
          >
            Inicio
          </a>

          {/* Producto con dropdown */}
          <div className="relative">
            <button
              onClick={() => setProductMenuOpen(!productMenuOpen)}
              className="transition flex items-center gap-x-1 text-sm font-bold text-blanco-50 hover:text-verde-600"
            >
              Producto
              <svg
                viewBox="0 -1 20 20"
                fill="currentColor"
                className={`w-5 h-5 transition-transform ${
                  productMenuOpen ? "rotate-180" : ""
                }`}
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.72-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {productMenuOpen && (
              <div className="absolute left-0 mt-3 w-56 rounded-lg bg-azul-950 shadow-xl ring-1 ring-gris-300/10">
                <div className="p-4 space-y-3">
                  <a
                    href="#"
                    className="block text-sm font-medium text-blanco-50 hover:text-verde-600"
                  >
                    Publicar Espacio Deportivo
                  </a>
                  <a
                    href="#"
                    className="block text-sm font-medium text-blanco-50 hover:text-verde-600"
                  >
                    Reservar Cancha
                  </a>
                </div>
              </div>
            )}
          </div>

          <a
            href="#empresa"
            className="transition hover:-translate-y-1 hover:scale-110 hover:text-verde-600 text-sm font-bold text-blanco-50"
          >
            Compañía
          </a>
          <a
            href="#contactos"
            className="transition hover:-translate-y-1 hover:scale-110 hover:text-verde-600 text-sm font-bold text-blanco-50"
          >
            Contactos
          </a>
        </div>

        {/* Login desktop */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-4">
          <a
            href="/login"
            className="text-sm font-semibold text-verde-600 hover:text-verde-600/80 transition"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="text-sm font-semibold border-2 border-verde-600 outline-2 outline-verde-600 text-verde-600 px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            Sign Up <span aria-hidden="true">&rarr;</span>
          </a>
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

          {/* Links */}
          <div className="mt-8 space-y-4">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-blanco-50 hover:text-verde-600"
            >
              Inicio
            </a>
            <a
              href="#empresa"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-blanco-50 hover:text-verde-600"
            >
              Compañía
            </a>
            <a
              href="#contactos"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-blanco-50 hover:text-verde-600"
            >
              Contactos
            </a>
          </div>

          {/* Botones acción */}
          <div className="mt-8 flex flex-col gap-3">
            <a
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-verde-600 hover:text-verde-600/80 transition"
            >
              Sign In
            </a>
            <a
              href="/registro"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold border-2 border-verde-600 outline-2 outline-verde-600 text-verde-600 px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              Sign Up <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
export default EmpresaNavbarCasual;