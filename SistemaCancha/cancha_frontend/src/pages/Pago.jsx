import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Pago = () => {
  const [pagos, setPagos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtro, setFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPago, setCurrentPago] = useState(null);
  const [formData, setFormData] = useState({
    monto: '',
    metodo_pago: 'tarjeta',
    fecha_pago: '',
    id_reserva: ''
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Fetch reservas válidas al cargar el componente
  useEffect(() => {
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

    fetchReservas();
  }, []);

  const fetchPagos = async (params = {}) => {
    setLoading(true);
    setError(null);
    const offset = (page - 1) * limit;
    const fullParams = { ...params, limit, offset };
    try {
      let response;
      if (params.q) {
        response = await api.get('/pago/buscar', { params: fullParams });
      } else if (params.tipo) {
        response = await api.get('/pago/filtro', { params: fullParams });
      } else {
        response = await api.get('/pago/datos-especificos', { params: fullParams });
      }
      if (response.data.exito) {
        setPagos(response.data.datos.pagos);
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
    fetchPagos();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    if (searchTerm.trim()) {
      fetchPagos({ q: searchTerm });
    } else {
      fetchPagos();
    }
  };

  const handleFiltroChange = (e) => {
    const tipo = e.target.value;
    setFiltro(tipo);
    setPage(1);
    if (tipo) {
      fetchPagos({ tipo });
    } else {
      fetchPagos();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este pago?')) return;
    try {
      const response = await api.delete(`/pago/${id}`);
      if (response.data.exito) {
        fetchPagos();
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
      monto: '',
      metodo_pago: 'tarjeta',
      fecha_pago: new Date().toISOString().split('T')[0],
      id_reserva: ''
    });
    setModalOpen(true);
  };

  const openEditModal = async (id) => {
    try {
      const response = await api.get(`/pago/dato-individual/${id}`);
      if (response.data.exito) {
        const pago = response.data.datos.pago;
        setFormData({
          monto: pago.monto || '',
          metodo_pago: pago.metodo_pago || 'tarjeta',
          fecha_pago: pago.fecha_pago ? new Date(pago.fecha_pago).toISOString().split('T')[0] : '',
          id_reserva: pago.id_reserva || ''
        });
        setCurrentPago(pago);
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
    setCurrentPago(null);
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
          const requiredFields = ['monto', 'metodo_pago', 'id_reserva'];
          if (requiredFields.includes(key)) return true;
          return value !== '' && value !== null && value !== undefined;
        })
      );

      // Validaciones frontend
      if (!filteredData.monto || isNaN(filteredData.monto) || filteredData.monto <= 0) {
        setError('El monto es obligatorio y debe ser un número positivo');
        return;
      }
      const metodosValidos = ['tarjeta', 'efectivo', 'transferencia', 'QR'];
      if (!filteredData.metodo_pago || !metodosValidos.includes(filteredData.metodo_pago)) {
        setError(`El método de pago debe ser uno de: ${metodosValidos.join(', ')}`);
        return;
      }
      if (!filteredData.id_reserva || !reservas.some(reserva => reserva.id_reserva === parseInt(filteredData.id_reserva))) {
        setError('La reserva seleccionada no es válida');
        return;
      }
      if (filteredData.fecha_pago) {
        const fechaPago = new Date(filteredData.fecha_pago);
        if (isNaN(fechaPago.getTime())) {
          setError('La fecha de pago no es válida');
          return;
        }
      }

      if (editMode) {
        response = await api.patch(`/pago/${currentPago.id_pago}`, filteredData);
      } else {
        response = await api.post('/pago/', filteredData);
      }
      if (response.data.exito) {
        closeModal();
        fetchPagos();
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
      <h2 className="text-xl font-semibold mb-4">Gestión de Pagos</h2>
      
      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, cancha o método de pago..."
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
          <option value="fecha">Por fecha</option>
          <option value="monto">Por monto</option>
          <option value="metodo">Por método de pago</option>
        </select>

        <button
          onClick={openCreateModal}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Crear Pago
        </button>
      </div>

      {loading ? (
        <p>Cargando pagos...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Reserva</th>
                  <th className="px-4 py-2 text-left">Cliente</th>
                  <th className="px-4 py-2 text-left">Cancha</th>
                  <th className="px-4 py-2 text-left">Monto</th>
                  <th className="px-4 py-2 text-left">Método de Pago</th>
                  <th className="px-4 py-2 text-left">Fecha de Pago</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago, index) => (
                  <tr key={pago.id_pago} className="border-t">
                    <td className="px-4 py-2">{(page - 1) * limit + index + 1}</td>
                    <td className="px-4 py-2">{`#${pago.id_reserva}`}</td>
                    <td className="px-4 py-2">{`${pago.cliente_nombre} ${pago.cliente_apellido}`}</td>
                    <td className="px-4 py-2">{pago.cancha_nombre}</td>
                    <td className="px-4 py-2">{pago.monto ? `$${pago.monto}` : '-'}</td>
                    <td className="px-4 py-2">{pago.metodo_pago}</td>
                    <td className="px-4 py-2">{pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openEditModal(pago.id_pago)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(pago.id_pago)}
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
              {editMode ? 'Editar Pago' : 'Crear Pago'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
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
                      #{reserva.id_reserva} - {reserva.cliente_nombre} {reserva.cliente_apellido} ({reserva.cancha_nombre})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monto</label>
                <input
                  name="monto"
                  value={formData.monto}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Método de Pago</label>
                <select
                  name="metodo_pago"
                  value={formData.metodo_pago}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="tarjeta">Tarjeta</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="QR">QR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Pago</label>
                <input
                  name="fecha_pago"
                  value={formData.fecha_pago}
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

export default Pago;