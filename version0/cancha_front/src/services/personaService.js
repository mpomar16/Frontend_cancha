import axios from "axios";

const API_URL = "http://localhost:3000/persona";

// Iniciar sesión
// Parámetros de entrada:
// - loginData: objeto con {correo (requerido), contrasena (requerido)}
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: objeto con {token, persona: {id_persona, nombre, usuario, apellido, correo, sexo, imagen_perfil}}
export async function login(loginData) {
  try {
    const res = await axios.post(`${API_URL}/sign-in`, loginData);
    return res.data;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Error de conexión con el servidor");
  }
}

// Registrar una nueva persona casual
// Parámetros de entrada:
// - personaData: objeto con {nombre, usuario (requerido), contrasena (requerido), correo (requerido)}
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: objeto con {id_persona, nombre, usuario, apellido, telefono, correo, sexo, imagen_perfil, latitud, longitud}
export async function crearPersonaCasual(personaData) {
  try {
    const res = await axios.post(`${API_URL}/sign-up`, personaData);
    return res.data;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Error de conexión con el servidor");
  }
}

// Obtener mi perfil
// Parámetros de entrada:
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: objeto con {id_persona, nombre, usuario, apellido, telefono, correo, sexo, imagen_perfil}
export async function obtenerMiPerfil(token) {
  try {
    const res = await axios.get(`${API_URL}/mi-perfil`, {
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

// Actualizar mi perfil
// Parámetros de entrada:
// - personaData: objeto FormData con {nombre, usuario, apellido, contrasena, telefono, correo, sexo, imagen_perfil (archivo)} (todos opcionales)
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: objeto con {id_persona, nombre, usuario, apellido, telefono, correo, sexo, imagen_perfil}
export async function actualizarMiPerfil(personaData, token) {
  try {
    const res = await axios.patch(`${API_URL}/mi-perfil`, personaData, {
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

// Listar personas con paginación
// Parámetros de entrada:
// - limit: número de registros a devolver (opcional, por defecto 12)
// - offset: número de registros a omitir (opcional, por defecto 0)
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: objeto con {personas: [{id_persona, nombre, usuario, apellido, telefono, correo, sexo, imagen_perfil}], limit, offset, hasMore}
export async function listarPersonas(limit = 12, offset = 0, token) {
  try {
    const res = await axios.get(`${API_URL}/datos-total`, {
      params: { limit, offset },
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

// Obtener persona por ID
// Parámetros de entrada:
// - id: ID de la persona
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: objeto con {id_persona, nombre, usuario, apellido, telefono, correo, sexo, imagen_perfil}
export async function obtenerPersonaPorId(id, token) {
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

// Obtener persona por correo
// Parámetros de entrada:
// - correo: correo de la persona
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: objeto con {id_persona, nombre, usuario, apellido, telefono, correo, sexo, imagen_perfil}
export async function obtenerPersonaPorCorreo(correo, token) {
  try {
    const res = await axios.get(`${API_URL}/correo/${correo}`, {
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

// Buscar personas por nombre
// Parámetros de entrada:
// - nombre: string con el nombre a buscar
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: array de objetos [{id_persona, nombre, usuario, apellido, telefono, correo, sexo, imagen_perfil}]
export async function buscarPersonaPorNombre(nombre, token) {
  try {
    const res = await axios.get(`${API_URL}/buscar-nombre/${nombre}`, {
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

// Listar valores posibles del enum sexo
// Parámetros de entrada:
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: array de strings con los valores posibles del enum sexo
export async function listarSexoEnum(token) {
  try {
    const res = await axios.get(`${API_URL}/sexo-enum`, {
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

// Actualizar una persona
// Parámetros de entrada:
// - id: ID de la persona
// - personaData: objeto FormData con {nombre, usuario, apellido, contrasena, telefono, correo, sexo, imagen_perfil (archivo)} (todos opcionales)
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: objeto con {id_persona, nombre, usuario, apellido, telefono, correo, sexo, imagen_perfil}
export async function actualizarPersona(id, personaData, token) {
  try {
    const res = await axios.patch(`${API_URL}/${id}`, personaData, {
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

// Eliminar una persona
// Parámetros de entrada:
// - id: ID de la persona
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
export async function eliminarPersona(id, token) {
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

/**
 * Listar personas elegibles para ENCARGADO (sin rol ENCARGADO ni ADMINISTRADOR)
 * Parámetros:
 * - opts: { limit = 12, offset = 0, q = "" }  // q: búsqueda por nombre/apellido/correo (opcional)
 * - token: Bearer
 * Respuesta normalizada:
 * - { personas: [...], hasMore: boolean, limit: number, offset: number }
 */
export async function listarPersonasElegiblesEncargado(
  opts = {},
  token
) {
  const { limit = 12, offset = 0, q = "" } = opts;
  try {
    const res = await axios.get(`${API_URL}/elegibles-encargado`, {
      params: { limit, offset, q },
      headers: { Authorization: `Bearer ${token}` },
    });

    // el backend devuelve { success, message, data: { personas, limit, offset, hasMore } }
    const payload = res?.data?.data ?? res?.data ?? {};
    return {
      personas: payload.personas ?? [],
      hasMore: Boolean(payload.hasMore),
      limit: payload.limit ?? limit,
      offset: payload.offset ?? offset,
    };
  } catch (err) {
    throw new Error(
      err?.response?.data?.message || "Error al listar personas elegibles"
    );
  }
}