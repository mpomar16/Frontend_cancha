import { useState } from "react"
import { personaRegistro } from "../api/persona_registro"

export default function PersonaRegistroForm() {
  const [nombre, setNombre] = useState("")
  const [correo, setCorreo] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [mensaje, setMensaje] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = await personaRegistro(nombre, correo, contrasena)
      setMensaje(data.message)
    } catch (error) {
      setMensaje(error.message)
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Registro de Persona</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre: </label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
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
        <button type="submit">Registrar</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  )
}
