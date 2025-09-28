import NavbarLanding from "../components/landing/NavbarLanding";
import Hero from "../components/landing/Hero";
import Compania from "../components/landing/Compania";
import Footer from "../components/comunes/Footer";
//import heroBg from "../../../assets/heroBg.webp";
//import reservasLinea from "../../../assets/reservas_en_linea.webp";
//import accesoQR from "../../../assets/acceso_qr.webp";
//import elegirHora from "../../../assets/elegir_horario.webp";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gris3 font-poppins">
      <NavbarLanding />
      <section id="hero" >
        <Hero />
      </section>

      <section id="empresa">
        <Compania />
      </section>

      <section id="contactos" >
        <Footer />
      </section>
    </div>
  );
};
