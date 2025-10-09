// components/PersonaFormCreate.jsx
import { useState } from "react";
import { crearPersonaCasual } from "../services/personaService";
import { Users, Eye, EyeClosed } from "lucide-react";

function PersonaFormCreate({ onSubmit }) {
  const [formData, setFormData] = useState({
    nombre: "",
    usuario: "",
    contrasena: "",
    correo: "",
  });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [verContrasena, setVerContrasena] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setError("");
    setEnviando(true);
    try {
      if (typeof onSubmit === "function") {
        await onSubmit(formData);
      } else {
        // fallback si no te pasan onSubmit desde afuera
        await crearPersonaCasual(formData);
        alert("Registro exitoso");
      }
      setFormData({ nombre: "", usuario: "", contrasena: "", correo: "" });
    } catch (err) {
      setError(err?.message || "Ocurrió un error al registrar.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main>
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="flex items-center text-2xl font-poppins font-bold text-azul-950">
          <Users className="mr-3" />
          Registra una nueva Persona
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="min-h-[0]">
        <div className="bg-white rounded-md-xl shadow-lg p-4 px-4 md:p-8">
          {/* Título + descripción opcional arriba (estilo snippet) */}
          <div className="mb-4">
            <h2 className="font-semibold text-xl text-azul-950">Registro</h2>
            <p className="text-gray-500">Completa los datos para crear la persona.</p>
          </div>

          {/* Grid 1/3 y 2/3 (responsivo) */}
          <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3">
            {/* Columna izquierda (texto) */}
            <div className="text-gray-600">
              <p className="font-medium text-lg">Datos personales</p>
              <p>Por favor, rellena todos los campos requeridos.</p>
            </div>

            {/* Columna derecha (form) */}
            <div className="lg:col-span-2">
              <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-2">
                {/* Nombre (ocupa 2 col en md como el snippet hace con "Full Name") */}
                <div className="md:col-span-2">
                  <label htmlFor="nombre" className="text-azul-950 font-medium">
                    Nombre*
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    placeholder="Juan Pérez"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>

                {/* Correo */}
                <div className="md:col-span-2">
                  <label htmlFor="correo" className="text-azul-950 font-medium">
                    Correo*
                  </label>
                  <input
                    id="correo"
                    name="correo"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                    className="h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>

                {/* Usuario */}
                <div className="md:col-span-1">
                  <label htmlFor="usuario" className="text-azul-950 font-medium">
                    Usuario*
                  </label>
                  <input
                    id="usuario"
                    name="usuario"
                    type="text"
                    placeholder="juan123"
                    value={formData.usuario}
                    onChange={handleChange}
                    required
                    className="h-10 border border-1 border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
                  />
                </div>

                {/* Contraseña */}
                <div className="md:col-span-1">
                  <label htmlFor="contrasena" className="text-azul-950 font-medium">
                    Contraseña*
                  </label>

                  <div className="relative">
                    <input
                      id="contrasena"
                      name="contrasena"
                      type={verContrasena ? "text" : "password"}
                      placeholder="********"
                      value={formData.contrasena}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      className="h-10 border border-gray-300 mt-1 rounded-md pl-4 pr-10 w-full bg-white text-azul-950 focus:outline-none focus:ring-2 focus:ring-verde-600"
                    />

                    <button
                      type="button"
                      onClick={() => setVerContrasena((v) => !v)}
                      aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                      aria-pressed={verContrasena}
                      className="absolute inset-y-0 right-2 mt-1 flex items-center justify-center px-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      tabIndex={0}
                    >
                      {verContrasena ? <EyeClosed className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>


                {/* Error */}
                {error && (
                  <div className="md:col-span-2">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Botón submit (alineado derecha en md, full en mobile) */}
                <div className="md:col-span-2 flex items-end justify-end">
                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full md:w-auto bg-verde-600 hover:bg-verde-700 disabled:opacity-60 text-white font-semibold py-2 px-5 rounded-md transition"
                  >
                    {enviando ? "Enviando…" : "Registrarse"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>

  );
}


export default PersonaFormCreate;
