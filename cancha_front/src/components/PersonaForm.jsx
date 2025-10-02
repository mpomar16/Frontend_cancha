import { useState, useEffect } from "react";
import { listarSexoEnum } from "../services/personaService";

function PersonaForm({ initialData = {}, onSubmit, token, isSignUp = false }) {
  const [formData, setFormData] = useState({
    nombre: initialData.nombre || "",
    usuario: initialData.usuario || "",
    apellido: initialData.apellido || "",
    contrasena: "",
    telefono: initialData.telefono || "",
    correo: initialData.correo || "",
    sexo: initialData.sexo || "",
  });
  const [imagen_perfil, setImagenPerfil] = useState(null);
  const [sexos, setSexos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSexos() {
      try {
        const response = await listarSexoEnum(token);
        setSexos(response.data);
      } catch (err) {
        setError(err.message);
      }
    }
    if (!isSignUp) fetchSexos();
  }, [token, isSignUp]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setImagenPerfil(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });
    if (imagen_perfil) data.append("imagen_perfil", imagen_perfil);

    try {
      await onSubmit(data);
      alert("Operación exitosa");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto"
    >
      {error && <p className="text-red-500">{error}</p>}

      {/* Grid de dos columnas con línea divisoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="md:pr-6 md:border-r md:border-gray-300 space-y-4">
          <div>
            <label className="block text-azul-950 font-poppins font-bold mb-2">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              placeholder="Juan"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg font-poppins text-azul-950 placeholder-gray-400"
              required={isSignUp}
            />
          </div>
          <div>
            <label className="block text-azul-950 font-poppins font-bold mb-2">
              Contraseña
            </label>
            <input
              type="password"
              name="contrasena"
              placeholder="********"
              value={formData.contrasena}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg font-poppins text-azul-950 placeholder-gray-400"
              required={isSignUp}
            />
          </div>
          <div>
            <label className="block text-azul-950 font-poppins font-bold mb-2">
              Apellido
            </label>
            <input
              type="text"
              name="apellido"
              placeholder="Pérez"
              value={formData.apellido}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg font-poppins text-azul-950 placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-azul-950 font-poppins font-bold mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              placeholder="+591 71234567"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg font-poppins text-azul-950 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Columna derecha */}
        <div className="md:pl-6 space-y-4">
          <div>
            <label className="block text-azul-950 font-poppins font-bold mb-2">
              Usuario
            </label>
            <input
              type="text"
              name="usuario"
              placeholder="juan123"
              value={formData.usuario}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg font-poppins text-azul-950 placeholder-gray-400"
              required={isSignUp}
            />
          </div>
          <div>
            <label className="block text-azul-950 font-poppins font-bold mb-2">
              Correo
            </label>
            <input
              type="email"
              name="correo"
              placeholder="ejemplo@correo.com"
              value={formData.correo}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg font-poppins text-azul-950 placeholder-gray-400"
              required={isSignUp}
            />
          </div>
          {!isSignUp && (
            <div>
              <label className="block text-azul-950 font-poppins font-bold mb-2">
                Sexo
              </label>
              <select
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg font-poppins text-azul-950"
              >
                <option value="">Seleccione un sexo</option>
                {sexos.map((sexo) => (
                  <option key={sexo} value={sexo}>
                    {sexo}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-azul-950 font-poppins font-bold mb-2">
              Imagen de Perfil
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Botón centrado y más largo */}
      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          className="bg-verde-600 text-white px-8 py-2 rounded-lg font-poppins font-bold hover:bg-verde-500 transition"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

export default PersonaForm;
