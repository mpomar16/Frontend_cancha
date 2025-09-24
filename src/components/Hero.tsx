import heroBg from "../assets/heroBg.jpg";

export const Hero = () => {
  return (
    <section
      className="font-poppins isolate bg-cover bg-center bg-no-repeat min-h-[100vh] flex items-center justify-center text-justify"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* Overlay oscuro encima de la imagen */}
      <div className="absolute inset-0 bg-azul-1/80"></div>

      {/* Contenido */}
      <div className="relative z-10 max-w-3xl px-4 text-left">
        <p className="mt-6 text-4xl sm:text-6xl font-bold text-blanco drop-shadow-lg">
          Un <span className="text-verde">CLICK</span> para reservar,
        </p>
        <p className="mt-6 text-4xl sm:text-6xl font-bold text-blanco drop-shadow-lg">
          Un <span className="text-verde">QR</span> para ingresar.
        </p>

        <p className="mt-6 text-xl sm:text-xl font-normal text-blanco drop-shadow">
          PlayPass te permite reservar canchas en segundos y acceder fácilmente con un código QR.
        </p>

        <div className="mt-8 flex items-center gap-4">
          <a
            href="#compania"
            className="rounded-md bg-verde px-6 py-3 text-base font-semibold text-blanco shadow hover:opacity-90 transition inline-flex items-center gap-2"
          >
            Reserva ahora →
          </a>
        </div>
      </div>

    </section>
  );
};
