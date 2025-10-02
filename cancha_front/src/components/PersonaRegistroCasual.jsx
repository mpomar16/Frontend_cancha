import { useState } from 'react';
import { crearPersonaCasual } from '../services/personaService';

function PersonaRegistroCasual() {
  const [formData, setFormData] = useState({
    nombre: '',
    usuario: '',
    contrasena: '',
    correo: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearPersonaCasual(formData);
      alert('Registro exitoso');
      setFormData({ nombre: '', usuario: '', contrasena: '', correo: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto"
    >
      {error && <p className="text-red-500">{error}</p>}

      {/* Grid de dos columnas con línea divisoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna izquierda pegada a la línea */}
        <div className="md:pr-10 md:border-r md:border-gray-300">
          <label className="block text-azul-950 font-poppins font-bold mb-2">
            Nombre
          </label>
          <input
            type="text"
            name="nombre"
            placeholder="Juan Pérez"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg placeholder-gray-400"
            required
          />

          <label className="block text-azul-950 font-poppins font-bold mb-2 mt-4">
            Contraseña
          </label>
          <input
            type="password"
            name="contrasena"
            placeholder="********"
            value={formData.contrasena}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg placeholder-gray-400"
            required
          />
        </div>

        {/* Columna derecha también pegada a la línea */}
        <div className="md:pl-4">
          <label className="block text-azul-950 font-poppins font-bold mb-2">
            Usuario
          </label>
          <input
            type="text"
            name="usuario"
            placeholder="juan123"
            value={formData.usuario}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg placeholder-gray-400"
            required
          />

          <label className="block text-azul-950 font-poppins font-bold mb-2 mt-4">
            Correo
          </label>
          <input
            type="email"
            name="correo"
            placeholder="ejemplo@correo.com"
            value={formData.correo}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg placeholder-gray-400"
            required
          />
        </div>
      </div>

      {/* Botón centrado */}
      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          className="bg-verde-600 text-white px-6 py-2 rounded-lg font-poppins font-semibold"
        >
          Registrarse
        </button>
      </div>
    </form>
  );
}

export default PersonaRegistroCasual;
