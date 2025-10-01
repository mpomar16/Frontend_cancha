import { useState } from "react"
import { personaLogin } from "../api/persona_login"

export default function PersonaLoginForm() {
  const [correo, setCorreo] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [mensaje, setMensaje] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = await personaLogin(correo, contrasena)
      setMensaje(data.message)

      if (data.success) {
        console.log("Token guardado en localStorage:", localStorage.getItem("token"))
      }
    } catch (error) {
      setMensaje(error.message)
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login de Persona</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Correo: </label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña: </label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
        </div>
        <button type="submit">Ingresar</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  )
}
