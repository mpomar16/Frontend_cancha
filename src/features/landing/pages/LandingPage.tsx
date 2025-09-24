import { Navbar } from "../../../components/Navbar";

export const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gris3">
      {/* Navbar fijo arriba */}
      <Navbar />

      {/* Contenido principal de la landing */}
      <main className="flex flex-col items-center justify-center flex-1 text-center px-6">
        <h1 className="text-5xl font-bold text-azul1 mt-16">
          Reserva tu cancha fácil y rápido ⚽
        </h1>
        <p className="mt-6 text-lg text-gris1 max-w-xl">
          Con CanchaLic podrás encontrar, reservar y administrar tus espacios deportivos en segundos.
        </p>
        <button className="mt-8 bg-verde text-blanco px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition">
          Empieza ahora
        </button>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gris1 text-sm">
        © 2025 CanchaLic. Todos los derechos reservados.
      </footer>
    </div>
  );
};
