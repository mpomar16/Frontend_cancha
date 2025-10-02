import { useState } from "react";
import { login } from "../services/personaService";
import { Eye, EyeClosed } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [formData, setFormData] = useState({ correo: "", contrasena: "" });
  const [mostrarCon, setMostrarCon] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await login(formData);

      // Guardar token y rol en localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("roles", JSON.stringify(response.data.persona.roles));
      localStorage.setItem("imagen_perfil", response.data.persona.imagen_perfil || "");
      localStorage.setItem("nombre", response.data.persona.nombre || "");
localStorage.setItem("apellido", response.data.persona.apellido || "");
localStorage.setItem("usuario", response.data.persona.usuario || "");

      // Redirección
      if (response.data.persona.role === "ADMINISTRADOR") {
        navigate("/personas");
      } else {
        navigate("/espacios/cercanos");
      }
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
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
              {/* Logo aquí si lo quieres */}
            </div>
            <p className="text-sm text-gris-300">
              ¿No tienes una cuenta?{" "}
              <a
                href="/register"
                className="text-verde-600 font-medium hover:underline"
              >
                Sign Up
              </a>
            </p>
          </div>

          <h1 className="mb-6 text-3xl font-semibold text-azul-950">Sign In</h1>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Usuario */}
            <div>
              <label className="block text-sm font-medium text-azul-950 mb-1">
                Correo
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
                Contraseña
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
              <div className="mt-2 text-right">
                <a href="#" className="text-sm text-verde-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            {/* Error */}
            {error && <p className="text-red-700 text-sm">{error}</p>}

            {/* Botón */}
            <button
              type="submit"
              className="w-full bg-verde-600 text-blanco-50 font-semibold rounded-lg py-3 shadow-md hover:bg-verde-600/90 transition"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
