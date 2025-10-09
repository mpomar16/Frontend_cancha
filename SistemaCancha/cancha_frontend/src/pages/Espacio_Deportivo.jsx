import React, { useState, useEffect } from 'react';
import api from '../services/api';

const EspacioDeportivo = () => {
  const [espacios, setEspacios] = useState([]);
  const [administradores, setAdministradores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtro, setFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEspacio, setCurrentEspacio] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    descripcion: '',
    latitud: '',
    longitud: '',
    horario_apertura: '',
    horario_cierre: '',
    imagen_pricipal: '',
    imagen_sec_1: '',
    imagen_sec_2: '',
    imagen_sec_3: '',
    imagen_sec_4: '',
    id_admin_esp_dep: ''
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Fetch administradores válidos al cargar el componente
  useEffect(() => {
    const fetchAdministradores = async () => {
      try {
        const response = await api.get('/admin-esp-dep/datos-especificos'); // Ajustar endpoint según tu API
        if (response.data.exito) {
          setAdministradores(response.data.datos.administradores || []);
        }
      } catch (err) {
        console.error('Error al obtener administradores:', err);
      }
    };
    fetchAdministradores();
  }, []);

  const fetchEspacios = async (params = {}) => {
    setLoading(true);
    setError(null);
    const offset = (page - 1) * limit;
    const fullParams = { ...params, limit, offset };
    try {
      let response;
      if (params.q) {
        response = await api.get('/espacio_deportivo/buscar', { params: fullParams });
      } else if (params.tipo) {
        response = await api.get('/espacio_deportivo/filtro', { params: fullParams });
      } else {
        response = await api.get('/espacio_deportivo/datos-especificos', { params: fullParams });
      }
      if (response.data.exito) {
        setEspacios(response.data.datos.espacios);
        setTotal(response.data.datos.paginacion.total);
      } else {
        setError(response.data.mensaje);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.mensaje || 'Error de conexión al servidor';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEspacios();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    if (searchTerm.trim()) {
      fetchEspacios({ q: searchTerm });
    } else {
      fetchEspacios();
    }
  };

  const handleFiltroChange = (e) => {
    const tipo = e.target.value;
    setFiltro(tipo);
    setPage(1);
    if (tipo) {
      fetchEspacios({ tipo });
    } else {
      fetchEspacios();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este espacio deportivo?')) return;
    try {
      const response = await api.delete(`/espacio_deportivo/${id}`);
      if (response.data.exito) {
        fetchEspacios();
      } else {
        alert(response.data.mensaje);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.mensaje || 'Error de conexión al servidor';
      setError(errorMessage);
      console.error(err);
    }
  };

  const openCreateModal = () => {
    setEditMode(false);
    setFormData({
      nombre: '',
      direccion: '',
      descripcion: '',
      latitud: '',
      longitud: '',
      horario_apertura: '',
      horario_cierre: '',
      imagen_pricipal: '',
      imagen_sec_1: '',
      imagen_sec_2: '',
      imagen_sec_3: '',
      imagen_sec_4: '',
      id_admin_esp_dep: ''
    });
    setModalOpen(true);
  };

  const openEditModal = async (id) => {
    try {
      const response = await api.get(`/espacio_deportivo/dato-individual/${id}`);
      if (response.data.exito) {
        const espacio = response.data.datos.espacio;
        setFormData({
          nombre: espacio.nombre || '',
          direccion: espacio.direccion || '',
          descripcion: espacio.descripcion || '',
          latitud: espacio.latitud || '',
          longitud: espacio.longitud || '',
          horario_apertura: espacio.horario_apertura || '',
          horario_cierre: espacio.horario_cierre || '',
          imagen_pricipal: espacio.imagen_pricipal || '',
          imagen_sec_1: espacio.imagen_sec_1 || '',
          imagen_sec_2: espacio.imagen_sec_2 || '',
          imagen_sec_3: espacio.imagen_sec_3 || '',
          imagen_sec_4: espacio.imagen_sec_4 || '',
          id_admin_esp_dep: espacio.id_admin_esp_dep || ''
        });
        setCurrentEspacio(espacio);
        setEditMode(true);
        setModalOpen(true);
      } else {
        alert(response.data.mensaje);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.mensaje || 'Error de conexión al servidor';
      setError(errorMessage);
      console.error(err);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentEspacio(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      const filteredData = Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => {
          const requiredFields = ['nombre', 'id_admin_esp_dep'];
          if (requiredFields.includes(key)) return true;
          return value !== '' && value !== null && value !== undefined;
        })
      );

      // Validaciones frontend
      if (filteredData.nombre && filteredData.nombre.length > 100) {
        setError('El nombre no debe exceder los 100 caracteres');
        return;
      }
      if (filteredData.direccion && filteredData.direccion.length > 255) {
        setError('La dirección no debe exceder los 255 caracteres');
        return;
      }
      if (filteredData.imagen_pricipal && filteredData.imagen_pricipal.length > 255) {
        setError('La URL de la imagen principal no debe exceder los 255 caracteres');
        return;
      }
      if (filteredData.imagen_sec_1 && filteredData.imagen_sec_1.length > 255) {
        setError('La URL de la imagen secundaria 1 no debe exceder los 255 caracteres');
        return;
      }
      if (filteredData.imagen_sec_2 && filteredData.imagen_sec_2.length > 255) {
        setError('La URL de la imagen secundaria 2 no debe exceder los 255 caracteres');
        return;
      }
      if (filteredData.imagen_sec_3 && filteredData.imagen_sec_3.length > 255) {
        setError('La URL de la imagen secundaria 3 no debe exceder los 255 caracteres');
        return;
      }
      if (filteredData.imagen_sec_4 && filteredData.imagen_sec_4.length > 255) {
        setError('La URL de la imagen secundaria 4 no debe exceder los 255 caracteres');
        return;
      }
      if (filteredData.latitud && (filteredData.latitud < -90 || filteredData.latitud > 90)) {
        setError('La latitud debe estar entre -90 y 90');
        return;
      }
      if (filteredData.longitud && (filteredData.longitud < -180 || filteredData.longitud > 180)) {
        setError('La longitud debe estar entre -180 y 180');
        return;
      }
      const validarHora = (hora) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(hora);
      if (filteredData.horario_apertura && !validarHora(filteredData.horario_apertura)) {
        setError('La hora de apertura no es válida (formato HH:MM:SS)');
        return;
      }
      if (filteredData.horario_cierre && !validarHora(filteredData.horario_cierre)) {
        setError('La hora de cierre no es válida (formato HH:MM:SS)');
        return;
      }
      if (filteredData.id_admin_esp_dep && !administradores.some(admin => admin.id_admin_esp_dep === parseInt(filteredData.id_admin_esp_dep))) {
        setError('El administrador seleccionado no es válido');
        return;
      }

      if (editMode) {
        response = await api.patch(`/espacio_deportivo/${currentEspacio.id_espacio}`, filteredData);
      } else {
        response = await api.post('/espacio_deportivo/', filteredData);
      }
      if (response.data.exito) {
        closeModal();
        fetchEspacios();
      } else {
        alert(response.data.mensaje);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.mensaje || 'Error de conexión al servidor';
      setError(errorMessage);
      console.error(err);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(total / limit)) {
      setPage(newPage);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Gestión de Espacios Deportivos</h2>
      
      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, dirección, descripción o administrador..."
            className="border rounded-l px-4 py-2 w-96"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600">
            Buscar
          </button>
        </form>

        <select
          value={filtro}
          onChange={handleFiltroChange}
          className="border rounded px-4 py-2 mx-4"
        >
          <option value="">Sin filtro</option>
          <option value="nombre">Por nombre</option>
        </select>

        <button
          onClick={openCreateModal}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Crear Espacio Deportivo
        </button>
      </div>

      {loading ? (
        <p>Cargando espacios deportivos...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">Dirección</th>
                  <th className="px-4 py-2 text-left">Horario</th>
                  <th className="px-4 py-2 text-left">Administrador</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {espacios.map((espacio, index) => (
                  <tr key={espacio.id_espacio} className="border-t">
                    <td className="px-4 py-2">{(page - 1) * limit + index + 1}</td>
                    <td className="px-4 py-2">{espacio.nombre}</td>
                    <td className="px-4 py-2">{espacio.direccion || '-'}</td>
                    <td className="px-4 py-2">
                      {espacio.horario_apertura && espacio.horario_cierre
                        ? `${espacio.horario_apertura} - ${espacio.horario_cierre}`
                        : '-'}
                    </td>
                    <td className="px-4 py-2">{`${espacio.admin_nombre} ${espacio.admin_apellido}`}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openEditModal(espacio.id_espacio)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(espacio.id_espacio)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-l hover:bg-gray-400 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-4 py-2 bg-gray-100">
              Página {page} de {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === Math.ceil(total / limit)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-r hover:bg-gray-400 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editMode ? 'Editar Espacio Deportivo' : 'Crear Espacio Deportivo'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dirección</label>
                <input
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Latitud</label>
                <input
                  name="latitud"
                  value={formData.latitud}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  type="number"
                  step="0.000001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Longitud</label>
                <input
                  name="longitud"
                  value={formData.longitud}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  type="number"
                  step="0.000001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Horario de Apertura</label>
                <input
                  name="horario_apertura"
                  value={formData.horario_apertura}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  type="time"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Horario de Cierre</label>
                <input
                  name="horario_cierre"
                  value={formData.horario_cierre}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  type="time"
                  step="1"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Imagen Principal (URL)</label>
                <input
                  name="imagen_pricipal"
                  value={formData.imagen_pricipal}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Imagen Secundaria 1 (URL)</label>
                <input
                  name="imagen_sec_1"
                  value={formData.imagen_sec_1}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Imagen Secundaria 2 (URL)</label>
                <input
                  name="imagen_sec_2"
                  value={formData.imagen_sec_2}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Imagen Secundaria 3 (URL)</label>
                <input
                  name="imagen_sec_3"
                  value={formData.imagen_sec_3}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Imagen Secundaria 4 (URL)</label>
                <input
                  name="imagen_sec_4"
                  value={formData.imagen_sec_4}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Administrador</label>
                <select
                  name="id_admin_esp_dep"
                  value={formData.id_admin_esp_dep}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Seleccione un administrador</option>
                  {administradores.map(admin => (
                    <option key={admin.id_admin_esp_dep} value={admin.id_admin_esp_dep}>
                      {`${admin.nombre} ${admin.apellido}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {editMode ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EspacioDeportivo;