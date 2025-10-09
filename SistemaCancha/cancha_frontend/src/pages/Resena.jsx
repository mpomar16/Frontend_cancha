import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Resena = () => {
  const [resenas, setResenas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtro, setFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentResena, setCurrentResena] = useState(null);
  const [formData, setFormData] = useState({
    id_reserva: '',
    estrellas: '',
    comentario: '',
    fecha_creacion: new Date().toISOString().split('T')[0],
    estado: false
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Fetch reservas válidas al cargar el componente
  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const response = await api.get('/reserva/datos-especificos'); // Ajustar endpoint según tu API
        if (response.data.exito) {
          setReservas(response.data.datos.reservas || []);
        }
      } catch (err) {
        console.error('Error al obtener reservas:', err);
      }
    };
    fetchReservas();
  }, []);

  const fetchResenas = async (params = {}) => {
    setLoading(true);
    setError(null);
    const offset = (page - 1) * limit;
    const fullParams = { ...params, limit, offset };
    try {
      let response;
      if (params.q) {
        response = await api.get('/resena/buscar', { params: fullParams });
      } else if (params.tipo) {
        response = await api.get('/resena/filtro', { params: fullParams });
      } else {
        response = await api.get('/resena/datos-especificos', { params: fullParams });
      }
      if (response.data.exito) {
        setResenas(response.data.datos.resenas);
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
    fetchResenas();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    if (searchTerm.trim()) {
      fetchResenas({ q: searchTerm });
    } else {
      fetchResenas();
    }
  };

  const handleFiltroChange = (e) => {
    const tipo = e.target.value;
    setFiltro(tipo);
    setPage(1);
    if (tipo) {
      fetchResenas({ tipo });
    } else {
      fetchResenas();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta reseña?')) return;
    try {
      const response = await api.delete(`/resena/${id}`);
      if (response.data.exito) {
        fetchResenas();
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
      id_reserva: '',
      estrellas: '',
      comentario: '',
      fecha_creacion: new Date().toISOString().split('T')[0],
      estado: false
    });
    setModalOpen(true);
  };

  const openEditModal = async (id) => {
    try {
      const response = await api.get(`/resena/dato-individual/${id}`);
      if (response.data.exito) {
        const resena = response.data.datos.resena;
        setFormData({
          id_reserva: resena.id_reserva || '',
          estrellas: resena.estrellas || '',
          comentario: resena.comentario || '',
          fecha_creacion: resena.fecha_creacion ? new Date(resena.fecha_creacion).toISOString().split('T')[0] : '',
          estado: resena.estado !== undefined ? resena.estado : false
        });
        setCurrentResena(resena);
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
    setCurrentResena(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      const filteredData = Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => {
          const requiredFields = ['id_reserva', 'estrellas'];
          if (requiredFields.includes(key)) return true;
          return value !== '' && value !== null && value !== undefined;
        })
      );

      // Validaciones frontend
      if (filteredData.estrellas && (isNaN(filteredData.estrellas) || filteredData.estrellas < 1 || filteredData.estrellas > 5)) {
        setError('Las estrellas deben estar entre 1 y 5');
        return;
      }
      if (filteredData.fecha_creacion) {
        const fechaCreacion = new Date(filteredData.fecha_creacion);
        if (isNaN(fechaCreacion.getTime())) {
          setError('La fecha de creación no es válida');
          return;
        }
      }
      if (filteredData.id_reserva && !reservas.some(reserva => reserva.id_reserva === parseInt(filteredData.id_reserva))) {
        setError('La reserva seleccionada no es válida');
        return;
      }

      if (editMode) {
        response = await api.patch(`/resena/${currentResena.id_resena}`, filteredData);
      } else {
        response = await api.post('/resena/', filteredData);
      }
      if (response.data.exito) {
        closeModal();
        fetchResenas();
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
      <h2 className="text-xl font-semibold mb-4">Gestión de Reseñas</h2>
      
      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, cancha o comentario..."
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
          <option value="estrellas">Por estrellas</option>
          <option value="fecha">Por fecha</option>
          <option value="estado">Por estado</option>
        </select>

        <button
          onClick={openCreateModal}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Crear Reseña
        </button>
      </div>

      {loading ? (
        <p>Cargando reseñas...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Cliente</th>
                  <th className="px-4 py-2 text-left">Cancha</th>
                  <th className="px-4 py-2 text-left">Estrellas</th>
                  <th className="px-4 py-2 text-left">Comentario</th>
                  <th className="px-4 py-2 text-left">Fecha Creación</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {resenas.map((resena, index) => (
                  <tr key={resena.id_resena} className="border-t">
                    <td className="px-4 py-2">{(page - 1) * limit + index + 1}</td>
                    <td className="px-4 py-2">{`${resena.cliente_nombre} ${resena.cliente_apellido}`}</td>
                    <td className="px-4 py-2">{resena.cancha_nombre}</td>
                    <td className="px-4 py-2">{resena.estrellas}</td>
                    <td className="px-4 py-2">{resena.comentario || '-'}</td>
                    <td className="px-4 py-2">{new Date(resena.fecha_creacion).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{resena.estado ? 'Activa' : 'Inactiva'}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openEditModal(resena.id_resena)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(resena.id_resena)}
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
              {editMode ? 'Editar Reseña' : 'Crear Reseña'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Reserva</label>
                <select
                  name="id_reserva"
                  value={formData.id_reserva}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Seleccione una reserva</option>
                  {reservas.map(reserva => (
                    <option key={reserva.id_reserva} value={reserva.id_reserva}>
                      Reserva #{reserva.id_reserva} - {reserva.cliente_nombre} {reserva.cliente_apellido} ({reserva.cancha_nombre})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estrellas</label>
                <input
                  name="estrellas"
                  value={formData.estrellas}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  type="number"
                  min="1"
                  max="5"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Comentario</label>
                <textarea
                  name="comentario"
                  value={formData.comentario}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Creación</label>
                <input
                  name="fecha_creacion"
                  value={formData.fecha_creacion}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  type="date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <input
                  name="estado"
                  type="checkbox"
                  checked={formData.estado}
                  onChange={handleInputChange}
                  className="w-5 h-5 mt-2"
                />
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

export default Resena;