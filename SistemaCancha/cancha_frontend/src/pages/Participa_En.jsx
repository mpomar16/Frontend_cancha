import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ParticipaEn = () => {
  const [participaEn, setParticipaEn] = useState([]);
  const [deportistas, setDeportistas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtro, setFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentParticipaEn, setCurrentParticipaEn] = useState(null);
  const [formData, setFormData] = useState({
    id_deportista: '',
    id_reserva: '',
    fecha_reserva: ''
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Fetch deportistas y reservas válidas al cargar el componente
  useEffect(() => {
    const fetchDeportistas = async () => {
      try {
        const response = await api.get('/deportista/datos-especificos'); // Ajustar endpoint según tu API
        if (response.data.exito) {
          setDeportistas(response.data.datos.deportistas || []);
        }
      } catch (err) {
        console.error('Error al obtener deportistas:', err);
      }
    };

    const fetchReservas = async () => {
      try {
        const response = await api.get('/reserva/datos-especificos');
        if (response.data.exito) {
          setReservas(response.data.datos.reservas || []);
        }
      } catch (err) {
        console.error('Error al obtener reservas:', err);
      }
    };

    fetchDeportistas();
    fetchReservas();
  }, []);

  const fetchParticipaEn = async (params = {}) => {
    setLoading(true);
    setError(null);
    const offset = (page - 1) * limit;
    const fullParams = { ...params, limit, offset };
    try {
      let response;
      if (params.q) {
        response = await api.get('/participa_en/buscar', { params: fullParams });
      } else if (params.tipo) {
        response = await api.get('/participa_en/filtro', { params: fullParams });
      } else {
        response = await api.get('/participa_en/datos-especificos', { params: fullParams });
      }
      if (response.data.exito) {
        setParticipaEn(response.data.datos.participa_en);
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
    fetchParticipaEn();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    if (searchTerm.trim()) {
      fetchParticipaEn({ q: searchTerm });
    } else {
      fetchParticipaEn();
    }
  };

  const handleFiltroChange = (e) => {
    const tipo = e.target.value;
    setFiltro(tipo);
    setPage(1);
    if (tipo) {
      fetchParticipaEn({ tipo });
    } else {
      fetchParticipaEn();
    }
  };

  const handleDelete = async (id_deportista, id_reserva) => {
    if (!window.confirm('¿Estás seguro de eliminar esta relación participa_en?')) return;
    try {
      const response = await api.delete(`/participa_en/${id_deportista}/${id_reserva}`);
      if (response.data.exito) {
        fetchParticipaEn();
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
      id_deportista: '',
      id_reserva: '',
      fecha_reserva: ''
    });
    setModalOpen(true);
  };

  const openEditModal = async (id_deportista, id_reserva) => {
    try {
      const response = await api.get(`/participa_en/dato-individual/${id_deportista}/${id_reserva}`);
      if (response.data.exito) {
        const participaEn = response.data.datos.participa_en;
        setFormData({
          id_deportista: participaEn.id_deportista || '',
          id_reserva: participaEn.id_reserva || '',
          fecha_reserva: participaEn.fecha_reserva ? new Date(participaEn.fecha_reserva).toISOString().split('T')[0] : ''
        });
        setCurrentParticipaEn(participaEn);
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
    setCurrentParticipaEn(null);
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
          const requiredFields = ['id_deportista', 'id_reserva'];
          if (requiredFields.includes(key)) return true;
          return value !== '' && value !== null && value !== undefined;
        })
      );

      // Validaciones frontend
      if (!filteredData.id_deportista || !deportistas.some(deportista => deportista.id_deportista === parseInt(filteredData.id_deportista))) {
        setError('El deportista seleccionado no es válido');
        return;
      }
      if (!filteredData.id_reserva || !reservas.some(reserva => reserva.id_reserva === parseInt(filteredData.id_reserva))) {
        setError('La reserva seleccionada no es válida');
        return;
      }
      if (filteredData.fecha_reserva) {
        const fechaReserva = new Date(filteredData.fecha_reserva);
        if (isNaN(fechaReserva.getTime())) {
          setError('La fecha de reserva no es válida');
          return;
        }
      }

      if (editMode) {
        response = await api.patch(`/participa_en/${currentParticipaEn.id_deportista}/${currentParticipaEn.id_reserva}`, filteredData);
      } else {
        response = await api.post('/participa_en/', filteredData);
      }
      if (response.data.exito) {
        closeModal();
        fetchParticipaEn();
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
      <h2 className="text-xl font-semibold mb-4">Gestión de Relaciones Participa En</h2>
      
      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por deportista, cliente o cancha..."
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
          <option value="deportista">Por deportista</option>
          <option value="reserva">Por reserva</option>
          <option value="fecha">Por fecha</option>
        </select>

        <button
          onClick={openCreateModal}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Crear Relación
        </button>
      </div>

      {loading ? (
        <p>Cargando relaciones participa_en...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Deportista</th>
                  <th className="px-4 py-2 text-left">Cliente</th>
                  <th className="px-4 py-2 text-left">Cancha</th>
                  <th className="px-4 py-2 text-left">Fecha Reserva</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {participaEn.map((relacion, index) => (
                  <tr key={`${relacion.id_deportista}-${relacion.id_reserva}`} className="border-t">
                    <td className="px-4 py-2">{(page - 1) * limit + index + 1}</td>
                    <td className="px-4 py-2">{`${relacion.deportista_nombre} ${relacion.deportista_apellido}`}</td>
                    <td className="px-4 py-2">{`${relacion.cliente_nombre} ${relacion.cliente_apellido}`}</td>
                    <td className="px-4 py-2">{relacion.cancha_nombre}</td>
                    <td className="px-4 py-2">{relacion.fecha_reserva ? new Date(relacion.fecha_reserva).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openEditModal(relacion.id_deportista, relacion.id_reserva)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(relacion.id_deportista, relacion.id_reserva)}
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
              {editMode ? 'Editar Relación Participa En' : 'Crear Relación Participa En'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Deportista</label>
                <select
                  name="id_deportista"
                  value={formData.id_deportista}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                  disabled={editMode}
                >
                  <option value="">Seleccione un deportista</option>
                  {deportistas.map(deportista => (
                    <option key={deportista.id_deportista} value={deportista.id_deportista}>
                      {deportista.nombre} {deportista.apellido}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reserva</label>
                <select
                  name="id_reserva"
                  value={formData.id_reserva}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                  disabled={editMode}
                >
                  <option value="">Seleccione una reserva</option>
                  {reservas.map(reserva => (
                    <option key={reserva.id_reserva} value={reserva.id_reserva}>
                      Reserva #{reserva.id_reserva} - {reserva.cliente_nombre} {reserva.cliente_apellido} ({reserva.cancha_nombre})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Fecha de Reserva</label>
                <input
                  name="fecha_reserva"
                  value={formData.fecha_reserva}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  type="date"
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

export default ParticipaEn;