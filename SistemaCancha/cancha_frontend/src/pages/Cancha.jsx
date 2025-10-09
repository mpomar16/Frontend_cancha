import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Cancha = () => {
  const [canchas, setCanchas] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtro, setFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCancha, setCurrentCancha] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    capacidad: '',
    estado: '',
    monto_por_hora: '',
    imagen_cancha: '',
    id_espacio: ''
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Fetch espacios deportivos válidos al cargar el componente
  useEffect(() => {
    const fetchEspacios = async () => {
      try {
        const response = await api.get('/espacio_deportivo/datos-especificos');
        if (response.data.exito) {
          setEspacios(response.data.datos.espacios || []);
        }
      } catch (err) {
        console.error('Error al obtener espacios deportivos:', err);
      }
    };
    fetchEspacios();
  }, []);

  const fetchCanchas = async (params = {}) => {
    setLoading(true);
    setError(null);
    const offset = (page - 1) * limit;
    const fullParams = { ...params, limit, offset };
    try {
      let response;
      if (params.q) {
        response = await api.get('/cancha/buscar', { params: fullParams });
      } else if (params.tipo) {
        response = await api.get('/cancha/filtro', { params: fullParams });
      } else {
        response = await api.get('/cancha/datos-especificos', { params: fullParams });
      }
      if (response.data.exito) {
        setCanchas(response.data.datos.canchas);
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
    fetchCanchas();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    if (searchTerm.trim()) {
      fetchCanchas({ q: searchTerm });
    } else {
      fetchCanchas();
    }
  };

  const handleFiltroChange = (e) => {
    const tipo = e.target.value;
    setFiltro(tipo);
    setPage(1);
    if (tipo) {
      fetchCanchas({ tipo });
    } else {
      fetchCanchas();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta cancha?')) return;
    try {
      const response = await api.delete(`/cancha/${id}`);
      if (response.data.exito) {
        fetchCanchas();
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
      ubicacion: '',
      capacidad: '',
      estado: '',
      monto_por_hora: '',
      imagen_cancha: '',
      id_espacio: ''
    });
    setModalOpen(true);
  };

  const openEditModal = async (id) => {
    try {
      const response = await api.get(`/cancha/dato-individual/${id}`);
      if (response.data.exito) {
        const cancha = response.data.datos.cancha;
        setFormData({
          nombre: cancha.nombre || '',
          ubicacion: cancha.ubicacion || '',
          capacidad: cancha.capacidad || '',
          estado: cancha.estado || '',
          monto_por_hora: cancha.monto_por_hora || '',
          imagen_cancha: cancha.imagen_cancha || '',
          id_espacio: cancha.id_espacio || ''
        });
        setCurrentCancha(cancha);
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
    setCurrentCancha(null);
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
          const requiredFields = ['nombre', 'id_espacio'];
          if (requiredFields.includes(key)) return true;
          return value !== '' && value !== null && value !== undefined;
        })
      );

      // Validaciones frontend
      if (filteredData.nombre && filteredData.nombre.length > 100) {
        setError('El nombre no debe exceder los 100 caracteres');
        return;
      }
      if (filteredData.ubicacion && filteredData.ubicacion.length > 255) {
        setError('La ubicación no debe exceder los 255 caracteres');
        return;
      }
      if (filteredData.imagen_cancha && filteredData.imagen_cancha.length > 255) {
        setError('La URL de la imagen no debe exceder los 255 caracteres');
        return;
      }
      if (filteredData.capacidad && (isNaN(filteredData.capacidad) || filteredData.capacidad < 0)) {
        setError('La capacidad debe ser un número positivo');
        return;
      }
      const estadosValidos = ['disponible', 'ocupada', 'mantenimiento'];
      if (filteredData.estado && !estadosValidos.includes(filteredData.estado)) {
        setError(`El estado debe ser uno de: ${estadosValidos.join(', ')}`);
        return;
      }
      if (filteredData.monto_por_hora && (isNaN(filteredData.monto_por_hora) || filteredData.monto_por_hora < 0)) {
        setError('El monto por hora debe ser un número positivo');
        return;
      }
      if (filteredData.id_espacio && !espacios.some(espacio => espacio.id_espacio === parseInt(filteredData.id_espacio))) {
        setError('El espacio deportivo seleccionado no es válido');
        return;
      }

      if (editMode) {
        response = await api.patch(`/cancha/${currentCancha.id_cancha}`, filteredData);
      } else {
        response = await api.post('/cancha/', filteredData);
      }
      if (response.data.exito) {
        closeModal();
        fetchCanchas();
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
      <h2 className="text-xl font-semibold mb-4">Gestión de Canchas</h2>
      
      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, ubicación o espacio deportivo..."
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
          <option value="estado">Por estado</option>
          <option value="monto">Por monto por hora</option>
        </select>

        <button
          onClick={openCreateModal}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Crear Cancha
        </button>
      </div>

      {loading ? (
        <p>Cargando canchas...</p>
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
                  <th className="px-4 py-2 text-left">Ubicación</th>
                  <th className="px-4 py-2 text-left">Capacidad</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-left">Monto por Hora</th>
                  <th className="px-4 py-2 text-left">Espacio Deportivo</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {canchas.map((cancha, index) => (
                  <tr key={cancha.id_cancha} className="border-t">
                    <td className="px-4 py-2">{(page - 1) * limit + index + 1}</td>
                    <td className="px-4 py-2">{cancha.nombre}</td>
                    <td className="px-4 py-2">{cancha.ubicacion || '-'}</td>
                    <td className="px-4 py-2">{cancha.capacidad || '-'}</td>
                    <td className="px-4 py-2">{cancha.estado || '-'}</td>
                    <td className="px-4 py-2">{cancha.monto_por_hora ? `$${cancha.monto_por_hora}` : '-'}</td>
                    <td className="px-4 py-2">{cancha.espacio_nombre}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openEditModal(cancha.id_cancha)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cancha.id_cancha)}
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
              {editMode ? 'Editar Cancha' : 'Crear Cancha'}
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
                <label className="block text-sm font-medium mb-1">Ubicación</label>
                <input
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacidad</label>
                <input
                  name="capacidad"
                  value={formData.capacidad}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  type="number"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Seleccione un estado</option>
                  <option value="disponible">Disponible</option>
                  <option value="ocupada">Ocupada</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monto por Hora</label>
                <input
                  name="monto_por_hora"
                  value={formData.monto_por_hora}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  type="number"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Imagen (URL)</label>
                <input
                  name="imagen_cancha"
                  value={formData.imagen_cancha}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Espacio Deportivo</label>
                <select
                  name="id_espacio"
                  value={formData.id_espacio}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Seleccione un espacio deportivo</option>
                  {espacios.map(espacio => (
                    <option key={espacio.id_espacio} value={espacio.id_espacio}>
                      {espacio.nombre}
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

export default Cancha;