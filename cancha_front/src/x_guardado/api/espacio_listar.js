import axios from "axios";

const API_URL = "http://localhost:3000/espacio_deportivo";

export async function listarEspacios(limit = 12, offset = 0) {
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