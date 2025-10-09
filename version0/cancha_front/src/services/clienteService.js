import axios from "axios";

const API_URL = "http://localhost:3000/api/clientes"; // ajusta según tu backend

// Token desde localStorage o tu manejador de autenticación
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// 🟢 Listar todos los clientes (solo ADMIN)
export const listarClientes = async () => {
  const res = await axios.get(`${API_URL}/datos-total`, getAuthHeader());
  return res.data;
};

// 🔵 Obtener cliente por ID
export const obtenerClientePorId = async (id) => {
  const res = await axios.get(`${API_URL}/id/${id}`, getAuthHeader());
  return res.data;
};

// 🔵 Obtener cliente por correo
export const obtenerClientePorCorreo = async (correo) => {
  const res = await axios.get(`${API_URL}/correo/${correo}`, getAuthHeader());
  return res.data;
};

// 🔍 Buscar clientes por nombre
export const buscarClientePorNombre = async (nombre) => {
  const res = await axios.get(`${API_URL}/buscar-nombre/${nombre}`, getAuthHeader());
  return res.data;
};

// 🧾 Obtener reservas del cliente
export const obtenerReservasPorCliente = async (id) => {
  const res = await axios.get(`${API_URL}/${id}/reservas`, getAuthHeader());
  return res.data;
};

// 💬 Obtener comentarios del cliente
export const obtenerComentariosPorCliente = async (id) => {
  const res = await axios.get(`${API_URL}/${id}/comentarios`, getAuthHeader());
  return res.data;
};

// ✳️ Crear cliente (solo ADMIN, con imagen opcional)
export const crearCliente = async (formData) => {
  const res = await axios.post(`${API_URL}`, formData, {
    ...getAuthHeader(),
    headers: {
      ...getAuthHeader().headers,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// 🟠 Actualizar cliente
export const actualizarCliente = async (id, formData) => {
  const res = await axios.patch(`${API_URL}/${id}`, formData, {
    ...getAuthHeader(),
    headers: {
      ...getAuthHeader().headers,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// 🔴 Eliminar cliente
export const eliminarCliente = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return res.data;
};

export const buscarClientePorCorreo = async (correo) => {
  const res = await axios.get(`${API_URL}/correo/${correo}`, getAuthHeader());
  return res.data;
};

export const buscarClientePorTelefono = async (telefono) => {
  const res = await axios.get(`${API_URL}/buscar-telefono/${telefono}`, getAuthHeader());
  return res.data;
};


export default {
  listarClientes,
  obtenerClientePorId,
  obtenerClientePorCorreo,
  buscarClientePorNombre,
  obtenerReservasPorCliente,
  obtenerComentariosPorCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
};
