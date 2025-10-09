import React, { useState, useEffect } from 'react'
import api from '../services/api'

const Usuario = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtro, setFiltro] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    usuario: '',
    telefono: '',
    sexo: '',
    imagen_perfil: '',
    latitud: '',
    longitud: '',
    contrasena: '' // Solo para creación
  })
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  const sexosPermitidos = ['masculino', 'femenino'] // Ajustado para coincidir con el enum de la DB (eliminado 'no_binario')

  const fetchUsuarios = async (params = {}) => {
    setLoading(true)
    setError(null)
    const offset = (page - 1) * limit
    const fullParams = { ...params, limit, offset }
    try {
      let response
      if (params.q) {
        response = await api.get('/usuario/buscar', { params: fullParams })
      } else if (params.tipo) {
        response = await api.get('/usuario/filtro', { params: fullParams })
      } else {
        response = await api.get('/usuario/datos-especificos', { params: fullParams })
      }
      if (response.data.exito) {
        setUsuarios(response.data.datos.usuarios)
        setTotal(response.data.datos.paginacion.total)
      } else {
        setError(response.data.mensaje)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.mensaje || 'Error de conexión al servidor'
      setError(errorMessage)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [page])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1) // Resetear a página 1 en búsqueda
    if (searchTerm.trim()) {
      fetchUsuarios({ q: searchTerm })
    } else {
      fetchUsuarios()
    }
  }

  const handleFiltroChange = (e) => {
    const tipo = e.target.value
    setFiltro(tipo)
    setPage(1) // Resetear a página 1 en filtro
    if (tipo) {
      fetchUsuarios({ tipo })
    } else {
      fetchUsuarios()
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return
    try {
      const response = await api.delete(`/usuario/${id}`)
      if (response.data.exito) {
        fetchUsuarios()
      } else {
        alert(response.data.mensaje)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.mensaje || 'Error de conexión al servidor'
      setError(errorMessage)
      console.error(err)
    }
  }

  const openCreateModal = () => {
    setEditMode(false)
    setFormData({
      nombre: '',
      apellido: '',
      correo: '',
      usuario: '',
      telefono: '',
      sexo: '',
      imagen_perfil: '',
      latitud: '',
      longitud: '',
      contrasena: ''
    })
    setModalOpen(true)
  }

  const openEditModal = async (id) => {
    try {
      const response = await api.get(`/usuario/dato-individual/${id}`)
      if (response.data.exito) {
        const user = response.data.datos.usuario
        setFormData({
          nombre: user.nombre || '',
          apellido: user.apellido || '',
          correo: user.correo || '',
          usuario: user.usuario || '',
          telefono: user.telefono || '',
          sexo: user.sexo || '',
          imagen_perfil: user.imagen_perfil || '',
          latitud: user.latitud || '',
          longitud: user.longitud || '',
          contrasena: '' // No editable
        })
        setCurrentUser(user)
        setEditMode(true)
        setModalOpen(true)
      } else {
        alert(response.data.mensaje)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.mensaje || 'Error de conexión al servidor'
      setError(errorMessage)
      console.error(err)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setCurrentUser(null)
    setError(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      // Filtrar campos vacíos o undefined, excepto los obligatorios
      const filteredData = Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => {
          // Mantener campos obligatorios siempre
          const requiredFields = ['nombre', 'apellido', 'correo', 'usuario', 'contrasena'];
          if (editMode && ['usuario', 'contrasena'].includes(key)) return false; // Excluir en modo edición
          if (requiredFields.includes(key)) return true; // Incluir campos obligatorios
          return value !== '' && value !== null && value !== undefined; // Incluir solo valores no vacíos
        })
      );

      if (editMode) {
        response = await api.patch(`/usuario/${currentUser.id_persona}`, filteredData);
      } else {
        response = await api.post('/usuario/', filteredData);
      }
      if (response.data.exito) {
        closeModal();
        fetchUsuarios();
      } else {
        alert(response.data.mensaje);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.mensaje || 'Error de conexión al servidor'
      setError(errorMessage)
      console.error(err)
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(total / limit)) {
      setPage(newPage)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Gestión de Usuarios</h2>
      
      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, apellido, correo, usuario o teléfono..."
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
          Crear Usuario
        </button>
      </div>

      {loading ? (
        <p>Cargando usuarios...</p>
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
                  <th className="px-4 py-2 text-left">Usuario</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario, index) => (
                  <tr key={usuario.id_persona} className="border-t">
                    <td className="px-4 py-2">{(page - 1) * limit + index + 1}</td>
                    <td className="px-4 py-2">{usuario.nombre}</td>
                    <td className="px-4 py-2">{usuario.apellido}</td>
                    <td className="px-4 py-2">{usuario.correo}</td>
                    <td className="px-4 py-2">{usuario.usuario}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openEditModal(usuario.id_persona)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(usuario.id_persona)}
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

          {/* Paginación simple */}
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editMode ? 'Editar Usuario' : 'Crear Usuario'}
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
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sexo</label>
                <select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Seleccione</option>
                  {sexosPermitidos.map(sexo => (
                    <option key={sexo} value={sexo}>{sexo.charAt(0).toUpperCase() + sexo.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Imagen de Perfil (URL)</label>
                <input
                  name="imagen_perfil"
                  value={formData.imagen_perfil}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
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
  )
}

export default Usuario