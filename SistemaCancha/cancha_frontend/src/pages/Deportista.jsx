import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Deportista = () => {
  const [deportistas, setDeportistas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtro, setFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDeportista, setCurrentDeportista] = useState(null);
  const [formData, setFormData] = useState({
    id_deportista: '',
    nombre: '',
    apellido: '',
    correo: '',
    usuario: '',
    disciplina_principal: '',
    contrasena: '' // Solo para creación
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Fetch disciplinas válidas al cargar el componente
  useEffect(() => {
    const fetchDisciplinas = async () => {
      try {
        const response = await api.get('/disciplina'); // Ajustar endpoint según tu API
        setDisciplinas(response.data.datos || []);
      } catch (err) {
        console.error('Error al obtener disciplinas:', err);
      }
    };
    fetchDisciplinas();
  }, []);

  const fetchDeportistas = async (params = {}) => {
    setLoading(true);
    setError(null);
    const offset = (page - 1) * limit;
    const fullParams = { ...params, limit, offset };
    try {
      let response;
      if (params.q) {
        response = await api.get('/deportista/buscar', { params: fullParams });
      } else if (params.tipo) {
        response = await api.get('/deportista/filtro', { params: fullParams });
      } else {
        response = await api.get('/deportista/datos-especificos', { params: fullParams });
      }
      if (response.data.exito) {
        setDeportistas(response.data.datos.deportistas);
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
    fetchDeportistas();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    if (searchTerm.trim()) {
      fetchDeportistas({ q: searchTerm });
    } else {
      fetchDeportistas();
    }
  };

  const handleFiltroChange = (e) => {
    const tipo = e.target.value;
    setFiltro(tipo);
    setPage(1);
    if (tipo) {
      fetchDeportistas({ tipo });
    } else {
      fetchDeportistas();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este deportista?')) return;
    try {
      const response = await api.delete(`/deportista/${id}`);
      if (response.data.exito) {
        fetchDeportistas();
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
      nombre: '',
      apellido: '',
      correo: '',
      usuario: '',
      disciplina_principal: '',
      contrasena: ''
    });
    setModalOpen(true);
  };

  const openEditModal = async (id) => {
    try {
      const response = await api.get(`/deportista/dato-individual/${id}`);
      if (response.data.exito) {
        const deportista = response.data.datos.deportista;
        setFormData({
          id_deportista: deportista.id_deportista || '',
          nombre: deportista.nombre || '',
          apellido: deportista.apellido || '',
          correo: deportista.correo || '',
          usuario: deportista.usuario || '',
          disciplina_principal: deportista.disciplina_principal || '',
          contrasena: '' // No editable
        });
        setCurrentDeportista(deportista);
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
    setCurrentDeportista(null);
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
          const requiredFields = ['id_deportista', 'nombre', 'apellido', 'correo', 'usuario', 'contrasena'];
          if (editMode && ['id_deportista', 'usuario', 'contrasena'].includes(key)) return false;
          if (requiredFields.includes(key)) return true;
          return value !== '' && value !== null && value !== undefined;
        })
      );

      // Validaciones frontend
      if (filteredData.disciplina_principal) {
        if (filteredData.disciplina_principal.length > 100) {
          setError('La disciplina principal no debe exceder los 100 caracteres');
          return;
        }
        if (!disciplinas.includes(filteredData.disciplina_principal)) {
          setError(`La disciplina principal no es válida. Disciplinas permitidas: ${disciplinas.join(', ')}`);
          return;
        }
      }

      if (editMode) {
        response = await api.patch(`/deportista/${currentDeportista.id_deportista}`, filteredData);
      } else {
        response = await api.post('/deportista/', filteredData);
      }
      if (response.data.exito) {
        closeModal();
        fetchDeportistas();
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
      <h2 className="text-xl font-semibold mb-4">Gestión de Deportistas</h2>
      
      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, apellido, correo o disciplina..."
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
          <option value="disciplina">Por disciplina</option>
          <option value="correo">Por correo</option>
        </select>

        <button
          onClick={openCreateModal}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Crear Deportista
        </button>
      </div>

      {loading ? (
        <p>Cargando deportistas...</p>
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
                  <th className="px-4 py-2 text-left">Disciplina Principal</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {deportistas.map((deportista, index) => (
                  <tr key={deportista.id_deportista} className="border-t">
                    <td className="px-4 py-2">{(page - 1) * limit + index + 1}</td>
                    <td className="px-4 py-2">{deportista.nombre}</td>
                    <td className="px-4 py-2">{deportista.apellido}</td>
                    <td className="px-4 py-2">{deportista.correo}</td>
                    <td className="px-4 py-2">{deportista.disciplina_principal || '-'}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openEditModal(deportista.id_deportista)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(deportista.id_deportista)}
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
              {editMode ? 'Editar Deportista' : 'Crear Deportista'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {!editMode && (
                <div>
                  <label className="block text-sm font-medium mb-1">ID Deportista</label>
                  <input
                    name="id_deportista"
                    value={formData.id_deportista}
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
                <label className="block text-sm font-medium mb-1">Disciplina Principal</label>
                <select
                  name="disciplina_principal"
                  value={formData.disciplina_principal}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Seleccione una disciplina</option>
                  {disciplinas.map(disciplina => (
                    <option key={disciplina} value={disciplina}>{disciplina}</option>
                  ))}
                </select>
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

export default Deportista;