import axios from "axios";

const API_URL = "http://localhost:3000/persona";

export async function listarPersonas(limit = 12, offset = 0) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token, debe iniciar sesión");

  try {
    const res = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params: {limit, offset }, // para el limite
   });
    return res.data;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Error de conexión con el servidor");
  }
}