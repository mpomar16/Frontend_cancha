import axios from "axios";

const API_URL = "http://localhost:3000/reserva";

export async function listarReservas(limit = 10, offset = 0) {
  try {
    const res = await axios.get(`${API_URL}/datos-total`, {
      params: { limit, offset },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    // Devuelve los datos de la respuesta, asegurándose de que las reservas sean un arreglo
    const payload = res.data?.data ?? {};
    return {
      reservas: Array.isArray(payload.reservas) ? payload.reservas : [],  // Asegura que 'reservas' sea un arreglo
      hasMore: Boolean(payload.hasMore),
      limit: payload.limit ?? limit,
      offset: payload.offset ?? offset,
    };
  } catch (err) {
    // Maneja los errores de la misma manera que en listarEspacios
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Error de conexión con el servidor");
  }
}
