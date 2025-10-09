import React, { useState, useEffect } from 'react';
import api from '../services/api';

const QRReserva = () => {
  const [qrs, setQRs] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [controles, setControles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtro, setFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentQR, setCurrentQR] = useState(null);
  const [formData, setFormData] = useState({
    id_reserva: '',
    fecha_generado: new Date().toISOString().slice(0, 16),
    fecha_expira: '',
    qr_url_imagen: '',
    codigo_qr: '',
    estado: 'activo',
    id_control: ''
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [previewQR, setPreviewQR] = useState(null);

  // Fetch reservas y controles válidos al cargar el componente
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

    const fetchControles = async () => {
      try {
        const response = await api.get('/control/datos-especificos'); // Suponiendo que existe un endpoint para controles
        if (response.data.exito) {
          setControles(response.data.datos.controles || []);
        }
      } catch (err) {
        console.error('Error al obtener controles:', err);
      }
    };

    fetchReservas();
    fetchControles();
  }, []);

  const fetchQRs = async (params = {}) => {
    setLoading(true);
    setError(null);
    const offset = (page - 1) * limit;
    const fullParams = { ...params, limit, offset };
    try {
      let response;
      if (params.q) {
        response = await api.get('/qr_reserva/buscar', { params: fullParams });
      } else if (params.tipo) {
        response = await api.get('/qr_reserva/filtro', { params: fullParams });
      } else {
        response = await api.get('/qr_reserva/datos-especificos', { params: fullParams });
      }
      if (response.data.exito) {
        setQRs(response.data.datos.qrs);
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
    fetchQRs();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    if (searchTerm.trim()) {
      fetchQRs({ q: searchTerm });
    } else {
      fetchQRs();
    }
  };

  const handleFiltroChange = (e) => {
    const tipo = e.target.value;
    setFiltro(tipo);
    setPage(1);
    if (tipo) {
      fetchQRs({ tipo });
    } else {
      fetchQRs();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este QR de reserva?')) return;
    try {
      const response = await api.delete(`/qr_reserva/${id}`);
      if (response.data.exito) {
        fetchQRs();
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
      fecha_generado: new Date().toISOString().slice(0, 16),
      fecha_expira: '',
      qr_url_imagen: '',
      codigo_qr: '',
      estado: 'activo',
      id_control: ''
    });
    setPreviewQR(null);
    setModalOpen(true);
  };

  const openEditModal = async (id) => {
    try {
      const response = await api.get(`/qr_reserva/dato-individual/${id}`);
      if (response.data.exito) {
        const qr = response.data.datos.qr;
        setFormData({
          id_reserva: qr.id_reserva || '',
          fecha_generado: qr.fecha_generado ? new Date(qr.fecha_generado).toISOString().slice(0, 16) : '',
          fecha_expira: qr.fecha_expira ? new Date(qr.fecha_expira).toISOString().slice(0, 16) : '',
          qr_url_imagen: qr.qr_url_imagen || '',
          codigo_qr: qr.codigo_qr || '',
          estado: qr.estado || 'activo',
          id_control: qr.id_control || ''
        });
        setPreviewQR(qr.qr_url_imagen || null);
        setCurrentQR(qr);
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
    setCurrentQR(null);
    setPreviewQR(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'qr_url_imagen' && value) {
      setPreviewQR(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      const filteredData = Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => {
          const requiredFields = ['id_reserva', 'fecha_generado'];
          if (requiredFields.includes(key)) return true;
          return value !== '' && value !== null && value !== undefined;
        })
      );

      // Validaciones frontend
      if (!filteredData.id_reserva || !reservas.some(reserva => reserva.id_reserva === parseInt(filteredData.id_reserva))) {
        setError('La reserva seleccionada no es válida');
        return;
      }
      if (!filteredData.fecha_generado) {
        setError('La fecha de generación es obligatoria');
        return;
      }
      const fechaGenerado = new Date(filteredData.fecha_generado);
      if (isNaN(fechaGenerado.getTime())) {
        setError('La fecha de generación no es válida');
        return;
      }
      if (filteredData.fecha_expira) {
        const fechaExpira = new Date(filteredData.fecha_expira);
        if (isNaN(fechaExpira.getTime())) {
          setError('La fecha de expiración no es válida');
          return;
        }
        if (fechaExpira <= fechaGenerado) {
          setError('La fecha de expiración debe ser posterior a la fecha de generación');
          return;
        }
      }
      if (filteredData.qr_url_imagen && filteredData.qr_url_imagen.length > 255) {
        setError('La URL de la imagen del QR no debe exceder los 255 caracteres');
        return;
      }
      if (filteredData.codigo_qr && filteredData.codigo_qr.length > 255) {
        setError('El código QR no debe exceder los 255 caracteres');
        return;
      }
      const estadosValidos = ['activo', 'expirado', 'usado'];
      if (filteredData.estado && !estadosValidos.includes(filteredData.estado)) {
        setError(`El estado debe ser uno de: ${estadosValidos.join(', ')}`);
        return;
      }
      if (filteredData.id_control && !controles.some(control => control.id_control === parseInt(filteredData.id_control))) {
        setError('El control seleccionado no es válido');
        return;
      }

      if (editMode) {
        response = await api.patch(`/qr_reserva/${currentQR.id_qr}`, filteredData);
      } else {
        response = await api.post('/qr_reserva/', filteredData);
      }
      if (response.data.exito) {
        closeModal();
        fetchQRs();
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
      <h2 className="text-xl font-semibold mb-4">Gestión de QR de Reservas</h2>
      
      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, cancha o código QR..."
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
          <option value="fecha_generado">Por fecha de generación</option>
          <option value="estado">Por estado</option>
        </select>

        <button
          onClick={openCreateModal}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Crear QR
        </button>
      </div>

      {loading ? (
        <p>Cargando QRs de reserva...</p>
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
                  <th className="px-4 py-2 text-left">Fecha Generado</th>
                  <th className="px-4 py-2 text-left">Fecha Expira</th>
                  <th className="px-4 py-2 text-left">Código QR</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {qrs.map((qr, index) => (
                  <tr key={qr.id_qr} className="border-t">
                    <td className="px-4 py-2">{(page - 1) * limit + index + 1}</td>
                    <td className="px-4 py-2">{`#${qr.id_reserva}`}</td>
                    <td className="px-4 py-2">{`${qr.cliente_nombre} ${qr.cliente_apellido}`}</td>
                    <td className="px-4 py-2">{qr.cancha_nombre}</td>
                    <td className="px-4 py-2">{new Date(qr.fecha_generado).toLocaleString()}</td>
                    <td className="px-4 py-2">{qr.fecha_expira ? new Date(qr.fecha_expira).toLocaleString() : '-'}</td>
                    <td className="px-4 py-2">{qr.codigo_qr || '-'}</td>
                    <td className="px-4 py-2">{qr.estado}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openEditModal(qr.id_qr)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(qr.id_qr)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                      {qr.qr_url_imagen && (
                        <a
                          href={qr.qr_url_imagen}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-700 ml-2"
                        >
                          Ver QR
                        </a>
                      )}
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
              {editMode ? 'Editar QR de Reserva' : 'Crear QR de Reserva'}
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
                <label className="block text-sm font-medium mb-1">Fecha de Generación</label>
                <input
                  name="fecha_generado"
                  value={formData.fecha_generado}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  type="datetime-local"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Expiración</label>
                <input
                  name="fecha_expira"
                  value={formData.fecha_expira}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  type="datetime-local"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL de Imagen QR</label>
                <input
                  name="qr_url_imagen"
                  value={formData.qr_url_imagen}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  type="url"
                  placeholder="https://example.com/qr.png"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Código QR</label>
                <input
                  name="codigo_qr"
                  value={formData.codigo_qr}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  type="text"
                  maxLength="255"
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
                  <option value="activo">Activo</option>
                  <option value="expirado">Expirado</option>
                  <option value="usado">Usado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Control</label>
                <select
                  name="id_control"
                  value={formData.id_control}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Ninguno</option>
                  {controles.map(control => (
                    <option key={control.id_control} value={control.id_control}>
                      #{control.id_control} - {control.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {previewQR && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Vista previa del QR</label>
                  <img src={previewQR} alt="Vista previa del QR" className="max-w-xs h-auto" />
                </div>
              )}
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

export default QRReserva;