import { useState, useEffect, Children } from "react";
import { Link, Outlet } from "react-router-dom";
import { obtenerEmpresaNavbar } from "../services/empresaService";
import { Menu, X, Archive, ChevronDown, LogOut, CircleUserRound,
  Users,
  Volleyball,
  UserCircle2,
  Activity,
  MonitorCheck,
  Building2,
  ClipboardList,
  Dumbbell,
  FileWarning,
  CalendarCheck2,
  CreditCard,
  QrCode,
  MessageSquare,
  Star, } from "lucide-react";
import { usePerfil } from "../hooks/usePerfil";
import placeholder from "../assets/placeholder.jpeg";

const API_BASE = "http://localhost:3000";

const navLinksByRole = {
  DEFAULT: [
    { label: "Personas", href: "/personas", icon: Users },
    { label: "Espacios deportivos y canchas", href: "/espacios", icon: Volleyball, },
    { label: "Cliente", href: "#", icon: UserCircle2 },
    { label: "Deportista", href: "#", icon: Activity },
    { label: "Usuario_Control", href: "#", icon: MonitorCheck },
    { label: "Administradores de Espacios Deportivos", href: "#",icon: Building2, },
    { label: "Encargado", href: "#", icon: ClipboardList },
    { label: "Disciplina", href: "#", icon: Dumbbell },
    { label: "Reporte de Incidencia", href: "#", icon: FileWarning },
    { label: "Reserva", href: "#", icon: CalendarCheck2 },
    { label: "Pago", href: "#", icon: CreditCard },
    { label: "QR Reserva", href: "#", icon: QrCode },
    { label: "Comentario", href: "#", icon: MessageSquare },
    { label: "Ponderación", href: "#", icon: Star },
  ],
};

export default function Sidebar({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatboxOpen, setChatboxOpen] = useState(true);
  const [userOpen, setUserOpen] = useState(false);
  const [empresaData, setEmpresaData] = useState(null);

  //Datos de Empresa
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
  const handleImageError = (e) => {
    e.target.src = placeholder;
  };

  //Datos usuario
  const token = localStorage.getItem("token");
  const { persona, loading } = usePerfil(token);

  const nombre = persona?.nombre || "Usuario";
  const apellido = persona?.apellido || "";
  const correo = persona?.correo || "usuario@example.com";
  const imgRaw = persona?.imagen_perfil || "";
  const avatarSrc = imgRaw
    ? `${API_BASE}${imgRaw.startsWith("/") ? "" : "/"}${imgRaw}`
    : placeholder;

  const navLinks = navLinksByRole.DEFAULT;

  //logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className=" font-poppins min-h-screen">
      <button
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setIsOpen(v => !v)}
        className="fixed top-5 left-4 z-50 inline-flex items-center justify-center rounded-md bg-gray-900/90 p-2 text-white shadow lg:hidden"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <aside
        className={[
          "fixed top-0 bottom-0 left-0 z-40 w-64 overflow-y-auto bg-azul-950 p-2 text-center text-white transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
        aria-label="Sidebar de navegación"
      >
        <div className="text-xl">
          <div className="mt-1 flex items-center p-2.5">
            <span className="rounded-md">
              {empresaData?.logo_imagen && (
                <img
                  src={`${API_BASE}${empresaData.logo_imagen}`}
                  alt="Logo"
                  className="h-10 w-10 rounded-full object-cover"
                  onError={handleImageError}
                />
              )}
            </span>
            <h1 className="ml-3 text-xl font-bold text-white">{empresaData?.nombre_sistema || "Cargando..."}</h1>
          </div>
          <div className="h-px bg-gray-600" />
        </div>

        <div className="mt-3">
          <button
            onClick={() => setUserOpen(v => !v)}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-azul-900"
            aria-expanded={userOpen}
            aria-controls="user-submenu"
            disabled={loading}
          >
            <img
              src={avatarSrc}
              alt={nombre}
              className="h-10 w-10 rounded-full object-cover"
              onError={e => { e.currentTarget.src = placeholder; }}
            />
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center justify-between">
                <span className="truncate text-sm font-semibold text-white">
                  {`${nombre} ${apellido}`.trim()}
                </span>
                <ChevronDown
                  className={[
                    "ml-2 h-4 w-4 shrink-0 transition-transform text-white",
                    userOpen ? "rotate-180" : "rotate-0",
                  ].join(" ")}
                />
              </div>
              <span className="block truncate text-xs text-white">
                {correo}
              </span>
            </div>
          </button>
          <div
            id="user-submenu"
            className={[
              "mx-auto mt-2 w-[92%] text-left text-sm font-medium text-white transition-all",
              userOpen ? "max-h-40 opacity-100" : "max-h-0 overflow-hidden opacity-0",
            ].join(" ")}
          >
            <Link to="/mi-perfil" className="flex items-center justify-items-stretch rounded-md px-2 py-2 hover:bg-azul-900/30">
              <CircleUserRound size={20} className="mr-2" /> Ver mi Perfil
            </Link>
            <Link onClick={handleLogout} className="flex items-center justify-items-stretch rounded-md px-2 py-2 hover:bg-azul-900/30">
              <LogOut size={20} className="mr-2" /> Cerrar Sesión
            </Link>
          </div>
        </div>

        <div className="my-4 h-px bg-gray-600" />
        <div className="mt-3">
          <Link
            to={empresaData?.id_empresa ? `/empresa/${empresaData.id_empresa}` : "2"}
            className={`flex w-full items-center rounded-md px-4 py-2.5 text-left transition-colors
              ${empresaData?.id_empresa ? "text-white hover:bg-azul-900" : "text-white/50 cursor-not-allowed"}`}
            onClick={(e) => { if (!empresaData?.id_empresa) e.preventDefault(); }}
            aria-disabled={!empresaData?.id_empresa}
          >
            <Building2 className="h-5 w-5" />
            <span className="ml-4 w-full text-[15px] font-bold">
              Empresa
            </span>
          </Link>
        </div>

        <div className="mt-3">
          <button
            onClick={() => setChatboxOpen(v => !v)}
            className="flex w-full items-center rounded-md px-4 py-2.5 text-left text-white transition-colors hover:bg-azul-900"
            aria-expanded={chatboxOpen}
            aria-controls="submenu"
          >
            <Archive className="h-5 w-5" />
            <span className="ml-4 w-full text-[15px] font-bold text-white">Menú</span>
            <ChevronDown
              className={["h-4 w-4 transition-transform", chatboxOpen ? "rotate-180" : "rotate-0"].join(" ")}
            />
          </button>

          <div
            id="submenu"
            className={[
              "mx-auto mt-2 w-4/5 text-left text-sm font-bold text-white transition-all",
              chatboxOpen ? "max-h-50 opacity-100" : "max-h-0 overflow-hidden opacity-0",
            ].join(" ")}
          >
            {navLinks.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className="mt-1 flex w-full items-center rounded-md p-2 text-left hover:text-verde-600 hover:bg-azul-900/30"
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  <span className="ml-2">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </aside>

      <main className="ml-0 min-h-screen p-6 text-azul-950 lg:ml-64 bg-gray-100">
        <div className="mx-auto max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}


