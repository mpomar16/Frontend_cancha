import { Navbar } from "../../../components/Navbar";
import { Hero } from "../../../components/Hero";
import { Footer } from "../../../components/Footer";
import heroBg from "../../../assets/heroBg.webp";
import reservasLinea from "../../../assets/reservas_en_linea.webp";
import accesoQR from "../../../assets/acceso_qr.webp";
import elegirHora from "../../../assets/elegir_horario.webp";

export const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gris3 font-poppins">
      <Navbar />

      {/* Hero */}
      <section id="hero" >
        <Hero />
      </section>

      {/* Compañía */}
      <section
        id="compania"
        className="min-h-screen bg-blanco-50 flex flex-col justify-center px-6 lg:px-20 py-16"
      >
        {/*subsección: Te ofrecemos */}
        <div className="text-center mb-16 mt-26">
          <h2 className="text-3xl sm:text-4xl font-bold text-azul-950">
            Te Ofrecemos
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-azul-950">
            Una plataforma moderna que combina deporte y <br></br>
            tecnología para simplificar tus reservas.
          </p>
        </div>
        {/* Grid de imágenes */}
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="rounded-lg shadow-lg overflow-hidden bg-blanco-50">
            <img
              src={reservasLinea}
              alt="Reservas en linea"
              className="w-full h-56 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-verde-600">Reservas en línea</h3>
              <p className="mt-2 text-azul-950 text-sm">
                Realiza tus reservas de canchas y espacios deportivos en segundos desde nuestro sitio web o tu telefono móvil.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-lg shadow-lg overflow-hidden bg-blanco-50">
            <img
              src={accesoQR}
              alt="Reservas en linea"
              className="w-full h-56 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-verde-600">Acceso con QR seguro</h3>
              <p className="mt-2 text-azul-950 text-sm">
                Accede a tus reservas de forma rápida y confiable mediante un código QR único, sin necesidad de comprobantes impresos.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-lg shadow-lg overflow-hidden bg-blanco-50">
            <img
              src={elegirHora}
              alt="Reservas en linea"
              className="w-full h-56 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-verde-600">Gestion de horarios en tiempo real</h3>
              <p className="mt-2 text-azul-950 text-sm">
                Consulta la disponibilidad de canchas al instante y organiza tus reservas con una agenda siempre actualizada.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-sección: Misión y Visión */}
        <div className="mt-26 w-full mx-auto rounded-lg shadow-lg bg-azul-950 px-10">
          <div
            className="py-10
          grid
          divide-y divide-verde-600/100
          md:grid-cols-2 md:divide-y-0 md:divide-x
          text-blanco-50
        "
          >
            {/* Misión */}
            <div className=" sm:p-10 lg:p-12 content-center">
              <h3 className="text-3xl font-bold mb-2">Misión</h3>
              <span className="block h-1 w-16 bg-verde-600 mb-4" />
              <p className="text-gris-200 leading-relaxed">
                Facilitar el acceso a espacios deportivos mediante una plataforma
                tecnológica innovadora, que asegure reservas eficientes y un control
                de ingreso confiable con códigos QR, mejorando la administración y
                la experiencia de los usuarios.
              </p>
            </div>
            {/* Visión */}
            <div className="sm:p-10 lg:p-12 content-center">
              <h3 className="text-3xl font-bold mb-2">Visión</h3>
              <span className="block h-1 w-16 bg-verde-600 mb-4" />
              <p className="text-gris-200 leading-relaxed">
                Convertirnos en el sistema líder de reservas deportivas en Bolivia,
                reconocido por su seguridad, simplicidad y eficiencia, impulsando la
                modernización digital en la gestión de actividades deportivas.
              </p>
              <p className="text-azul-950 leading-relaxed">
                Convertirnos en el sistema líder de reservas deportivas en Bolivia.
              </p>
            </div>
          </div>
        </div>

        {/*Sub-seccion: Objetivos*/}
        <div className="mt-26 w-full mx-auto rounded-lg px-6 lg:px-8">
          {/* Encabezado */}
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="mt-2 text-3xl font-bold leading-tight text-azul-950 sm:text-4xl">
              Nuestros <span className="text-verde-600">Objetivos</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-azul-950">
              Construimos una plataforma moderna, segura y eficiente para la
              reserva y gestión de espacios deportivos.
            </p>
          </div>

          {/* Grid principal */}
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Izquierda: objetivos */}
            <div className="space-y-8">
              {/* Objetivo 1 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-verde-600 text-blanco-50 font-bold">
                  1
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-azul-950">
                    Simplificar reservas
                  </h4>
                  <p className="mt-1 text-azul-950">
                    Simplificar el proceso de reserva de espacios deportivos en web y móvil.
                  </p>
                </div>
              </div>

              {/* Objetivo 2 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-verde-600 text-blanco-50 font-bold">
                  2
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-azul-950">
                    Seguridad y control
                  </h4>
                  <p className="mt-1 text-azul-950">
                    Garantizar seguridad y control de acceso con códigos QR validados en tiempo real.
                  </p>
                </div>
              </div>

              {/* Objetivo 3 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-verde-600 text-blanco-50 font-bold">
                  3
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-azul-950">
                    Optimizar la administración
                  </h4>
                  <p className="mt-1 text-azul-950">
                    Optimizar horarios y canchas evitando duplicaciones y sobreuso.
                  </p>
                </div>
              </div>
            </div>

            {/* Derecha: imagen */}
            <div className="relative">
              {/* Glow animado detrás de la imagen */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-azul-950 to-azul-950 opacity-30 blur-3xl"></div>

              {/* Imagen principal */}
              <img
                src={heroBg}
                alt="Ilustración de objetivos"
                className="bg-blanco-50 relative w-full rounded-2xl shadow-xl object-cover"
              />
            </div>

          </div>
        </div>

      </section>


      {/* Contactos */}
      {/* Footer */}
      <section id="contactos" >
        <Footer />
      </section>
    </div>
  );
};
