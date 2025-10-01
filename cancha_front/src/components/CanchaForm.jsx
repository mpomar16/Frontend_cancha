import { useState, useEffect } from 'react';
import { listarEstadoCanchaEnum } from '../services/canchaService';

function CanchaForm({ initialData = {}, onSubmit, token }) {
  const [formData, setFormData] = useState({
    nombre: initialData.nombre || '',
    capacidad: initialData.capacidad || '',
    estado: initialData.estado || '',
    ubicacion: initialData.ubicacion || '',
    monto_por_hora: initialData.monto_por_hora || '',
    id_espacio: initialData.id_espacio || '',
  });
  const [imagen_cancha, setImagenCancha] = useState(null);
  const [estados, setEstados] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchEstados() {
      try {
        const response = await listarEstadoCanchaEnum(token);
        setEstados(response.data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchEstados();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setImagenCancha(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });
    if (imagen_cancha) data.append('imagen_cancha', imagen_cancha);

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
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Capacidad</label>
        <input
          type="number"
          name="capacidad"
          value={formData.capacidad}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Estado</label>
        <select
          name="estado"
          value={formData.estado}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Seleccione un estado</option>
          {estados.map((estado) => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Ubicación</label>
        <input
          type="text"
          name="ubicacion"
          value={formData.ubicacion}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Monto por hora</label>
        <input
          type="number"
          name="monto_por_hora"
          value={formData.monto_por_hora}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">ID Espacio</label>
        <input
          type="number"
          name="id_espacio"
          value={formData.id_espacio}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Imagen</label>
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

export default CanchaForm;