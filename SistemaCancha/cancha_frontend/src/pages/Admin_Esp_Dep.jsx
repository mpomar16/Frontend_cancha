import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminEspDep = () => {
  const [administradores, setAdministradores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtro, setFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [formData, setFormData] = useState({
    id_admin_esp_dep: '',
    nombre: '',
    apellido: '',
    correo: '',
    usuario: '',
    fecha_ingreso: '',
    direccion: '',
    estado: true,
    contrasena: '' // Solo para creación
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchAdministradores = async (params = {}) => {
    setLoading(true);
    setError(null);
    const offset = (page - 1) * limit;
    const fullParams = { ...params, limit, offset };
    try {
      let response;
      if (params.q) {
        response = await api.get('/admin_esp_dep/buscar', { params: fullParams });
      } else if (params.tipo) {
        response = await api.get('/admin_esp_dep/filtro', { params: fullParams });
      } else {
        response = await api.get('/admin_esp_dep/datos-especificos', { params: fullParams });
      }
      if (response.data.exito) {
        setAdministradores(response.data.datos.administradores);
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
    fetchAdministradores();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    if (searchTerm.trim()) {
      fetchAdministradores({ q: searchTerm });
    } else {
      fetchAdministradores();
    }
  };

  const handleFiltroChange = (e) => {
    const tipo = e.target.value;
    setFiltro(tipo);
    setPage(1);
    if (tipo) {
      fetchAdministradores({ tipo });
    } else {
      fetchAdministradores();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este administrador especial?')) return;
    try {
      const response = await api.delete(`/admin_esp_dep/${id}`);
      if (response.data.exito) {
        fetchAdministradores();
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
      id_admin_esp_dep: '',
      nombre: '',
      apellido: '',
      correo: '',
      usuario: '',
      fecha_ingreso: new Date().toISOString().split('T')[0],
      direccion: '',
      estado: true,
      contrasena: ''
    });
    setModalOpen(true);
  };

  const openEditModal = async (id) => {
    try {
      const response = await api.get(`/admin_esp_dep/dato-individual/${id}`);
      if (response.data.exito) {
        const admin = response.data.datos.administrador;
        setFormData({
          id_admin_esp_dep: admin.id_admin_esp_dep || '',
          nombre: admin.nombre || '',
          apellido: admin.apellido || '',
          correo: admin.correo || '',
          usuario: admin.usuario || '',
          fecha_ingreso: admin.fecha_ingreso ? new Date(admin.fecha_ingreso).toISOString().split('T')[0] : '',
          direccion: admin.direccion || '',
          estado: admin.estado !== undefined ? admin.estado : true,
          contrasena: '' // No editable
        });
        setCurrentAdmin(admin);
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
    setCurrentAdmin(null);
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
          const requiredFields = ['id_admin_esp_dep', 'nombre', 'apellido', 'correo', 'usuario', 'contrasena', 'fecha_ingreso'];
          if (editMode && ['id_admin_esp_dep', 'usuario', 'contrasena'].includes(key)) return false;
          if (requiredFields.includes(key)) return true;
          return value !== '' && value !== null && value !== undefined;
        })
      );

      // Validaciones frontend
      if (filteredData.direccion && filteredData.direccion.length > 255) {
        setError('La dirección no debe exceder los 255 caracteres');
        return;
      }
      if (filteredData.fecha_ingreso) {
        const fechaIngreso = new Date(filteredData.fecha_ingreso);
        if (isNaN(fechaIngreso.getTime()) || fechaIngreso > new Date()) {
          setError('La fecha de ingreso no es válida o está en el futuro');
          return;
        }
      }

      if (editMode) {
        response = await api.patch(`/admin_esp_dep/${currentAdmin.id_admin_esp_dep}`, filteredData);
      } else {
        response = await api.post('/admin_esp_dep/', filteredData);
      }
      if (response.data.exito) {
        closeModal();
        fetchAdministradores();
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
      <h2 className="text-xl font-semibold mb-4">Gestión de Administradores Especiales</h2>
      
      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, apellido, correo o dirección..."
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
          Crear Administrador Especial
        </button>
      </div>

      {loading ? (
        <p>Cargando administradores...</p>
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
                  <th className="px-4 py-2 text-left">Dirección</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {administradores.map((admin, index) => (
                  <tr key={admin.id_admin_esp_dep} className="border-t">
                    <td className="px-4 py-2">{(page - 1) * limit + index + 1}</td>
                    <td className="px-4 py-2">{admin.nombre}</td>
                    <td className="px-4 py-2">{admin.apellido}</td>
                    <td className="px-4 py-2">{admin.correo}</td>
                    <td className="px-4 py-2">{admin.direccion || '-'}</td>
                    <td className="px-4 py-2">{admin.estado ? 'Activo' : 'Inactivo'}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openEditModal(admin.id_admin_esp_dep)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id_admin_esp_dep)}
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
              {editMode ? 'Editar Administrador Especial' : 'Crear Administrador Especial'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {!editMode && (
                <div>
                  <label className="block text-sm font-medium mb-1">ID Administrador Especial</label>
                  <input
                    name="id_admin_esp_dep"
                    value={formData.id_admin_esp_dep}
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
                <label className="block text-sm font-medium mb-1">Fecha de Ingreso</label>
                <input
                  name="fecha_ingreso"
                  value={formData.fecha_ingreso}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  type="date"
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
                  maxLength="255"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <input
                  name="estado"
                  type="checkbox"
                  checked={formData.estado}
                  onChange={handleInputChange}
                  className="w-5 h-5"
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

export default AdminEspDep;