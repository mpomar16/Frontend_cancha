/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  obtenerCanchaPorId,
  eliminarCancha,
  actualizarCancha,
  getDisciplinasPorCancha,
  listarDisciplinasPorCancha,
  calcularPromedioResenas,
} from "../services/canchaService";
import Modal from "../components/Modal";
import CanchaForm from "../components/CanchaForm"; // 👈 tu form de edición
import SideBar from '../components/Sidebar';
const API_BASE = "http://localhost:3000";

function CanchaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cancha, setCancha] = useState(null);
  const [promedio, setPromedio] = useState(null);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false); // 👈 controla el modal
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchCancha() {
      try {
        const response = await obtenerCanchaPorId(id, token);
        setCancha(response.data);
        const promedioResponse = await calcularPromedioResenas(id, token);
        setPromedio(promedioResponse.data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchCancha();
  }, [id, token]);

  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de eliminar esta cancha?")) {
      try {
        await eliminarCancha(id, token);
        alert("Cancha eliminada exitosamente");
        navigate("/");
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // 🔹 Lógica de update
  const handleUpdate = async (formData) => {
    try {
      await actualizarCancha(id, formData, token);
      alert("Cancha actualizada exitosamente ✅");
      setOpenModal(false);
      window.location.reload(); // 🔄 refresca (luego podemos hacer refetch sin reload)
    } catch (err) {
      setError(err.message);
    }
  };

  if (!cancha) return <div>Cargando...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 font-poppins">
      {/* Sidebar fijo */}
      <SideBar />
      <div className="flex-1 ml-64 p-6">
        {error && <p className="text-red-500">{error}</p>}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {cancha.imagen_cancha && (
            <img
              src={`${API_BASE}${cancha.imagen_cancha}`}
              alt={cancha.nombre}
              className="w-64 h-40 rounded-lg border mb-4 object-cover"
              onError={(e) => (e.target.src = "/default-avatar.png")}
            />
          )}

          <p>
            <strong>Capacidad:</strong> {cancha.capacidad}
          </p>
          <p>
            <strong>Estado:</strong> {cancha.estado}
          </p>
          <p>
            <strong>Monto por hora:</strong> {cancha.monto_por_hora}
          </p>
          <p>
            <strong>Promedio reseñas:</strong>{" "}
            {promedio?.promedio_estrellas || "Sin reseñas"} (
            {promedio?.total_comentarios || 0} comentarios)
          </p>

          {/* Botones */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setOpenModal(true)}
              className="bg-verde-600 hover:bg-azul-900 text-white px-5 py-2 rounded-lg shadow transition duration-200"
            >
              Editar Cancha
            </button>
            <button
              onClick={handleDelete}
              className="bg-rojo-600 hover:bg-rojo-700 text-white px-5 py-2 rounded-lg shadow transition duration-200"
            >
              Eliminar Cancha
            </button>
          </div>

          {/* Modal con formulario */}
          <Modal
            open={openModal}
            onClose={() => setOpenModal(false)}
            title="Editar Cancha"
          >
            <CanchaForm
              initialData={cancha}
              onSubmit={handleUpdate}
              token={token}
            />
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default CanchaDetail;
