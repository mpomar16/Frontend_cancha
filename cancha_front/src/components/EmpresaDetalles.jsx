/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Building2, Pencil } from "lucide-react";
import Alerta from "../components/Alerta";
import { obtenerEmpresaPorId } from "../services/empresaService";
import { armarImagenUrl } from "../hooks/EmpresaImagenes";
import placeholder from "../assets/placeholder.jpeg";

function EmpresaDetalles() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  // roles seguros
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdmin = Array.isArray(roles) && roles.includes("ADMINISTRADOR");

  const [empresa, setEmpresa] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorAlert, setErrorAlert] = useState({ open: false, msg: "" });

  const empresaId = Number(id);

  useEffect(() => {
    async function fetchEmpresa() {
      try {
        if (!token) return;
        if (!Number.isInteger(empresaId)) throw new Error("ID inválido");
        const response = await obtenerEmpresaPorId(empresaId, token);
        setEmpresa(response.data);
      } catch (err) {
        const msg = err?.message || "No se pudo cargar la empresa.";
        setErrorAlert({ open: true, msg });
      } finally {
        setCargando(false);
      }
    }
    fetchEmpresa();
  }, [empresaId, token]);


  return (
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="flex items-center text-2xl font-poppins font-bold text-azul-950">
            <Building2 className="mr-3" />
            Empresa
          </h1>

          {isAdmin && Number.isInteger(empresaId) && (
            <Link
              to={`/empresa/edit/${empresaId}`}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto h-10 px-4 rounded-lg bg-verde-600 text-white font-medium hover:bg-azul-900 active:scale-[0.99] transition"
            >
              <Pencil className="w-4 h-4" />
              <span className="sm:inline">Editar</span>
            </Link>
          )}
        </div>

        {/* Alerts */}
        {errorAlert.open && (
          <div className="mb-3">
            <Alerta
              open
              display="inline"
              variant="error"
              title="Ocurrió un error"
              message={errorAlert.msg}
              onClose={() => setErrorAlert({ open: false, msg: "" })}
            />
          </div>
        )}

        {/* Contenido */}
        {cargando ? (
          <div className="text-sm text-gray-600">Cargando...</div>
        ) : !empresa ? (
          <div className="text-sm text-gray-600">No se encontró la empresa.</div>
        ) : (
          <>
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <article className="rounded-xl border border-gray-200 bg-white shadow p-4 flex flex-col">
                  <div className="flex flex-1 items-center justify-center">
                    <h2 className="text-xl font-poppins font-bold text-azul-950 break-words">
                      {empresa.nombre_sistema || "-"}
                    </h2>
                  </div>
                  <figcaption className="mt-3 text-sm uppercase tracking-wide text-verde-600 text-center">
                    Nombre del Sistema
                  </figcaption>
                </article>
                {/* Tarjeta: Imagen / Logo */}
                <figure className="rounded-xl border border-gray-200 bg-white shadow p-4 flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center">
                    {empresa.logo_imagen ? (
                      <img
                        src={armarImagenUrl(empresa.logo_imagen, placeholder)}
                        alt={`Logo de ${empresa.nombre_sistema || "la empresa"}`}
                        className="bg-azul-950 p-3 w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gray-100 border border-gray-200" />
                    )}
                  </div>
                  <figcaption className="mt-3 text-sm uppercase tracking-wide text-verde-600 text-center">
                    Logo
                  </figcaption>
                </figure>
              </div>
              <figure className="rounded-2xl border border-gray-200 bg-white shadow overflow-hidden mb-6">
                <div className="w-full aspect-[16/6]">
                  {empresa.imagen_hero ? (
                    <img
                      src={armarImagenUrl(empresa.imagen_hero, placeholder)}
                      alt={`Imagen hero de ${empresa.nombre_sistema || "la empresa"}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 border-t border-gray-200" />
                  )}
                </div>
                <figcaption className="px-4 py-3 text-sm uppercase tracking-wide text-verde-600 text-center">
                  Imagen hero
                </figcaption>
              </figure>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <article className="rounded-xl border border-gray-200 bg-white shadow p-4 flex flex-col">
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-lg font-semibold text-azul-950">
                      {empresa.fecha_registrado
                        ? new Date(empresa.fecha_registrado).toLocaleDateString("es-BO", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        : "-"}
                    </p>
                  </div>
                  <figcaptionp className="mt-3 text-sm uppercase tracking-wide text-verde-600 text-center">
                    Fecha registrado
                  </figcaptionp>
                </article>
                {/* Eslogan (Título H1) */}
                <article className="rounded-xl border border-gray-200 bg-white shadow p-4 flex flex-col">
                  <div className="flex flex-1 items-center justify-center">
                    <h3 className="text-lg font-semibold text-azul-950 break-words">
                      {empresa.titulo_h1 || empresa.tituloH1 || "-"}
                    </h3>
                  </div>
                  <figcaptionp className="mt-3 text-sm uppercase tracking-wide text-verde-600 text-center">
                    Eslogan
                  </figcaptionp>
                </article>

                {/* Descripción H1 */}
                <article className="rounded-xl border border-gray-200 bg-white shadow p-4 flex flex-col">
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-base text-gray-800 break-words">
                      {empresa.descripcion_h1 || empresa.descripcionH1 || "-"}
                    </p>
                  </div>
                  <figcaptionp className="mt-3 text-sm uppercase tracking-wide text-verde-600 text-center">
                    Descripción
                  </figcaptionp>
                </article>
              </div>

              {/* TE OFRECEMOS: contenedor completo */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow p-4 sm:p-6 mb-6">
                {/* Título + texto principal */}
                <div className="mb-4 flex flex-1 items-center justify-center gap-4">
                  <h3 className="text-sm uppercase tracking-wide text-verde-600">Te ofrecemos:</h3>
                  <p className="text-gray-800">
                    {empresa.te_ofrecemos || "-"}
                  </p>
                </div>

                {/* Grid de tarjetas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {empresa.imagen_1 && (
                    <article className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                      <div className="relative group w-full h-48 md:h-56">
                        {(() => {
                          const alt1 = `Imagen 1`;
                          return (
                            <>
                              <img
                                src={armarImagenUrl(empresa.imagen_1, placeholder)}
                                alt={alt1}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              {/* Overlay tooltip */}
                              <div className="bg-azul-900 pointer-events-none absolute inset-x-2 bottom-2 rounded-lg text-verde-600 uppercase text-sm px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {alt1}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      <div className="p-4">
                        <p className="text-sm uppercase tracking-wide text-verde-600">Título 1</p>
                        <p className="text-base font-semibold text-azul-950 mb-2">
                          {empresa.titulo_1 || "-"}
                        </p>
                        <p className="text-sm uppercase tracking-wide text-verde-600">Descripción 1</p>
                        <p className="text-gray-800">{empresa.descripcion_1 || "-"}</p>
                      </div>
                    </article>
                  )}
                  {empresa.imagen_2 && (
                    <article className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                      <div className="relative group w-full h-48 md:h-56">
                        {(() => {
                          const alt2 = `Imagen 2`;
                          return (
                            <>
                              <img
                                src={armarImagenUrl(empresa.imagen_2, placeholder)}
                                alt={alt2}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              {/* Overlay tooltip */}
                              <div className="bg-azul-900 pointer-events-none absolute inset-x-2 bottom-2 rounded-lg text-verde-600 uppercase text-sm px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {alt2}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      <div className="p-4">
                        <p className="text-sm uppercase tracking-wide text-verde-600">Título 2</p>
                        <p className="text-base font-semibold text-azul-950 mb-2">
                          {empresa.titulo_2 || "-"}
                        </p>
                        <p className="text-sm uppercase tracking-wide text-verde-600">Descripción 2</p>
                        <p className="text-gray-800">{empresa.descripcion_2 || "-"}</p>
                      </div>
                    </article>
                  )}
                  {empresa.imagen_3 && (
                    <article className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                      <div className="relative group w-full h-48 md:h-56">
                        {(() => {
                          const alt3 = `Imagen 3`;
                          return (
                            <>
                              <img
                                src={armarImagenUrl(empresa.imagen_3, placeholder)}
                                alt={alt3}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              {/* Overlay tooltip */}
                              <div className="bg-azul-900 pointer-events-none absolute inset-x-2 bottom-2 rounded-lg text-verde-600 uppercase text-sm px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {alt3}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      <div className="p-4">
                        <p className="text-sm uppercase tracking-wide text-verde-600">Título 3</p>
                        <p className="text-base font-semibold text-azul-950 mb-2">
                          {empresa.titulo_3 || "-"}
                        </p>
                        <p className="text-sm uppercase tracking-wide text-verde-600">Descripción 3</p>
                        <p className="text-gray-800">{empresa.descripcion_3 || "-"}</p>
                      </div>
                    </article>
                  )}
                </div>
              </div>
              {/* Misión + Visión en dos columnas responsivas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Tarjeta: Misión */}
                <article className="rounded-xl border border-gray-200 bg-white shadow p-4 flex flex-col">
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-base text-azul-950 whitespace-pre-line break-words">
                      {empresa.mision || "-"}
                    </p>
                  </div>
                  <figcaption className="mt-3 text-sm uppercase tracking-wide text-verde-600 text-center">Misión</figcaption>
                </article>

                {/* Tarjeta: Visión */}
                <article className="rounded-xl border border-gray-200 bg-white shadow p-4 flex flex-col">
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-base text-azul-950 whitespace-pre-line break-words">
                      {empresa.vision || "-"}
                    </p>
                  </div>
                  <figcaption className="mt-3 text-sm uppercase tracking-wide text-verde-600 text-center">Visión</figcaption>
                </article>
              </div>

              <section className="rounded-2xl border border-gray-200 bg-white shadow p-4 sm:p-6 mb-6">
                {/* Título + texto general */}
                <div className="mb-4 flex flex-1 items-center justify-center gap-4">
                  <h3 className="text-sm uppercase tracking-wide text-verde-600">Nuestro objetivo:</h3>
                  <p className="text-gray-800">
                    {empresa.nuestro_objetivo || "-"}
                  </p>
                </div>

                {/* Grid de objetivos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[empresa.objetivo_1, empresa.objetivo_2, empresa.objetivo_3]
                    .filter(Boolean)
                    .map((obj, i) => (
                      <article
                        key={`obj-${i}`}
                        className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 flex items-start gap-3"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-verde-600 text-white text-xs font-bold">
                          {i + 1}
                        </span>
                        <p className="text-gray-800 break-words">{obj}</p>
                      </article>
                    ))}

                  {/* Si no hay ninguno, muestra un placeholder */}
                  {!empresa.objetivo_1 && !empresa.objetivo_2 && !empresa.objetivo_3 && (
                    <div className="col-span-full text-gray-500">-</div>
                  )}
                </div>
              </section>
              {/* Quiénes somos + Contacto */}
              <section className="rounded-2xl border border-gray-200 bg-white shadow p-4 sm:p-6 mb-6">
                {/*Quiénes somos */}
                <div className="mb-4">
                  <article className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col">
                    <div className="flex flex-1 items-center justify-center">
                      <p className="text-base text-gray-800 whitespace-pre-line break-words">
                        {empresa.quienes_somos || "-"}
                      </p>
                    </div>
                      <figcaptionp className="mt-3 text-sm uppercase tracking-wide text-verde-600 text-center">Quiénes somos</figcaptionp>
                  </article>
                </div>

                {/* Fila 2: Correo, Teléfono, Dirección (3 en línea responsivo) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Correo */}
                  <article className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col">
                    <div className="flex flex-1 items-center justify-center">
                      {empresa.correo_empresa ? (
                        <p
                          className="text-base font-semibold text-azul-950 break-all"
                        >
                          {empresa.correo_empresa}
                        </p>
                      ) : (
                        <p className="text-base text-gray-800">-</p>
                      )}
                    </div>
                      <p className="mt-3 text-sm uppercase tracking-wide text-verde-600 text-center">Correo empresa</p>
                  </article>

                  {/* Teléfono */}
                  <article className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col">
                    <div className="flex flex-1 items-center justify-center">
                      {empresa.telefono ? (
                        <p
                          className="text-base font-semibold text-azul-950 break-all"
                        >
                          {empresa.telefono}
                        </p>
                      ) : (
                        <p className="text-base text-gray-800">-</p>
                      )}
                    </div>
                      <p className="mt-3 text-sm uppercase tracking-wide text-verde-600 text-center">Telefono empresa</p>
                  </article>

                  {/* Dirección */}
                  <article className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col">
                    <div className="flex flex-1 items-center justify-center">
                      {empresa.direccion ? (
                        <p
                          className="text-base font-semibold text-azul-950 break-all"
                        >
                          {empresa.direccion}
                        </p>
                      ) : (
                        <p className="text-base text-gray-800">-</p>
                      )}
                    </div>
                      <p className="mt-3 text-sm uppercase tracking-wide text-verde-600 text-center">Direccion empresa</p>
                  </article>
                </div>
              </section>

            </section>
          </>
        )}
      </main>
  );
}

export default EmpresaDetalles;
