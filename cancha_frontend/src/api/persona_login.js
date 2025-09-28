import axios from "axios"

const API_URL = "http://localhost:3000/persona"

export async function personaLogin(correo, contraseña) {
  try {
    const res = await axios.post(`${API_URL}/login`, {
      correo,
      contraseña
    })

    // Guardamos el token en localStorage
    if (res.data.success && res.data.data.token) {
      localStorage.setItem("token", res.data.data.token)
      localStorage.setItem("persona", JSON.stringify(res.data.data.persona))
    }

    return res.data
  } catch (err) {
    if (err.response) {
      throw new Error(err.response.data.message)
    }
    throw new Error("Error de conexión con el servidor")
  }
}
