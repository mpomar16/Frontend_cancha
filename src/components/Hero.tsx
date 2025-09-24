import heroBg from "../assets/heroBg.jpg"; // pon tu imagen en /src/assets

export const Hero = () => {
  return (
    <section
      className="relative isolate bg-cover bg-center bg-no-repeat min-h-[100vh] flex items-center justify-center text-center"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* Overlay oscuro encima de la imagen */}
      <div className="absolute inset-0 bg-azul-1/80"></div>

      {/* Contenido */}
      <div className="relative z-10 max-w-3xl px-6">
        <h1 className="text-4xl sm:text-6xl font-bold text-blanco drop-shadow-lg">
          Reserva tu cancha fácil y rápido ⚽
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gris2">
          Con <span className="font-semibold text-verde">PlayPass</span> podrás
          encontrar, reservar y administrar tus espacios deportivos en segundos.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#reservar"
            className="rounded-md bg-verde px-6 py-3 text-base font-semibold text-blanco shadow hover:opacity-90 transition"
          >
            Empieza ahora
          </a>
          <a
            href="#compania"
            className="text-base font-semibold text-blanco hover:text-verde transition"
          >
            Conoce más →
          </a>
        </div>
      </div>
    </section>
  );
};
