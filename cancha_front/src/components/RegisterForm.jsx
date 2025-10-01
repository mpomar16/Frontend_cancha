import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { crearPersonaCasual } from "../services/personaService";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    usuario: "",
    correo: "",
    contrasena: ""
  });
  const [mostrarCon, setMostrarCon] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    try {
      const data = await crearPersonaCasual(formData);

      if (data.success) {
        // Registro exitoso → redirigir a login
        navigate("/login");
      } else {
        setMensaje(data.message || "Error al registrar usuario");
      }
    } catch (err) {
      setMensaje(err.message);
    }
  };

  return (
    <div className="font-poppins relative min-h-screen bg-azul-950">
      {/* Fondo dividido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div className="bg-azul-950"></div>
        <div className="bg-blanco-50"></div>
      </div>

      {/* Formulario flotante */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3 sm:gap-0">
            <div className="flex items-center gap-2">
              {/* Logo si lo quieres */}
            </div>
            <p className="text-sm text-gris-300">
              ¿Ya tienes una cuenta?{" "}
              <a
                href="/login"
                className="text-verde-600 font-medium hover:underline"
              >
                Sign In
              </a>
            </p>
          </div>

          <h1 className="mb-6 text-3xl font-semibold text-azul-950">Sign Up</h1>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-azul-950 mb-1">
                Nombre*
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombre completo"
                className="w-full rounded-lg border border-gris-300 focus:ring-1 focus:ring-verde-600 focus:outline-none px-4 py-3 text-sm"
                required
              />
            </div>

            {/* Usuario */}
            <div>
              <label className="block text-sm font-medium text-azul-950 mb-1">
                Usuario*
              </label>
              <input
                type="text"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                placeholder="Nombre de usuario"
                className="w-full rounded-lg border border-gris-300 focus:ring-1 focus:ring-verde-600 focus:outline-none px-4 py-3 text-sm"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-azul-950 mb-1">
                Email*
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="usuario@correo.com"
                className="w-full rounded-lg border border-gris-300 focus:ring-1 focus:ring-verde-600 focus:outline-none px-4 py-3 text-sm"
                required
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-azul-950 mb-1">
                Contraseña*
              </label>
              <div className="relative">
                <input
                  type={mostrarCon ? "text" : "password"}
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  placeholder="Contraseña"
                  className="w-full rounded-lg border border-gris-300 focus:ring-1 focus:ring-verde-600 focus:outline-none px-4 py-3 text-sm pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gris-300"
                  onClick={() => setMostrarCon(!mostrarCon)}
                >
                  {mostrarCon ? <EyeClosed size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {mensaje && <p className="text-red-700 text-sm">{mensaje}</p>}

            {/* Botón */}
            <button
              type="submit"
              className="w-full bg-verde-600 text-blanco-50 font-semibold rounded-lg py-3 shadow-md hover:bg-verde-600/90 transition"
            >
              Sign up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
