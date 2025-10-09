import axios from "axios";

const API_URL = "http://localhost:3000/espacio_deportivo";

export async function listarEspacios(limit = 12, offset = 0) {
  try {
    const res = await axios.get(`${API_URL}/datos-total`, {
      params: { limit, offset },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.data;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Error de conexión con el servidor");
  }
}

export async function listarEspaciosGeneral(limit = 12, offset = 0) {
  try {
    const res = await axios.get(`${API_URL}/espacios-general`, {
      params: { limit, offset },
    });
    return res.data;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Error de conexión con el servidor");
  }
}

export async function buscarEspaciosPorNombreODireccion(query) {
  try {
    const res = await axios.get(`${API_URL}/buscar-nombre-direccion`, {
      params: { q: query },
    });
    return res.data;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Error de conexión con el servidor");
  }
}

export async function listarDisciplinas() {
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

export async function buscarEspaciosPorDisciplina(disciplina) {
  try {
    const res = await axios.get(`${API_URL}/buscar-espacio/${disciplina}`);
    return res.data;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Error de conexión con el servidor");
  }
}

export async function obtenerEspacioPorId(id, token) {
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

export async function obtenerEspaciosPorAdminId(id_admin_esp_dep, token) {
  try {
    const res = await axios.get(`${API_URL}/admin-esp-dep/${id_admin_esp_dep}`, {
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

export async function crearEspacio(espacioData, token) {
  try {
    const res = await axios.post(`${API_URL}/`, espacioData, {
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

export async function actualizarEspacio(id, espacioData, token) {
  try {
    const res = await axios.patch(`${API_URL}/${id}`, espacioData, {
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

export async function eliminarEspacio(id, token) {
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

export async function listarCanchasDisponibles(id, token) {
  try {
    const res = await axios.get(`${API_URL}/canchas-disponibles-por-espacio/${id}`, {
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

export async function listarEspaciosCercanos(limit = 12, offset = 0, token) {
  try {
    const res = await axios.get(`${API_URL}/espacio-persona`, {
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

// Listar administradores deportivos únicos
export async function listarAdminsUnicos(token) {
  try {
    const res = await axios.get(`${API_URL}/admin-unicos`, {
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
