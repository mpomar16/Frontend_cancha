import axios from "axios";

const API_URL = "http://localhost:3000/persona/buscar-nombre";

export async function buscarPersonasPorNombre(nombre) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token, debe iniciar sesión");

  try {
    const res = await axios.get(`${API_URL}/${encodeURIComponent(nombre)}`, {
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
