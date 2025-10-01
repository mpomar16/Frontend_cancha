import { useState } from 'react';

function EmpresaForm({ initialData = {}, onSubmit }) {
  const [formData, setFormData] = useState({
    nombre_sistema: initialData.nombre_sistema || '',
    titulo_h1: initialData.titulo_h1 || '',
    descripcion_h1: initialData.descripcion_h1 || '',
    te_ofrecemos: initialData.te_ofrecemos || '',
    titulo_1: initialData.titulo_1 || '',
    titulo_2: initialData.titulo_2 || '',
    titulo_3: initialData.titulo_3 || '',
    descripcion_1: initialData.descripcion_1 || '',
    descripcion_2: initialData.descripcion_2 || '',
    descripcion_3: initialData.descripcion_3 || '',
    mision: initialData.mision || '',
    vision: initialData.vision || '',
    nuestro_objetivo: initialData.nuestro_objetivo || '',
    objetivo_1: initialData.objetivo_1 || '',
    objetivo_2: initialData.objetivo_2 || '',
    objetivo_3: initialData.objetivo_3 || '',
    quienes_somos: initialData.quienes_somos || '',
    correo_empresa: initialData.correo_empresa || '',
    telefono: initialData.telefono || '',
    direccion: initialData.direccion || '',
    id_administrador: initialData.id_administrador || '',
  });
  const [files, setFiles] = useState({
    logo_imagen: null,
    imagen_1: null,
    imagen_2: null,
    imagen_3: null,
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles({ ...files, [name]: selectedFiles[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });
    Object.keys(files).forEach((key) => {
      if (files[key]) data.append(key, files[key]);
    });

    try {
      await onSubmit(data);
      alert('Empresa actualizada exitosamente');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-gray-700">Nombre del Sistema</label>
          <input
            type="text"
            name="nombre_sistema"
            value={formData.nombre_sistema}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Título H1</label>
          <input
            type="text"
            name="titulo_h1"
            value={formData.titulo_h1}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Descripción H1</label>
          <textarea
            name="descripcion_h1"
            value={formData.descripcion_h1}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Te Ofrecemos</label>
          <textarea
            name="te_ofrecemos"
            value={formData.te_ofrecemos}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Título 1</label>
          <input
            type="text"
            name="titulo_1"
            value={formData.titulo_1}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Descripción 1</label>
          <textarea
            name="descripcion_1"
            value={formData.descripcion_1}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Título 2</label>
          <input
            type="text"
            name="titulo_2"
            value={formData.titulo_2}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Descripción 2</label>
          <textarea
            name="descripcion_2"
            value={formData.descripcion_2}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Título 3</label>
          <input
            type="text"
            name="titulo_3"
            value={formData.titulo_3}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Descripción 3</label>
          <textarea
            name="descripcion_3"
            value={formData.descripcion_3}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Misión</label>
          <textarea
            name="mision"
            value={formData.mision}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Visión</label>
          <textarea
            name="vision"
            value={formData.vision}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Nuestro Objetivo</label>
          <textarea
            name="nuestro_objetivo"
            value={formData.nuestro_objetivo}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Objetivo 1</label>
          <input
            type="text"
            name="objetivo_1"
            value={formData.objetivo_1}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Objetivo 2</label>
          <input
            type="text"
            name="objetivo_2"
            value={formData.objetivo_2}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Objetivo 3</label>
          <input
            type="text"
            name="objetivo_3"
            value={formData.objetivo_3}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Quienes Somos</label>
          <textarea
            name="quienes_somos"
            value={formData.quienes_somos}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Correo Empresa</label>
          <input
            type="email"
            name="correo_empresa"
            value={formData.correo_empresa}
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
          <label className="block text-gray-700">ID Administrador</label>
          <input
            type="number"
            name="id_administrador"
            value={formData.id_administrador}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-gray-700">Logo Imagen</label>
          <input
            type="file"
            name="logo_imagen"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            className="w-full p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Imagen 1</label>
          <input
            type="file"
            name="imagen_1"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            className="w-full p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Imagen 2</label>
          <input
            type="file"
            name="imagen_2"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            className="w-full p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Imagen 3</label>
          <input
            type="file"
            name="imagen_3"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            className="w-full p-2"
          />
        </div>
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Guardar
      </button>
    </form>
  );
}

export default EmpresaForm;