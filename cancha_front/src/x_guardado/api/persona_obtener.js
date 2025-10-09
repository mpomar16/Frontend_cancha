import axios from "axios";

const API_URL = "http://localhost:3000/persona/id";

export async function obtenerPersona(id) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token, debe iniciar sesión");

  try {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Error de conexión con el servidor");
  }
}