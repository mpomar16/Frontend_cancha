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
        <header className="fixed top-0 left-0 w-full bg-azul-1 dark:bg-azul-1 shadow-sm font-poppins z-50">
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
                            `text-sm font-bold ${isActive ? "text-verde" : "text-blanco dark:text-blanco"
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
                                className={`w-5 h-5 text-blanco transition-transform ${productMenuOpen ? "rotate-180" : ""
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
                        className={`text-sm font-bold ${activeSection === "compania"
                            ? "text-verde"
                            : "text-blanco dark:text-blanco"
                            }`}
                    >
                        Compañia
                    </a>
                    <a
                        href="#contactos"
                        className={`text-sm font-bold ${activeSection === "contactos"
                            ? "text-verde"
                            : "text-blanco dark:text-blanco"
                            }`}
                    >
                        Contactos
                    </a>
                </div>

                {/* Login desktop */}
                <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-4">
                    {/* Sign In */}
                    <a
                        href="/login"
                        className="text-sm font-semibold text-verde hover:text-verde/80 transition"
                    >
                        Sign In
                    </a>

                    {/* Sign Up */}
                    <a
                        href="/signup"
                        className="text-sm font-semibold outline-2 outline-verde text-verde px-4 py-2 rounded-lg hover:opacity-90 transition"
                    >
                        Sign Up <span aria-hidden="true">&rarr;</span>
                    </a>
                </div>

            </nav>

            {/* NabvarMovil */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-azul-1 p-6 overflow-y-auto transition-all duration-300 ease-out">
                    {/* Header móvil */}
                    <div className="flex items-center justify-between animate-fade-in">
                        <span className="text-lg font-bold text-blanco">PlayPass</span>
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 text-blanco hover:text-verde transition-colors duration-200"
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

                    {/* Links del menú */}
                    <div className="mt-8 space-y-4">
                        {/* Inicio */}
                        <a
                            href="#"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-base font-semibold text-blanco hover:text-verde px-4 py-2 rounded-lg transition-colors duration-300"
                        >
                            Inicio
                        </a>

                        {/* Servicios */}
                        <details className="group">
                            <summary className="flex justify-between items-center cursor-pointer px-4 py-2 rounded-lg text-base font-semibold text-blanco hover:text-verde transition-colors duration-300">
                                Servicios
                                <svg
                                    className="w-5 h-5 ml-2 text-blanco transition-transform duration-300 group-open:rotate-180 group-open:text-verde"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </summary>
                            <div className="ml-10 mt-2 space-y-2 overflow-hidden transition-all duration-500 ease-in-out group-open:animate-accordion-down">
                                <a
                                    href="#"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block text-base text-blanco hover:text-verde transition-colors duration-300"
                                >
                                    Reservar Cancha
                                </a>
                                <a
                                    href="#"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block text-base text-blanco hover:text-verde transition-colors duration-300"
                                >
                                    Publicar Espacio Deportivo
                                </a>
                            </div>
                        </details>

                        {/* Compañía */}
                        <a
                            href="#compania"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-base font-semibold text-blanco hover:text-verde px-4 py-2 rounded-lg transition-colors duration-300"
                        >
                            Compañía
                        </a>

                        {/* Contactos */}
                        <a
                            href="#contactos"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-base font-semibold text-blanco hover:text-verde px-4 py-2 rounded-lg transition-colors duration-300"
                        >
                            Contactos
                        </a>
                    </div>

                    {/* Botones de acción */}
                    <div className="mt-8 flex flex-col gap-3 animate-fade-in">
                        <a
                            href="/signin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-center text-sm font-semibold px-4 py-2 rounded-lg bg-azul-1 text-verde hover:opacity-90 transition transition-all duration-300"
                        >
                            Sign In
                        </a>
                        <a
                            href="/signup"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-center text-sm font-semibold px-4 py-2 rounded-lg border border-verde text-verde hover:opacity-90 transition transition-all duration-300"
                        >
                            Sign Up <span aria-hidden="true">&rarr;</span>
                        </a>
                    </div>
                </div>
            )}

        </header>
    );
};
