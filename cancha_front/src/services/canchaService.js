import axios from "axios";

const API_URL = "http://localhost:3000/cancha";

// Listar todas las canchas
// Parámetros de entrada:
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: array de objetos [{id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio}]
export async function listarCanchas(token) {
  try {
    const res = await axios.get(`${API_URL}/datos-total`, {
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

// Obtener cancha por ID
// Parámetros de entrada:
// - id: ID de la cancha
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: objeto con {id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio}
export async function obtenerCanchaPorId(id, token) {
  try {
    const res = await axios.get(`${API_URL}/id/${id}`, {
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

// Crear una nueva cancha
// Parámetros de entrada:
// - canchaData: objeto FormData con {nombre (requerido), capacidad (requerido), estado, ubicacion, monto_por_hora, id_espacio (requerido), imagen_cancha (archivo)}
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: objeto con {id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio}
export async function crearCancha(canchaData, token) {
  try {
    const res = await axios.post(`${API_URL}/`, canchaData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Error de conexión con el servidor");
  }
}

// Actualizar una cancha
// Parámetros de entrada:
// - id: ID de la cancha
// - canchaData: objeto FormData con {nombre, capacidad, estado, ubicacion, monto_por_hora, id_espacio, imagen_cancha (archivo)} (todos opcionales)
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: objeto con {id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio}
export async function actualizarCancha(id, canchaData, token) {
  try {
    const res = await axios.patch(`${API_URL}/${id}`, canchaData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Error de conexión con el servidor");
  }
}

// Eliminar una cancha
// Parámetros de entrada:
// - id: ID de la cancha
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
export async function eliminarCancha(id, token) {
  try {
    const res = await axios.delete(`${API_URL}/${id}`, {
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

// Listar valores posibles del enum estado_cancha
// Parámetros de entrada:
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: array de strings con los valores posibles del enum estado_cancha
export async function listarEstadoCanchaEnum(token) {
  try {
    const res = await axios.get(`${API_URL}/estado-cancha-enum`, {
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

// Listar disciplinas únicas
// Parámetros de entrada: ninguno
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: array de strings con nombres de disciplinas
export async function listarDisciplinasUnicas() {
  try {
    const res = await axios.get(`${API_URL}/filtro-deportes`);
    return res.data;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Error de conexión con el servidor");
  }
}

// Asignar disciplinas a una cancha
// Parámetros de entrada:
// - id: ID de la cancha
// - disciplinas: array de objetos [{id_disciplina, frecuencia_practica (opcional)}]
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: array de objetos con las asignaciones realizadas
export async function asignarDisciplinas(id, disciplinas, token) {
  try {
    const res = await axios.post(`${API_URL}/asignar-disciplina/${id}`, { disciplinas }, {
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

// Obtener disciplinas por cancha
// Parámetros de entrada:
// - id: ID de la cancha
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: array de objetos [{id_disciplina, nombre, descripcion, frecuencia_practica}]
export async function getDisciplinasPorCancha(id, token) {
  try {
    const res = await axios.get(`${API_URL}/canchas/${id}/disciplinas`, {
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

// Listar disciplinas por cancha
// Parámetros de entrada:
// - id_cancha: ID de la cancha
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: array de strings con nombres de disciplinas
export async function listarDisciplinasPorCancha(id_cancha, token) {
  try {
    const res = await axios.get(`${API_URL}/disciplinas-cancha/${id_cancha}`, {
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

// Listar reseñas por cancha
// Parámetros de entrada:
// - id_cancha: ID de la cancha
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: array de objetos [{id_resena, estrellas, comentario, fecha_creacion, estado}]
export async function listarResenasPorCancha(id_cancha, token) {
  try {
    const res = await axios.get(`${API_URL}/resenas-cancha/${id_cancha}`, {
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

// Calcular promedio de reseñas por cancha
// Parámetros de entrada:
// - id_cancha: ID de la cancha
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: objeto con {promedio_estrellas, total_comentarios}
export async function calcularPromedioResenas(id_cancha, token) {
  try {
    const res = await axios.get(`${API_URL}/promedio-resenas/${id_cancha}`, {
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

// Listar reseñas detalladas por cancha
// Parámetros de entrada:
// - id_cancha: ID de la cancha
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: array de objetos [{estrellas, comentario, fecha_creacion, nombre_cliente}]
export async function listarResenasDetalladas(id_cancha, token) {
  try {
    const res = await axios.get(`${API_URL}/resenas-detalladas/${id_cancha}`, {
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

// Crear una reseña para una cancha
// Parámetros de entrada:
// - resenaData: objeto con {id_reserva (requerido), estrellas (requerido, 1-5), comentario (opcional)}
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: objeto con {id_resena, id_reserva, estrellas, comentario, fecha_creacion}
export async function crearResenaCancha(resenaData, token) {
  try {
    const res = await axios.post(`${API_URL}/resena-cancha`, resenaData, {
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