import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Cliente = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtro, setFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCliente, setCurrentCliente] = useState(null);
  const [formData, setFormData] = useState({
    id_cliente: '',
    nombre: '',
    apellido: '',
    correo: '',
    usuario: '',
    fecha_registro: '',
    fecha_nac: '',
    carnet_identidad: '',
    ci_complemento: '',
    contrasena: '' // Solo para creación
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchClientes = async (params = {}) => {
    setLoading(true);
    setError(null);
    const offset = (page - 1) * limit;
    const fullParams = { ...params, limit, offset };
    try {
      let response;
      if (params.q) {
        response = await api.get('/cliente/buscar', { params: fullParams });
      } else if (params.tipo) {
        response = await api.get('/cliente/filtro', { params: fullParams });
      } else {
        response = await api.get('/cliente/datos-especificos', { params: fullParams });
      }
      if (response.data.exito) {
        setClientes(response.data.datos.clientes);
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
    fetchClientes();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    if (searchTerm.trim()) {
      fetchClientes({ q: searchTerm });
    } else {
      fetchClientes();
    }
  };

  const handleFiltroChange = (e) => {
    const tipo = e.target.value;
    setFiltro(tipo);
    setPage(1);
    if (tipo) {
      fetchClientes({ tipo });
    } else {
      fetchClientes();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
    try {
      const response = await api.delete(`/cliente/${id}`);
      if (response.data.exito) {
        fetchClientes();
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
      id_cliente: '',
      nombre: '',
      apellido: '',
      correo: '',
      usuario: '',
      fecha_registro: new Date().toISOString().split('T')[0],
      fecha_nac: '',
      carnet_identidad: '',
      ci_complemento: '',
      contrasena: ''
    });
    setModalOpen(true);
  };

  const openEditModal = async (id) => {
    try {
      const response = await api.get(`/cliente/dato-individual/${id}`);
      if (response.data.exito) {
        const cliente = response.data.datos.cliente;
        setFormData({
          id_cliente: cliente.id_cliente || '',
          nombre: cliente.nombre || '',
          apellido: cliente.apellido || '',
          correo: cliente.correo || '',
          usuario: cliente.usuario || '',
          fecha_registro: cliente.fecha_registro ? new Date(cliente.fecha_registro).toISOString().split('T')[0] : '',
          fecha_nac: cliente.fecha_nac ? new Date(cliente.fecha_nac).toISOString().split('T')[0] : '',
          carnet_identidad: cliente.carnet_identidad || '',
          ci_complemento: cliente.ci_complemento || '',
          contrasena: '' // No editable
        });
        setCurrentCliente(cliente);
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
    setCurrentCliente(null);
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
          const requiredFields = ['id_cliente', 'nombre', 'apellido', 'correo', 'usuario', 'contrasena', 'fecha_registro'];
          if (editMode && ['id_cliente', 'usuario', 'contrasena', 'fecha_registro'].includes(key)) return false;
          if (requiredFields.includes(key)) return true;
          return value !== '' && value !== null && value !== undefined;
        })
      );

      // Validaciones frontend
      if (!editMode) {
        if (!/^\d{1,10}$/.test(filteredData.carnet_identidad || '')) {
          setError('El carnet de identidad debe ser numérico y no exceder los 10 caracteres');
          return;
        }
        if (filteredData.ci_complemento && !/^[A-Za-z0-9]{1,3}$/.test(filteredData.ci_complemento)) {
          setError('El complemento del carnet debe tener hasta 3 caracteres alfanuméricos');
          return;
        }
        if (filteredData.fecha_nac) {
          const fechaNac = new Date(filteredData.fecha_nac);
          if (isNaN(fechaNac.getTime()) || fechaNac > new Date()) {
            setError('La fecha de nacimiento no es válida o está en el futuro');
            return;
          }
        }
      }

      if (editMode) {
        response = await api.patch(`/cliente/${currentCliente.id_cliente}`, filteredData);
      } else {
        response = await api.post('/cliente/', filteredData);
      }
      if (response.data.exito) {
        closeModal();
        fetchClientes();
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
      <h2 className="text-xl font-semibold mb-4">Gestión de Clientes</h2>
      
      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, apellido, correo o carnet..."
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
          <option value="fecha">Por fecha</option>
          <option value="correo">Por correo</option>
        </select>

        <button
          onClick={openCreateModal}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Crear Cliente
        </button>
      </div>

      {loading ? (
        <p>Cargando clientes...</p>
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
                  <th className="px-4 py-2 text-left">Apellido</th>
                  <th className="px-4 py-2 text-left">Correo</th>
                  <th className="px-4 py-2 text-left">Carnet Identidad</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente, index) => (
                  <tr key={cliente.id_cliente} className="border-t">
                    <td className="px-4 py-2">{(page - 1) * limit + index + 1}</td>
                    <td className="px-4 py-2">{cliente.nombre}</td>
                    <td className="px-4 py-2">{cliente.apellido}</td>
                    <td className="px-4 py-2">{cliente.correo}</td>
                    <td className="px-4 py-2">{cliente.carnet_identidad || '-'}{cliente.ci_complemento || ''}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openEditModal(cliente.id_cliente)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cliente.id_cliente)}
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
              {editMode ? 'Editar Cliente' : 'Crear Cliente'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {!editMode && (
                <div>
                  <label className="block text-sm font-medium mb-1">ID Cliente</label>
                  <input
                    name="id_cliente"
                    value={formData.id_cliente}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    type="number"
                    required
                  />
                </div>
              )}
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
                <label className="block text-sm font-medium mb-1">Apellido</label>
                <input
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Correo</label>
                <input
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  type="email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Usuario</label>
                <input
                  name="usuario"
                  value={formData.usuario}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required={!editMode}
                  disabled={editMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Registro</label>
                <input
                  name="fecha_registro"
                  value={formData.fecha_registro}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  type="date"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Nacimiento</label>
                <input
                  name="fecha_nac"
                  value={formData.fecha_nac}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  type="date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Carnet de Identidad</label>
                <input
                  name="carnet_identidad"
                  value={formData.carnet_identidad}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  maxLength="10"
                  pattern="\d{1,10}"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Complemento CI</label>
                <input
                  name="ci_complemento"
                  value={formData.ci_complemento}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  maxLength="3"
                  pattern="[A-Za-z0-9]{0,3}"
                />
              </div>
              {!editMode && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Contraseña</label>
                  <input
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    type="password"
                    required
                  />
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

export default Cliente;