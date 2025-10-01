import { useState, useEffect } from 'react';
import { listarSexoEnum } from '../services/personaService';

function PersonaForm({ initialData = {}, onSubmit, token, isSignUp = false }) {
  const [formData, setFormData] = useState({
    nombre: initialData.nombre || '',
    usuario: initialData.usuario || '',
    apellido: initialData.apellido || '',
    contrasena: '',
    telefono: initialData.telefono || '',
    correo: initialData.correo || '',
    sexo: initialData.sexo || '',
  });
  const [imagen_perfil, setImagenPerfil] = useState(null);
  const [sexos, setSexos] = useState([]);
  const [error, setError] = useState('');

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
    if (imagen_perfil) data.append('imagen_perfil', imagen_perfil);

    try {
      await onSubmit(data);
      alert('Operación exitosa');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4">
        <label className="block text-gray-700">Nombre</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required={isSignUp}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Usuario</label>
        <input
          type="text"
          name="usuario"
          value={formData.usuario}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required={isSignUp}
        />
      </div>
      {isSignUp && (
        <div className="mb-4">
          <label className="block text-gray-700">Contraseña</label>
          <input
            type="password"
            name="contrasena"
            value={formData.contrasena}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      )}
      <div className="mb-4">
        <label className="block text-gray-700">Apellido</label>
        <input
          type="text"
          name="apellido"
          value={formData.apellido}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Teléfono</label>
        <input
          type="tel"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Correo</label>
        <input
          type="email"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required={isSignUp}
        />
      </div>
      {!isSignUp && (
        <div className="mb-4">
          <label className="block text-gray-700">Sexo</label>
          <select
            name="sexo"
            value={formData.sexo}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Seleccione un sexo</option>
            {sexos.map((sexo) => (
              <option key={sexo} value={sexo}>{sexo}</option>
            ))}
          </select>
        </div>
      )}
      <div className="mb-4">
        <label className="block text-gray-700">Imagen de Perfil</label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="w-full p-2"
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Guardar
      </button>
    </form>
  );
}

export default PersonaForm;