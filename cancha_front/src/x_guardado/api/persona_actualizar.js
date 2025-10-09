// src/api/persona_actualizar.js
import axios from "axios";

const API_URL = "http://localhost:3000/persona";

export async function actualizarPersona(id, datos, file) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token, debe iniciar sesión");

  const formData = new FormData();

  // Agregar campos de texto (solo si se proporcionan)
  if (datos.nombre) formData.append("nombre", datos.nombre);
  if (datos.apellido) formData.append("apellido", datos.apellido);
  if (datos.telefono) formData.append("telefono", datos.telefono);
  if (datos.correo) formData.append("correo", datos.correo);
  if (datos.sexo) formData.append("sexo", datos.sexo);

  // Agregar archivo (campo 'persona' según backend)
  if (file) {
    formData.append("imagen_perfil", file);
  }

  try {
    const res = await axios.patch(`${API_URL}/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        // No setear 'Content-Type', axios lo hace automáticamente
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