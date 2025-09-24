import { Navbar } from "../../../components/Navbar";

export const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gris3">
      <Navbar />

      {/* Hero */}
      <section
        id="hero"
        className="flex flex-col items-center justify-center flex-1 text-center px-6 min-h-screen"
      >
        <h1 className="text-5xl font-bold text-azul1 mt-16">
          Reserva tu cancha fácil y rápido ⚽
        </h1>
        <p className="mt-6 text-lg text-gris1 max-w-xl">
          Con CanchaLic podrás encontrar, reservar y administrar tus espacios deportivos en segundos.
        </p>
        <button className="mt-8 bg-verde text-blanco px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition">
          Empieza ahora
        </button>
      </section>

      {/* Compañía */}
      <section id="compania" className="min-h-screen bg-blanco flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-azul1">Nuestra Compañía</h2>
        <p className="mt-4 max-w-2xl text-gris1 text-center">
          Información sobre la empresa, misión, visión, etc.
        </p>
      </section>

      {/* Contactos */}
      <section id="contactos" className="min-h-screen bg-gris2 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-azul1">Contáctanos</h2>
        <p className="mt-4 max-w-2xl text-gris1 text-center">
          Aquí irán formularios, imágenes o datos de contacto.
        </p>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gris1 text-sm">
        © 2025 CanchaLic. Todos los derechos reservados.
      </footer>
    </div>
  );
};
