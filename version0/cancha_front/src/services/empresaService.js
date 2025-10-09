import axios from "axios";

const API_URL = "http://localhost:3000/empresa";

// Obtener datos del body de la empresa (sin autenticación)
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: objeto con {id_empresa, fecha_registrado, logo_imagen, nombre_sistema, titulo_h1, descripcion_h1, te_ofrecemos, imagen_1, imagen_2, imagen_3, titulo_1, titulo_2, titulo_3, descripcion_1, descripcion_2, descripcion_3, mision, vision, nuestro_objetivo, objetivo_1, objetivo_2, objetivo_3, id_administrador}
export async function obtenerEmpresaBody() {
  try {
    const res = await axios.get(`${API_URL}/body`);
    return res.data;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Error de conexión con el servidor");
  }
}

// Obtener datos del footer de la empresa (sin autenticación)
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: objeto con {quienes_somos, correo_empresa, telefono, direccion}
export async function obtenerEmpresaFooter() {
  try {
    const res = await axios.get(`${API_URL}/footer`);
    return res.data;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Error de conexión con el servidor");
  }
}

// Obtener empresa por ID
// Parámetros de entrada:
// - id: ID de la empresa
// - token: token de autenticación en los headers
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: objeto con {id_empresa, fecha_registrado, logo_imagen, nombre_sistema, titulo_h1, descripcion_h1, te_ofrecemos, imagen_1, imagen_2, imagen_3, titulo_1, titulo_2, titulo_3, descripcion_1, descripcion_2, descripcion_3, mision, vision, nuestro_objetivo, objetivo_1, objetivo_2, objetivo_3, quienes_somos, correo_empresa, telefono, direccion, id_administrador}
export async function obtenerEmpresaPorId(id, token) {
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

// Actualizar empresa
// Parámetros de entrada:
// - id: ID de la empresa
// - empresaData: objeto FormData con campos opcionales: {nombre_sistema, titulo_h1, descripcion_h1, te_ofrecemos, titulo_1, titulo_2, titulo_3, descripcion_1, descripcion_2, descripcion_3, mision, vision, nuestro_objetivo, objetivo_1, objetivo_2, objetivo_3, quienes_somos, correo_empresa, telefono, direccion, id_administrador}
// - archivos: se pueden incluir 'logo_imagen', 'imagen_1', 'imagen_2', 'imagen_3' como archivos
// - token: token de autenticación en los headers (requiere rol ADMINISTRADOR)
// Respuesta:
// - success: booleano indicando si la operación fue exitosa
// - message: mensaje descriptivo del resultado
// - data: objeto con la empresa actualizada
export async function actualizarEmpresa(id, empresaData, token) {
  try {
    const res = await axios.patch(`${API_URL}/${id}`, empresaData, {
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

// Obtener datos para el navbar (logo + nombre del sistema)
export async function obtenerEmpresaNavbar() {
  try {
    const res = await axios.get(`${API_URL}/body`);
    return res.data;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Error de conexión con el servidor");
  }
}
