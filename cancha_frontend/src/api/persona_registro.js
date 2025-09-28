import axios from "axios"

const API_URL = "http://localhost:3000/persona"

export async function personaRegistro(nombre, correo, contraseña) {
  try {
    const res = await axios.post(`${API_URL}/registro`, {
      nombre,
      correo,
      contraseña
    })
    return res.data
  } catch (err) {
    if (err.response) {
      throw new Error(err.response.data.message)
    }
    throw new Error("Error de conexión con el servidor")
  }
}
