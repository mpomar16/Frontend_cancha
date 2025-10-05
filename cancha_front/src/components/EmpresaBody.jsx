const API_BASE = "http://localhost:3000";

function EmpresaBody({ data }) {
  if (!data) return <div>Cargando...</div>;

  // Función para manejar errores de carga de imágenes
  const handleImageError = (e) => {
    e.target.src = "/default-avatar.png";
  };

  // 🔹 Función para resaltar palabras clave
  const formatTitulo = (texto) => {
    if (!texto) return null;

    const parts = texto.split(/(CLICK|QR)/g);

    return parts.map((part, index) =>
      part === "CLICK" || part === "QR" ? (
        <span key={index} className="text-verde-600">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div>
      <section
        className="relative font-poppins isolate bg-cover bg-center bg-no-repeat min-h-[100vh] flex items-center justify-center h-screen"
        style={{
          backgroundImage: data.imagen_3
            ? `url(http://localhost:3000${data.imagen_3})`
            : "none",
        }}
      >
        <div className="absolute inset-0 bg-azul-950/90"></div>
        <div className="relative z-10 max-w-3xl px-4 text-left">
          <p className="mt-6 text-4xl sm:text-6xl font-bold text-blanco-50 drop-shadow-lg">
            {formatTitulo(data.titulo_h1)}
          </p>
          <p className="mt-6 text-xl sm:text-xl font-normal text-blanco-50 drop-shadow">
            {data.descripcion_h1}
          </p>
          <div className="mt-8 flex items-center gap-4">
            <a
              href="/login"
              className="rounded-md bg-verde-600 px-6 py-3 text-base font-semibold text-blanco-50 shadow hover:opacity-90 transition inline-flex items-center gap-2"
            >
              Reserva ahora →
            </a>
          </div>
        </div>
      </section>
      {/* Sección: Te Ofrecemos */}
      <section className="my-20 px-6 lg:px-20">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-azul-950">
            Te Ofrecemos
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-azul-950">
            {data.te_ofrecemos}
          </p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.imagen_1 && (
            <div className="rounded-lg shadow-lg overflow-hidden bg-blanco-50">
              <img
                src={`${API_BASE}${data.imagen_1}`}
                alt="Imagen 1"
                className="w-full h-56 object-cover"
                onError={handleImageError}
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-verde-600">
                  {data.titulo_1}
                </h3>
                <p className="mt-2 text-azul-950 text-sm">{data.descripcion_1}</p>
              </div>
            </div>
          )}

          {data.imagen_2 && (
            <div className="rounded-lg shadow-lg overflow-hidden bg-blanco-50">
              <img
                src={`${API_BASE}${data.imagen_2}`}
                alt="Imagen 2"
                className="w-full h-56 object-cover"
                onError={handleImageError}
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-verde-600">
                  {data.titulo_2}
                </h3>
                <p className="mt-2 text-azul-950 text-sm">{data.descripcion_2}</p>
              </div>
            </div>
          )}

          {data.imagen_3 && (
            <div className="rounded-lg shadow-lg overflow-hidden bg-blanco-50">
              <img
                src={`${API_BASE}${data.imagen_3}`}
                alt="Imagen 3"
                className="w-full h-56 object-cover"
                onError={handleImageError}
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-verde-600">
                  {data.titulo_3}
                </h3>
                <p className="mt-2 text-azul-950 text-sm">{data.descripcion_3}</p>
              </div>
            </div>
          )}
        </div>
      </section>
      {/* Sección: Misión y Visión */}
      <section className="max-w-[89vw] mt-20 mx-auto rounded-lg shadow-lg bg-azul-950 px-6 lg:px-20">
        <div
          className="py-10
      grid
      divide-y divide-verde-600/100
      md:grid-cols-2 md:divide-y-0 md:divide-x
      text-blanco-50
    "
        >
          {/* Misión */}
          <div className="sm:p-10 lg:p-12 content-center">
            <h3 className="text-3xl font-bold mb-2">Misión</h3>
            <span className="block h-1 w-16 bg-verde-600 mb-4" />
            <p className="text-gris-200 leading-relaxed">
              {data.mision}
            </p>
          </div>

          {/* Visión */}
          <div className="sm:p-10 lg:p-12 content-center">
            <h3 className="text-3xl font-bold mb-2">Visión</h3>
            <span className="block h-1 w-16 bg-verde-600 mb-4" />
            <p className="text-gris-200 leading-relaxed">
              {data.vision}
            </p>
          </div>
        </div>
      </section>

      {/* Sección: Objetivos */}
      <section className="mt-20 max-w-[89vw] mx-auto rounded-lg px-6 lg:px-8 mb-20">
        {/* Encabezado */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="mt-2 text-3xl font-bold leading-tight text-azul-950 sm:text-4xl">
            Nuestros <span className="text-verde-600">Objetivos</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-azul-950">
            {data.nuestro_objetivo}
          </p>
        </div>

        {/* Grid principal */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Izquierda: lista de objetivos */}
          <div className="space-y-8">
            {data.objetivo_1 && (
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-verde-600 text-blanco-50 font-bold">
                  1
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-azul-950">Objetivo 1</h4>
                  <p className="mt-1 text-azul-950">{data.objetivo_1}</p>
                </div>
              </div>
            )}

            {data.objetivo_2 && (
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-verde-600 text-blanco-50 font-bold">
                  2
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-azul-950">Objetivo 2</h4>
                  <p className="mt-1 text-azul-950">{data.objetivo_2}</p>
                </div>
              </div>
            )}

            {data.objetivo_3 && (
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-verde-600 text-blanco-50 font-bold">
                  3
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-azul-950">Objetivo 3</h4>
                  <p className="mt-1 text-azul-950">{data.objetivo_3}</p>
                </div>
              </div>
            )}
          </div>

          {/* Derecha: imagen hero */}
          <div className="relative">
            {/* Glow animado detrás */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-azul-950 to-azul-950 opacity-30 blur-3xl"></div>

            {/* Imagen dinámica desde la BD */}
            {data.imagen_3 && (
              <img
                src={`${API_BASE}${data.imagen_3}`}
                alt="Ilustración de objetivos"
                className="bg-blanco-50 relative w-full rounded-2xl shadow-xl object-cover"
                onError={(e) => (e.target.src = "/default-avatar.png")}
              />
            )}
          </div>
        </div>
      </section>


    </div>
  );
}

export default EmpresaBody;
