import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import { useEffect, useState } from "react";

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.6 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <header className="bg-azul-1 dark:bg-azul-1 shadow-sm font-poppins">
      <nav className="bg-azul-1 mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5 flex items-center">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
            <span className="ml-3 text-xl font-bold text-blanco dark:blanco">
              PlayPass
            </span>
          </a>
        </div>

        {/* Botón hamburguesa (móvil) */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-blanco dark:text-blanco"
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
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-bold ${
                isActive ? "text-verde" : "text-blanco dark:text-blanco"
              }`
            }
          >
            Inicio
          </NavLink>

          {/* Servicios con dropdown */}
          <div className="relative">
            <button
              onClick={() => setProductMenuOpen(!productMenuOpen)}
              className="flex items-center gap-x-1 text-sm font-bold text-blanco dark:text-blanco"
            >
              Producto
              <svg
                viewBox="0 -1 20 20"
                fill="currentColor"
                className={`w-5 h-5 text-blanco transition-transform ${
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
              <div className="absolute left-0 mt-3 w-56 rounded-lg bg-azul-1 dark:azul-2 shadow-xl ring-3 ring-gris-1/10 outline-2 outline-azul-2">
                <div className="p-4 space-y-3">
                  <a
                    href="#"
                    className="block text-sm font-medium text-blanco dark:text-blanco hover:text-verde"
                  >
                    Publicar Espacio Deportivo
                  </a>
                  <a
                    href="#"
                    className="block text-sm font-medium text-blanco dark:text-blanco hover:text-verde"
                  >
                    Reservar Cancha
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Otros links */}
          <a
            href="#compania"
            className={`text-sm font-bold ${
              activeSection === "compania"
                ? "text-verde"
                : "text-blanco dark:text-blanco"
            }`}
          >
            Compañia
          </a>
          <a
            href="#contactos"
            className={`text-sm font-bold ${
              activeSection === "contactos"
                ? "text-verde"
                : "text-blanco dark:text-blanco"
            }`}
          >
            Contactos
          </a>
        </div>

        {/* Login desktop */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <a
            href="#"
            className="text-sm font-semibold text-blanco dark:text-blanco"
          >
            Log in <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </nav>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-blanco dark:bg-blanco p-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-blanco dark:text-blanco">
              CanchaLic
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-gray-700 dark:text-gray-400"
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

          <div className="mt-6 space-y-4">
            <a href="#" className="block text-base font-semibold text-blanco dark:text-blanco">
              Product
            </a>
            <a href="#" className="block text-base font-semibold text-blanco dark:text-blanco">
              Features
            </a>
            <a href="#" className="block text-base font-semibold text-blanco dark:text-blanco">
              Marketplace
            </a>
            <a href="#compania" className="block text-base font-semibold text-blanco dark:text-blanco">
              Compañia
            </a>
            <a href="#contactos" className="block text-base font-semibold text-blanco dark:text-blanco">
              Contactos
            </a>
            <a href="#" className="block text-base font-semibold text-blanco dark:text-blanco">
              Log in
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
