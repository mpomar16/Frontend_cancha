// src/services/disciplinaService.js
import axios from "axios";

const API_URL = "http://localhost:3000/disciplina";

/* =========================================================
   DISCIPLINA SERVICE
   ========================================================= */

/**
 * Listar todas las disciplinas
 * Parámetros de entrada:
 * - token: token de autenticación en los headers
 * Respuesta:
 * - success: booleano indicando si la operación fue exitosa
 * - message: mensaje descriptivo del resultado
 * - data: array de objetos [{id_disciplina, nombre, descripcion}]
 */
export async function listarDisciplinas(token) {
  try {
    const res = await axios.get(`${API_URL}/datos-total`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    if (err.response?.data?.message) throw new Error(err.response.data.message);
    throw new Error("Error de conexión con el servidor");
  }
}

/**
 * Buscar disciplinas por nombre (coincidencia parcial)
 * Parámetros de entrada:
 * - nombre: cadena de texto con el nombre o parte del nombre a buscar
 * - token: token de autenticación en los headers
 * Respuesta:
 * - success: booleano indicando si la operación fue exitosa
 * - message: mensaje descriptivo del resultado
 * - data: array de objetos [{id_disciplina, nombre, descripcion}]
 */
export async function buscarDisciplinasPorNombre(nombre, token) {
  try {
    const res = await axios.get(`${API_URL}/buscar/${nombre}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    if (err.response?.data?.message) throw new Error(err.response.data.message);
    throw new Error("Error de conexión con el servidor");
  }
}

/**
 * Obtener una disciplina por ID
 * Parámetros de entrada:
 * - id: ID de la disciplina
 * - token: token de autenticación en los headers
 * Respuesta:
 * - success: booleano indicando si la operación fue exitosa
 * - message: mensaje descriptivo del resultado
 * - data: objeto con {id_disciplina, nombre, descripcion}
 */
export async function obtenerDisciplinaPorId(id, token) {
  try {
    const res = await axios.get(`${API_URL}/id/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    if (err.response?.data?.message) throw new Error(err.response.data.message);
    throw new Error("Error de conexión con el servidor");
  }
}

/**
 * Crear una nueva disciplina
 * Parámetros de entrada:
 * - disciplinaData: objeto con {nombre (requerido), descripcion (opcional)}
 * - token: token de autenticación en los headers
 * Respuesta:
 * - success: booleano indicando si la operación fue exitosa
 * - message: mensaje descriptivo del resultado
 * - data: objeto con {id_disciplina, nombre, descripcion}
 */
export async function crearDisciplina(disciplinaData, token) {
  try {
    const res = await axios.post(`${API_URL}`, disciplinaData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    if (err.response?.data?.message) throw new Error(err.response.data.message);
    throw new Error("Error de conexión con el servidor");
  }
}

/**
 * Actualizar una disciplina existente
 * Parámetros de entrada:
 * - id: ID de la disciplina
 * - disciplinaData: objeto con {nombre, descripcion} (todos opcionales)
 * - token: token de autenticación en los headers
 * Respuesta:
 * - success: booleano indicando si la operación fue exitosa
 * - message: mensaje descriptivo del resultado
 * - data: objeto con {id_disciplina, nombre, descripcion}
 */
export async function actualizarDisciplina(id, disciplinaData, token) {
  try {
    const res = await axios.patch(`${API_URL}/${id}`, disciplinaData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    if (err.response?.data?.message) throw new Error(err.response.data.message);
    throw new Error("Error de conexión con el servidor");
  }
}

/**
 * Eliminar una disciplina
 * Parámetros de entrada:
 * - id: ID de la disciplina
 * - token: token de autenticación en los headers
 * Respuesta:
 * - success: booleano indicando si la operación fue exitosa
 * - message: mensaje descriptivo del resultado
 */
export async function eliminarDisciplina(id, token) {
  try {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    if (err.response?.data?.message) throw new Error(err.response.data.message);
    throw new Error("Error de conexión con el servidor");
  }
}

/* =========================================================
   RELACIONES CON OTRAS ENTIDADES
   ========================================================= */

/**
 * Obtener canchas asociadas a una disciplina
 * Parámetros de entrada:
 * - id: ID de la disciplina
 * - token: token de autenticación en los headers
 * Respuesta:
 * - success: booleano indicando si la operación fue exitosa
 * - message: mensaje descriptivo del resultado
 * - data: array de objetos [{id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_principal, id_espacio}]
 */
export async function obtenerCanchasPorDisciplina(id, token) {
  try {
    const res = await axios.get(`${API_URL}/${id}/canchas`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    if (err.response?.data?.message) throw new Error(err.response.data.message);
    throw new Error("Error de conexión con el servidor");
  }
}

/**
 * Obtener reservas asociadas a una disciplina
 * Parámetros de entrada:
 * - id: ID de la disciplina
 * - token: token de autenticación en los headers
 * Respuesta:
 * - success: booleano indicando si la operación fue exitosa
 * - message: mensaje descriptivo del resultado
 * - data: array de objetos [{id_reserva, fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina}]
 */
export async function obtenerReservasPorDisciplina(id, token) {
  try {
    const res = await axios.get(`${API_URL}/${id}/reservas`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    if (err.response?.data?.message) throw new Error(err.response.data.message);
    throw new Error("Error de conexión con el servidor");
  }
}

/**
 * Obtener deportistas asociados a una disciplina
 * Parámetros de entrada:
 * - id: ID de la disciplina
 * - token: token de autenticación en los headers
 * Respuesta:
 * - success: booleano indicando si la operación fue exitosa
 * - message: mensaje descriptivo del resultado
 * - data: array de objetos [{id_deportista, nivel, disciplina_principal, id_persona}]
 */
export async function obtenerDeportistasPorDisciplina(id, token) {
  try {
    const res = await axios.get(`${API_URL}/${id}/deportistas`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    if (err.response?.data?.message) throw new Error(err.response.data.message);
    throw new Error("Error de conexión con el servidor");
  }
}
