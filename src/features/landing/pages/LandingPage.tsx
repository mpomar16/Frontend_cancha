import { Navbar } from "../../../components/Navbar";
import { Hero } from "../../../components/Hero";

export const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gris3">
      <Navbar />

      {/* Hero */}
      <section
        id="hero"
      >
        {/* Hero */}
      <Hero />
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
