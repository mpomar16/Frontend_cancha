/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { listarEspacios, listarEspaciosGeneral, crearEspacio } from '../services/espacioService';
import EspacioCard from '../components/EspacioCard';
import EspacioSearchBar from '../components/EspacioSearchBar';
import EspacioForm from '../components/EspacioForm';
import SideBar from '../components/Sidebar';
import EspacioCreate from './EspacioCreate';
import Modal from '../components/Modal';

function EspaciosList() {
  const [espacios, setEspacios] = useState([]);
  const [limit, setLimit] = useState(12);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const [isSearch, setIsSearch] = useState(false);
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    async function fetchEspacios() {
      try {
        const response = isLoggedIn
          ? await listarEspacios(limit, offset)
          : await listarEspaciosGeneral(limit, offset);
        setEspacios(response.data.espacios);
        setHasMore(response.data.hasMore);
        setIsSearch(false);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchEspacios();
  }, [limit, offset, isLoggedIn]);

  const handleSearchResults = (results) => {
    if (results.espacios) {
      // Cuando viene de listarEspacios o listarEspaciosGeneral
      setEspacios(results.espacios);
      setHasMore(results.hasMore);
      setIsSearch(false);
    } else {
      // Cuando viene de búsqueda por nombre o disciplina
      setEspacios(results);
      setHasMore(false);
      setIsSearch(true);
    }
    setError(""); // limpia error en cada búsqueda
  };
  // 🔹 Crear espacio
  const handleCreate = async (formData) => {
    try {
      await crearEspacio(formData, token);
      alert("Espacio creado exitosamente ✅");
      setOpenModal(false);
      window.location.reload();
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div className="flex min-h-screen bg-gray-50 font-poppins">
      {/* Sidebar a la izquierda */}
      <SideBar />

      {/* Contenido principal */}
      <div className="flex-1 p-6 ml-64">
        <div>
          <EspacioSearchBar onSearchResults={handleSearchResults} />
          <div className="pt-1 flex justify-begin items-center">
            {isLoggedIn && (
            <button
              onClick={() => setOpenModal(true)}
              className="ml-4 flex items-center gap-2 bg-verde-600 hover:bg-verde-700 text-white px-4 py-2 rounded-lg shadow transition"
            >
              <span className="text-lg font-bold">+</span> Crear
            </button>
          )}
          </div>
          {error && <p className="text-red-500 mt-4">{error}</p>}

          {/* Cards de espacios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {espacios.map((espacio) => (
              <EspacioCard key={espacio.id_espacio} espacio={espacio} />
            ))}
          </div>

          {/* Botones de paginación */}
          {!isSearch && (
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setOffset((prev) => Math.max(prev - limit, 0))}
                disabled={offset === 0}
                className="bg-verde-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-verde-700 disabled:bg-gray-400"
              >
                Anterior
              </button>
              <button
                onClick={() => setOffset((prev) => prev + limit)}
                disabled={!hasMore}
                className="bg-verde-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-verde-700 disabled:bg-gray-400"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
        {/* Modal para crear espacio */}
        <Modal open={openModal} onClose={() => setOpenModal(false)} title="Crear Espacio">
          <EspacioForm onSubmit={handleCreate} token={token} />
        </Modal>
      </div>
    </div>

  );
}

export default EspaciosList;