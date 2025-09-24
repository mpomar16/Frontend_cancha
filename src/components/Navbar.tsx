import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-blanco shadow-sm font-poppins">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-azul1 flex items-center justify-center">
          <span className="text-blanco font-bold">C</span>
        </div>
        <span className="text-xl font-bold">
          Cancha<span className="text-verde">Lic</span>
        </span>
      </div>

      {/* Links */}
      <div className="hidden md:flex gap-8 text-gris1">
        <Link to="/" className="hover:text-azul1">Inicio</Link>
        <Link to="/features" className="hover:text-azul1">Features</Link>
        <Link to="/pricing" className="hover:text-azul1">Pricing</Link>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-gris1 hover:text-azul1">
          Sign in
        </Link>
        <button className="bg-verde text-blanco px-4 py-2 rounded-full font-semibold hover:opacity-90 transition">
          Get started
        </button>
      </div>
    </nav>
  );
};
