import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { obtenerEspacioPorId, listarCanchasDisponibles, eliminarEspacio } from '../services/espacioService';
import CanchaForm from "../components/CanchaForm";
import { crearCancha } from "../services/canchaService";
import SideBar from '../components/Sidebar';
import { ChevronRight } from 'lucide-react';
import Modal from "../components/Modal";
import EspacioForm from "../components/EspacioForm";
import { actualizarEspacio } from "../services/espacioService";


const API_BASE = "http://localhost:3000"; // ajusta según tu backend

function EspacioDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [espacio, setEspacio] = useState(null);
  const [canchas, setCanchas] = useState([]);
  const token = localStorage.getItem('token');
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const [openModal, setOpenModal] = useState(null);
  const [error, setError] = useState("");

  const fetchEspacio = async () => {
  try {
    const response = await obtenerEspacioPorId(id, token);
    setEspacio(response.data);
    const canchasResponse = await listarCanchasDisponibles(id, token);
    setCanchas(canchasResponse.data);
  } catch (err) {
    setError(err.message);
  }
};

useEffect(() => {
  fetchEspacio();
}, [id, token]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este espacio deportivo?')) {
      try {
        await eliminarEspacio(id, token);
        alert('Espacio eliminado exitosamente');
        navigate('/espacios');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await actualizarEspacio(espacio.id_espacio, formData, token);
      alert("Espacio actualizado exitosamente ✅");
      setOpenModal(false);
      window.location.reload(); // 🔄 refresca los datos (puedes cambiarlo por re-fetch con useEffect)
    } catch (err) {
      setError(err.message);
    }
  };

  if (!espacio) return <div>Cargando...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 font-poppins">
      {/* Sidebar fijo */}
      <SideBar />
      <div className="flex-1 ml-64 p-6">
        {error && <p className="text-red-500">{error}</p>}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Título */}
          <h1 className="text-2xl font-bold text-azul-950 mb-4">
            {espacio.nombre}
          </h1>

          {/* 🔹 Info principal: dirección, descripción, propietario, horario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dirección */}
            <div>
              <h3 className="font-semibold text-verde-600 mb-2">📍 Dirección:</h3>
              <p className="text-gray-700">{espacio.direccion || "No especificada"}</p>
              {espacio.latitud && espacio.longitud && (
                <iframe
                  src={`https://www.google.com/maps?q=${espacio.latitud},${espacio.longitud}&hl=es&z=15&output=embed`}
                  className="w-full h-48 mt-3 rounded-lg border"
                ></iframe>
              )}
            </div>

            {/* Descripción, admin y horario */}
            <div>
              <h3 className="font-semibold text-verde-600 mb-2">📖 Descripción:</h3>
              <p className="text-gray-700 mb-4">{espacio.descripcion || "No especificada"}</p>

              <h3 className="font-semibold text-verde-600 mb-2">👤 Propietario / Administrador:</h3>
              <p className="text-gray-700 mb-4">{espacio.admin_nombre_completo || "No asignado"}</p>

              <h3 className="font-semibold text-verde-600 mb-2">⏰ Horario:</h3>
              <p className="text-gray-700">
                {espacio.horario_apertura} - {espacio.horario_cierre}
              </p>
            </div>
          </div>

          {/* 🔹 Canchas Disponibles debajo */}
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-azul-950">Canchas Disponibles</h2>

              {/* Botón añadir cancha (solo admins/encargados) */}
              {(roles.includes("ADMINISTRADOR") || roles.includes("ADMIN_ESP_DEP")) && (
                <button
                  onClick={() => setOpenModal("crearCancha")}
                  className="bg-verde-600 hover:bg-azul-900 text-white px-4 py-2 rounded-lg shadow"
                >
                  ➕ Añadir Cancha
                </button>
              )}
            </div>

            <div className="space-y-4">
              {canchas.map((cancha) => (
                <Link
                  key={cancha.id_cancha}
                  to={`/cancha/${cancha.id_cancha}`}
                  className="flex items-center justify-between bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="w-2 bg-verde-600 rounded-l-lg"></div>
                  <div className="flex-1 px-4 py-3">
                    <p className="font-semibold text-azul-950">{cancha.nombre}</p>
                    <p className="text-sm text-gray-600">
                      Disciplinas:{" "}
                      {cancha.disciplinas?.length > 0
                        ? cancha.disciplinas.join(", ")
                        : "Ninguna"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Capacidad: {cancha.capacidad}
                    </p>
                  </div>
                  <div className="px-4 text-verde-600">
                    <ChevronRight />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {(roles.includes("ADMINISTRADOR") || roles.includes("ADMIN_ESP_DEP")) && (
            <div className="flex gap-4 mt-6">
              {/* Botón editar */}
              <button
                onClick={() => setOpenModal(true)}
                className="bg-verde-600 hover:bg-azul-900 text-white px-5 py-2 rounded-lg shadow transition duration-200"
              >
                Editar Espacio
              </button>

              {/* Modal: Editar Espacio */}
<Modal
  open={openModal === "editarEspacio"}
  onClose={() => setOpenModal(null)}
  title="Editar Espacio"
>
  <EspacioForm
    initialData={espacio}
    onSubmit={handleUpdate}
    token={token}
  />
</Modal>

{/* Modal: Crear Cancha */}
<Modal
  open={openModal === "crearCancha"}
  onClose={() => setOpenModal(null)}
  title="Añadir Cancha"
>
  <CanchaForm
  initialData={{ id_espacio: espacio.id_espacio }}
  token={token}
  onSubmit={async (formData) => {
    try {
      await crearCancha(formData, token);
      alert("Cancha creada exitosamente ✅");
      setOpenModal(null);
      fetchEspacio(); // 👈 vuelve a traer la data
    } catch (err) {
      setError(err.message);
    }
  }}
/>
</Modal>


              {/* Botón eliminar */}
              <button
                onClick={handleDelete}
                className="bg-rojo-600 hover:bg-rojo-700 text-white px-5 py-2 rounded-lg shadow transition duration-200"
              >
                Eliminar Espacio
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default EspacioDetail;