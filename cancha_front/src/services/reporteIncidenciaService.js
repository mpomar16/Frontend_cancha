/**
 * Servicio de Reportes de Incidencia
 * CRUD + listados relacionados (por encargado / por reserva)
 */
import axios from "axios";

const API_URL = "http://localhost:3000/reporte_incidencia";

// ----------------------
// Helpers
// ----------------------
function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function normalizePagedResponse(res, fallbackLimit, fallbackOffset) {
  // Puede venir como:
  // 1) { success, message, data: { reportes, hasMore, limit, offset } }
  // 2) { success, message, data: [...] }  (legacy)
  // 3) directamente [...], si alguna vez cambió (extra fallback)
  const payload = res?.data?.data ?? res?.data ?? {};
  const reportes = Array.isArray(payload) ? payload : (payload.reportes ?? []);
  const hasMore = Array.isArray(payload) ? false : Boolean(payload.hasMore);
  return {
    reportes,
    hasMore,
    limit: payload.limit ?? fallbackLimit,
    offset: payload.offset ?? fallbackOffset,
  };
}

function errorMessage(err, fallback) {
  return err?.response?.data?.message || fallback;
}

// ----------------------
// Listados
// ----------------------

/**
 * Listar reportes con paginado
 * GET /datos-total?limit&offset
 */
export async function listarReportes(limit = 12, offset = 0, token) {
  try {
    const res = await axios.get(`${API_URL}/datos-total`, {
      params: { limit, offset },
      headers: authHeader(token),
    });
    return normalizePagedResponse(res, limit, offset);
  } catch (err) {
    throw new Error(errorMessage(err, "Error al listar reportes"));
  }
}

/**
 * Listar reportes por encargado (paginado si backend lo soporta)
 * GET /encargado/:id_encargado?limit&offset
 */
export async function listarReportesPorEncargadoId(
  id_encargado,
  token,
  limit = 12,
  offset = 0
) {
  try {
    const res = await axios.get(`${API_URL}/encargado/${id_encargado}`, {
      params: { limit, offset },
      headers: authHeader(token),
    });
    return normalizePagedResponse(res, limit, offset);
  } catch (err) {
    throw new Error(errorMessage(err, "Error al listar reportes por encargado"));
  }
}

/**
 * Listar reportes por reserva (paginado si backend lo soporta)
 * GET /reserva/:id_reserva?limit&offset
 */
export async function listarReportesPorReservaId(
  id_reserva,
  token,
  limit = 12,
  offset = 0
) {
  try {
    const res = await axios.get(`${API_URL}/reserva/${id_reserva}`, {
      params: { limit, offset },
      headers: authHeader(token),
    });
    return normalizePagedResponse(res, limit, offset);
  } catch (err) {
    throw new Error(errorMessage(err, "Error al listar reportes por reserva"));
  }
}

// ----------------------
// CRUD
// ----------------------

/**
 * Obtener reporte por ID
 * GET /id/:id
 */
export async function obtenerReportePorId(id, token) {
  try {
    const res = await axios.get(`${API_URL}/id/${id}`, {
      headers: authHeader(token),
    });
    return res.data; // { success, message, data }
  } catch (err) {
    throw new Error(errorMessage(err, "Error al obtener reporte"));
  }
}

/**
 * Crear reporte
 * POST /
 * body: { detalle, sugerencia, id_encargado, id_reserva }
 */
export async function crearReporte(data, token) {
  try {
    const res = await axios.post(`${API_URL}/`, data, {
      headers: authHeader(token),
    });
    return res.data; // { success, message, data }
  } catch (err) {
    throw new Error(errorMessage(err, "Error al crear reporte"));
  }
}

/**
 * Actualizar reporte
 * PATCH /:id
 */
export async function actualizarReporte(id, data, token) {
  try {
    const res = await axios.patch(`${API_URL}/${id}`, data, {
      headers: authHeader(token),
    });
    return res.data; // { success, message, data }
  } catch (err) {
    throw new Error(errorMessage(err, "Error al actualizar reporte"));
  }
}

/**
 * Eliminar reporte
 * DELETE /:id
 */
export async function eliminarReporte(id, token) {
  try {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(token),
    });
    return res.data; // { success, message }
  } catch (err) {
    throw new Error(errorMessage(err, "Error al eliminar reporte"));
  }
}

// ----------------------
// Relacionados (detalle)
// ----------------------

/**
 * Obtener el encargado asociado a un reporte
 * GET /:id/encargado
 */
export async function obtenerEncargadoDeReporte(id_reporte, token) {
  try {
    const res = await axios.get(`${API_URL}/${id_reporte}/encargado`, {
      headers: authHeader(token),
    });
    return res.data;
  } catch (err) {
    throw new Error(errorMessage(err, "Error al obtener encargado del reporte"));
  }
}

/**
 * Obtener la reserva asociada a un reporte
 * GET /:id/reserva
 */
export async function obtenerReservaDeReporte(id_reporte, token) {
  try {
    const res = await axios.get(`${API_URL}/${id_reporte}/reserva`, {
      headers: authHeader(token),
    });
    return res.data;
  } catch (err) {
    throw new Error(errorMessage(err, "Error al obtener reserva del reporte"));
  }
}
