import { useState , useEffect} from 'react';
import { listarAdminsUnicos } from '../services/espacioService';

function EspacioForm({ initialData = {}, onSubmit, token }) {
  const [admins, setAdmins] = useState([]); // <-- Declarar admins
  const [formData, setFormData] = useState({
    nombre: initialData.nombre || '',
    direccion: initialData.direccion || '',
    descripcion: initialData.descripcion || '',
    latitud: initialData.latitud || '',
    longitud: initialData.longitud || '',
    horario_apertura: initialData.horario_apertura || '',
    horario_cierre: initialData.horario_cierre || '',
    id_admin_esp_dep: initialData.id_admin_esp_dep || '',
  });
  const [images, setImages] = useState({
    imagen_principal: null,
    imagen_sec_1: null,
    imagen_sec_2: null,
    imagen_sec_3: null,
    imagen_sec_4: null,
  });
  
  const [error, setError] = useState('');

  // Cargar administradores al montar el componente
  useEffect(() => {
    async function fetchAdmins() {
      try {
        const res = await listarAdminsUnicos(token);
        setAdmins(res.data || []);
      } catch (err) {
        console.error("Error cargando administradores:", err.message);
      }
    }
    fetchAdmins();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setImages({ ...images, [name]: files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });
    Object.keys(images).forEach((key) => {
      if (images[key]) data.append(key, images[key]);
    });

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
        <label className="block text-gray-700">Dirección</label>
        <input
          type="text"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Descripción</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Latitud</label>
        <input
          type="number"
          name="latitud"
          value={formData.latitud}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          step="any"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Longitud</label>
        <input
          type="number"
          name="longitud"
          value={formData.longitud}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          step="any"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Horario Apertura</label>
        <input
          type="time"
          name="horario_apertura"
          value={formData.horario_apertura}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Horario Cierre</label>
        <input
          type="time"
          name="horario_cierre"
          value={formData.horario_cierre}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>


      <div className="mb-4">
        <label className="block text-gray-700">Administrador Deportivo</label>
        <select
          name="id_admin_esp_dep"
          value={formData.id_admin_esp_dep}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Selecciona un administrador</option>
          {admins.map((admin) => (
            <option key={admin.id} value={admin.id}>
              {admin.nombre_completo || `ID ${admin.id}`} 
            </option>
          ))}
        </select>
      </div>



      <div className="mb-4">
        <label className="block text-gray-700">Imagen Principal</label>
        <input
          type="file"
          name="imagen_principal"
          onChange={handleFileChange}
          className="w-full p-2"
          accept=".jpg,.jpeg,.png,.webp"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Imagen Secundaria 1</label>
        <input
          type="file"
          name="imagen_sec_1"
          onChange={handleFileChange}
          className="w-full p-2"
          accept=".jpg,.jpeg,.png,.webp"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Imagen Secundaria 2</label>
        <input
          type="file"
          name="imagen_sec_2"
          onChange={handleFileChange}
          className="w-full p-2"
          accept=".jpg,.jpeg,.png,.webp"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Imagen Secundaria 3</label>
        <input
          type="file"
          name="imagen_sec_3"
          onChange={handleFileChange}
          className="w-full p-2"
          accept=".jpg,.jpeg,.png,.webp"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Imagen Secundaria 4</label>
        <input
          type="file"
          name="imagen_sec_4"
          onChange={handleFileChange}
          className="w-full p-2"
          accept=".jpg,.jpeg,.png,.webp"
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Guardar
      </button>
    </form>
  );
}

export default EspacioForm;