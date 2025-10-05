/* eslint-disable no-unused-vars */
// components/EmpresaFormEdit.jsx
import { useState, useEffect } from "react";
import { Building2, Image as ImageIcon } from "lucide-react";
import useImagePreview from "../hooks/useImagePreview";

const API_BASE = "http://localhost:3000";

const buildImageUrl = (p) => {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  const rel = p.startsWith("/") ? p : `/${p}`;
  return `${API_BASE}${rel}`;
};

function EmpresaFormEdit({ initialData = {}, onSubmit }) {
  const [formData, setFormData] = useState({
    nombre_sistema: initialData.nombre_sistema || "",
    titulo_h1: initialData.titulo_h1 || "",
    descripcion_h1: initialData.descripcion_h1 || "",
    te_ofrecemos: initialData.te_ofrecemos || "",
    titulo_1: initialData.titulo_1 || "",
    titulo_2: initialData.titulo_2 || "",
    titulo_3: initialData.titulo_3 || "",
    descripcion_1: initialData.descripcion_1 || "",
    descripcion_2: initialData.descripcion_2 || "",
    descripcion_3: initialData.descripcion_3 || "",
    mision: initialData.mision || "",
    vision: initialData.vision || "",
    nuestro_objetivo: initialData.nuestro_objetivo || "",
    objetivo_1: initialData.objetivo_1 || "",
    objetivo_2: initialData.objetivo_2 || "",
    objetivo_3: initialData.objetivo_3 || "",
    quienes_somos: initialData.quienes_somos || "",
    correo_empresa: initialData.correo_empresa || "",
    telefono: initialData.telefono || "",
    direccion: initialData.direccion || "",
    id_administrador: initialData.id_administrador || "",
  });

  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Previews de imágenes (incluye imagen_hero)
  const {
    file: logoFile,
    previewUrl: logoPreview,
    error: logoError,
    inputProps: logoInputProps,
    dropzoneProps: logoDropzoneProps,
    clear: clearLogo,
  } = useImagePreview({
    initialUrl: buildImageUrl(initialData?.logo_imagen),
    allowed: ["image/jpeg", "image/png", "image/webp"],
    maxMB: 5,
  });

  const {
    file: heroFile,
    previewUrl: heroPreview,
    error: heroError,
    inputProps: heroInputProps,
    dropzoneProps: heroDropzoneProps,
    clear: clearHero,
  } = useImagePreview({
    initialUrl: buildImageUrl(initialData?.imagen_hero),
    allowed: ["image/jpeg", "image/png", "image/webp"],
    maxMB: 5,
  });

  const {
    file: img1File,
    previewUrl: img1Preview,
    error: img1Error,
    inputProps: img1InputProps,
    dropzoneProps: img1DropzoneProps,
    clear: clearImg1,
  } = useImagePreview({
    initialUrl: buildImageUrl(initialData?.imagen_1),
    allowed: ["image/jpeg", "image/png", "image/webp"],
    maxMB: 5,
  });

  const {
    file: img2File,
    previewUrl: img2Preview,
    error: img2Error,
    inputProps: img2InputProps,
    dropzoneProps: img2DropzoneProps,
    clear: clearImg2,
  } = useImagePreview({
    initialUrl: buildImageUrl(initialData?.imagen_2),
    allowed: ["image/jpeg", "image/png", "image/webp"],
    maxMB: 5,
  });

  const {
    file: img3File,
    previewUrl: img3Preview,
    error: img3Error,
    inputProps: img3InputProps,
    dropzoneProps: img3DropzoneProps,
    clear: clearImg3,
  } = useImagePreview({
    initialUrl: buildImageUrl(initialData?.imagen_3),
    allowed: ["image/jpeg", "image/png", "image/webp"],
    maxMB: 5,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;

    setError("");
    setEnviando(true);

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      const v = formData[key];
      if (v !== "" && v !== null && v !== undefined) data.append(key, v);
    });

    if (logoFile) data.append("logo_imagen", logoFile);
    if (heroFile) data.append("imagen_hero", heroFile);
    if (img1File) data.append("imagen_1", img1File);
    if (img2File) data.append("imagen_2", img2File);
    if (img3File) data.append("imagen_3", img3File);

    try {
      await onSubmit(data);
    } catch (err) {
      setError(err?.message || "Ocurrió un error al guardar.");
    } finally {
      setEnviando(false);
    }
  };

  const ImageDrop = ({
    title,
    previewUrl,
    dropzoneProps,
    inputProps,
    onClear,
    help = "Formatos: JPG, PNG, WEBP · Máx: 5 MB",
  }) => (
    <div className="md:col-span-2">
      <label className="text-azul-950 font-medium">{title}</label>
      <div
        {...dropzoneProps}
        className="mt-1 border border-dashed border-gray-300 rounded-lg p-4 bg-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Previsualización"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400 text-xs">
                <ImageIcon className="w-5 h-5 mb-1" />
                <span className="px-2 text-center leading-tight">Sin imagen</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <p className="text-sm text-gray-700">Arrastra una imagen aquí o</p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label
                className="inline-block cursor-pointer bg-verde-600 text-white hover:bg-green-700 text-sm font-medium px-3 py-1.5 rounded-md border"
              >
                Seleccionar archivo
                <input
                  className="sr-only"
                  {...inputProps}
                />
              </label>

              {previewUrl && (
                <button
                  type="button"
                  onClick={onClear}
                  className="inline-block bg-white hover:bg-gray-50 text-gray-800 text-sm font-medium px-3 py-1.5 rounded-md border"
                >
                  Quitar
                </button>
              )}
            </div>

            <p className="mt-2 text-xs text-gray-500">{help}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const anyImgError = logoError || heroError || img1Error || img2Error || img3Error;

  return (
    <main>
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="min-h-[0]">
        <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8">
          {/* Sección: Información general */}
          <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-2 mb-4">
            <div className="text-verde-600 mb-2">
              <p className="font-medium text-lg">Información general</p>
              <p>Nombre, lema y descripción principal.</p>
            </div>

            <div className="lg:col-span-2">
              <div className="grid gap-4 gap-y-4 text-sm grid-cols-1 md:grid-cols-2">
                <div className="md:col-span-1">
                  <label className="text-azul-950 font-medium">Nombre del Sistema*</label>
                  <input
                    name="nombre_sistema"
                    type="text"
                    placeholder="Mi Sistema"
                    value={formData.nombre_sistema}
                    onChange={handleChange}
                    required
                    className="h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="text-azul-950 font-medium">Lema</label>
                  <input
                    name="titulo_h1"
                    type="text"
                    placeholder="Tu lema aquí"
                    value={formData.titulo_h1}
                    onChange={handleChange}
                    className="h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-azul-950 font-medium">Descripción</label>
                  <textarea
                    name="descripcion_h1"
                    placeholder="Breve descripción de la empresa o sistema"
                    value={formData.descripcion_h1}
                    onChange={handleChange}
                    rows={3}
                    className="border border-1 border-gray-300 mt-1 rounded-md px-4 py-2 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-azul-950 font-medium">Te ofrecemos</label>
                  <textarea
                    name="te_ofrecemos"
                    placeholder="Servicios, beneficios o propuestas de valor"
                    value={formData.te_ofrecemos}
                    onChange={handleChange}
                    rows={3}
                    className="border border-1 border-gray-300 mt-1 rounded-md px-4 py-2 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Ventajas / Servicios */}
          <div className="mt-8 grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-2 mb-4">
            <div className="text-verde-600 mb-2">
              <p className="font-medium text-lg">Ventajas / Servicios</p>
              <p>Títulos y descripciones de tres ventajas.</p>
            </div>

            <div className="lg:col-span-2">
              <div className="grid gap-4 gap-y-4 text-sm grid-cols-1 md:grid-cols-2">
                {/* V1 */}
                <div>
                  <label className="text-azul-950 font-medium">Título Ventaja 1</label>
                  <input
                    name="titulo_1"
                    type="text"
                    value={formData.titulo_1}
                    onChange={handleChange}
                    className="h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>
                <div>
                  <label className="text-azul-950 font-medium">Descripción Ventaja 1</label>
                  <textarea
                    name="descripcion_1"
                    value={formData.descripcion_1}
                    onChange={handleChange}
                    rows={3}
                    className="border border-1 border-gray-300 mt-1 rounded-md px-4 py-2 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600"
                  />
                </div>

                {/* V2 */}
                <div>
                  <label className="text-azul-950 font-medium">Título Ventaja 2</label>
                  <input
                    name="titulo_2"
                    type="text"
                    value={formData.titulo_2}
                    onChange={handleChange}
                    className="h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>
                <div>
                  <label className="text-azul-950 font-medium">Descripción Ventaja 2</label>
                  <textarea
                    name="descripcion_2"
                    value={formData.descripcion_2}
                    onChange={handleChange}
                    rows={3}
                    className="border border-1 border-gray-300 mt-1 rounded-md px-4 py-2 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600"
                  />
                </div>

                {/* V3 */}
                <div>
                  <label className="text-azul-950 font-medium">Título Ventaja 3</label>
                  <input
                    name="titulo_3"
                    type="text"
                    value={formData.titulo_3}
                    onChange={handleChange}
                    className="h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>
                <div>
                  <label className="text-azul-950 font-medium">Descripción Ventaja 3</label>
                  <textarea
                    name="descripcion_3"
                    value={formData.descripcion_3}
                    onChange={handleChange}
                    rows={3}
                    className="border border-1 border-gray-300 mt-1 rounded-md px-4 py-2 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Misión, Visión, Quiénes Somos */}
          <div className="mt-8 grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-2 mb-4">
            <div className="text-verde-600 mb-2">
              <p className="font-medium text-lg">Misión y Visión</p>
              <p>Propósito y horizonte de la organización.</p>
            </div>

            <div className="lg:col-span-2">
              <div className="grid gap-4 gap-y-4 text-sm grid-cols-1 md:grid-cols-2">
                <div className="md:col-span-1">
                  <label className="text-azul-950 font-medium">Misión</label>
                  <textarea
                    name="mision"
                    value={formData.mision}
                    onChange={handleChange}
                    rows={3}
                    className="border border-1 border-gray-300 mt-1 rounded-md px-4 py-2 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="text-azul-950 font-medium">Visión</label>
                  <textarea
                    name="vision"
                    value={formData.vision}
                    onChange={handleChange}
                    rows={3}
                    className="border border-1 border-gray-300 mt-1 rounded-md px-4 py-2 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-azul-950 font-medium">Quiénes somos</label>
                  <textarea
                    name="quienes_somos"
                    value={formData.quienes_somos}
                    onChange={handleChange}
                    rows={3}
                    className="border border-1 border-gray-300 mt-1 rounded-md px-4 py-2 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Objetivos */}
          <div className="mt-8 grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-2 mb-4">
            <div className="text-verde-600 mb-2">
              <p className="font-medium text-lg">Objetivos</p>
              <p>General y específicos.</p>
            </div>

            <div className="lg:col-span-2">
              <div className="grid gap-4 gap-y-4 text-sm grid-cols-1 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-azul-950 font-medium">Objetivo General</label>
                  <textarea
                    name="nuestro_objetivo"
                    value={formData.nuestro_objetivo}
                    onChange={handleChange}
                    rows={3}
                    className="border border-1 border-gray-300 mt-1 rounded-md px-4 py-2 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-azul-950 font-medium">Objetivo Específico 1</label>
                  <textarea
                    name="objetivo_1"
                    type="text"
                    value={formData.objetivo_1}
                    onChange={handleChange}
                    className="h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-azul-950 font-medium">Objetivo Específico 2</label>
                  <textarea
                    name="objetivo_2"
                    type="text"
                    value={formData.objetivo_2}
                    onChange={handleChange}
                    className="h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-azul-950 font-medium">Objetivo Específico 3</label>
                  <textarea
                    name="objetivo_3"
                    type="text"
                    value={formData.objetivo_3}
                    onChange={handleChange}
                    className="h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Contacto */}
          <div className="mt-8 grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-2 mb-4">
            <div className="text-verde-600 mb-2">
              <p className="font-medium text-lg">Contacto</p>
              <p>Correo, teléfono y dirección.</p>
            </div>

            <div className="lg:col-span-2">
              <div className="grid gap-4 gap-y-4 text-sm grid-cols-1 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-azul-950 font-medium">Correo Empresa</label>
                  <input
                    name="correo_empresa"
                    type="email"
                    placeholder="empresa@correo.com"
                    value={formData.correo_empresa}
                    onChange={handleChange}
                    className="h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>

                <div>
                  <label className="text-azul-950 font-medium">Teléfono</label>
                  <input
                    name="telefono"
                    type="tel"
                    placeholder="+591 7xxxxxxx"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>

                <div>
                  <label className="text-azul-950 font-medium">Dirección</label>
                  <input
                    name="direccion"
                    type="text"
                    placeholder="Calle #123, Zona..."
                    value={formData.direccion}
                    onChange={handleChange}
                    className="h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Imágenes (Logo, Hero, 1–3) */}
          <div className="mt-8 grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-2 mb-4">
            <div className="text-verde-600 mb-2">
              <p className="font-medium text-lg">Imágenes</p>
              <p>Logo, portada (hero) y galería.</p>
            </div>

            <div className="lg:col-span-2">
              <div className="grid gap-4 gap-y-4 text-sm grid-cols-1">
                <ImageDrop
                  title="Imagen - Logo"
                  previewUrl={logoPreview}
                  dropzoneProps={logoDropzoneProps}
                  inputProps={logoInputProps}
                  onClear={clearLogo}
                />

                <ImageDrop
                  title="Imagen - Hero (Portada)"
                  previewUrl={heroPreview}
                  dropzoneProps={heroDropzoneProps}
                  inputProps={heroInputProps}
                  onClear={clearHero}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageDrop
                    title="Imagen 1"
                    previewUrl={img1Preview}
                    dropzoneProps={img1DropzoneProps}
                    inputProps={img1InputProps}
                    onClear={clearImg1}
                  />
                  <ImageDrop
                    title="Imagen 2"
                    previewUrl={img2Preview}
                    dropzoneProps={img2DropzoneProps}
                    inputProps={img2InputProps}
                    onClear={clearImg2}
                  />
                  <ImageDrop
                    title="Imagen 3"
                    previewUrl={img3Preview}
                    dropzoneProps={img3DropzoneProps}
                    inputProps={img3InputProps}
                    onClear={clearImg3}
                  />
                </div>

                {(anyImgError || error) && (
                  <p className="mt-2 text-red-600 text-sm">
                    {logoError || heroError || img1Error || img2Error || img3Error || error}
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="mt-6 flex items-end justify-end">
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full md:w-auto bg-verde-600 hover:bg-verde-700 disabled:opacity-60 text-white font-semibold py-2 px-5 rounded transition"
                >
                  {enviando ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}

export default EmpresaFormEdit;
