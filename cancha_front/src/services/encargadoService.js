/**
 * Servicio de Encargados
 * Maneja las operaciones CRUD y de búsqueda relacionadas con los encargados.
 */
import axios from "axios";

const API_URL = "http://localhost:3000/encargado";

/**
 * Listar todos los encargados
 * Parámetros:
 * - token: autenticación (Bearer)
 * Respuesta:
 * - success: boolean
 * - message: string
 * - data: array de encargados con atributos de persona
 */
export async function listarEncargados(limit = 12, offset = 0, token) {
  try {
    const res = await axios.get(`${API_URL}/datos-total`, {
      params: { limit, offset },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const payload = res?.data?.data ?? res?.data ?? {};
    return {
      encargados: payload.encargados ?? [],
      hasMore: Boolean(payload.hasMore),
      limit: payload.limit ?? limit,
      offset: payload.offset ?? offset,
    };
  } catch (err) {
    const msg = err?.response?.data?.message || "Error de conexión con el servidor";
    throw new Error(msg);
  }
}

/**
 * Obtener encargado por ID
 * Parámetros:
 * - id: número entero (id_encargado)
 * - token: autenticación
 * Respuesta:
 * - success: boolean
 * - message: string
 * - data: objeto con datos del encargado y su persona vinculada
 */
export async function obtenerEncargadoPorId(id, token) {
  try {
    const res = await axios.get(`${API_URL}/id/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Error al obtener encargado");
  }
}

/**
 * Crear nuevo encargado
 * Parámetros:
 * - data: objeto { responsabilidad, fecha_inicio, hora_ingreso, hora_salida, estado, id_persona }
 * - token: autenticación
 * Respuesta:
 * - success: boolean
 * - message: string
 * - data: objeto con datos del nuevo encargado creado
 */
export async function crearEncargado(data, token) {
  try {
    const res = await axios.post(`${API_URL}/`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Error al crear encargado");
  }
}

/**
 * Actualizar encargado
 * Parámetros:
 * - id: número entero (id_encargado)
 * - data: objeto con campos a actualizar
 * - token: autenticación
 * Respuesta:
 * - success: boolean
 * - message: string
 */
export async function actualizarEncargado(id, data, token) {
  try {
    const res = await axios.patch(`${API_URL}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Error al actualizar encargado");
  }
}

/**
 * Eliminar encargado
 * Parámetros:
 * - id: número entero (id_encargado)
 * - token: autenticación
 * Respuesta:
 * - success: boolean
 * - message: string
 */
export async function eliminarEncargado(id, token) {
  try {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Error al eliminar encargado");
  }
}

/**
 * Obtener reportes de un encargado
 * Parámetros:
 * - id: número entero (id_encargado)
 * - token: autenticación
 * Respuesta:
 * - success: boolean
 * - message: string
 * - data: array de reportes relacionados al encargado
 */
export async function obtenerReportesPorEncargadoId(id, token) {
  try {
    const res = await axios.get(`${API_URL}/${id}/reportes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Error al obtener reportes del encargado");
  }
}

/**
 * Buscar encargados por nombre
 * Parámetros:
 * - nombre: string (nombre o apellido parcial)
 * - token: autenticación
 * Respuesta:
 * - success: boolean
 * - message: string
 * - data: array de encargados encontrados
 */
export async function buscarEncargadoPorNombre(nombre, token) {
  try {
    const res = await axios.get(`${API_URL}/buscar-nombre/${encodeURIComponent(nombre)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Error al buscar encargado por nombre");
  }
}

/**
 * Buscar encargados por responsabilidad
 * Parámetros:
 * - responsabilidad: string (texto parcial)
 * - token: autenticación
 * Respuesta:
 * - success: boolean
 * - message: string
 * - data: array de encargados encontrados
 */
export async function buscarEncargadoPorResponsabilidad(responsabilidad, token) {
  try {
    const res = await axios.get(
      `${API_URL}/buscar-responsabilidad/${encodeURIComponent(responsabilidad)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Error al buscar encargado por responsabilidad");
  }
}

/**
 * Buscar encargados por correo
 * Parámetros:
 * - correo: string (correo electrónico exacto o parcial)
 * - token: autenticación
 * Respuesta:
 * - success: boolean
 * - message: string
 * - data: array de encargados encontrados
 */
export async function buscarEncargadoPorCorreo(correo, token) {
  try {
    const res = await axios.get(`${API_URL}/buscar-correo/${encodeURIComponent(correo)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Error al buscar encargado por correo");
  }
}
