import { useState } from "react"
import { personaRegistro } from "../api/persona_registro"
import { Eye, EyeClosed } from 'lucide-react';

export default function PersonaRegistroForm() {
  const [nombre, setNombre] = useState("")
  const [correo, setCorreo] = useState("")
  const [contraseña, setContraseña] = useState("")
  const [mostrarCon, setMostrarCon] = useState(false)
  const [mensaje, setMensaje] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje("");
    try {
      const data = await personaRegistro(nombre, correo, contraseña)
      if (data.message == "Persona creada exitosamente") {
        setMensaje("")
      } else {
        setMensaje(data.message)
      }

      if (data.success) {
        window.location.href = "/login";
      }
    } catch (error) {
      setMensaje(error.message)
    }
  }

  return (
    <div className="font-poppins relative min-h-screen bg-azul-950">
            {/* Fondo dividido */}
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
                <div className="bg-azul-950"></div>
                <div className="bg-blanco-50"></div>
            </div>

            {/* Formulario flotante */}
            <div className="absolute inset-0 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3 sm:gap-0">
                        <div className="flex items-center gap-2">
                            {/*<Logo size="sm" showLogo={false} showText={true} color="text-verde-600" />*/}
                        </div>
                        <p className="text-sm text-gris-300">
                            ¿Ya tienes una cuenta?{" "}
                            <a href="/login" className="text-verde-600 font-medium hover:underline">
                                Sign In
                            </a>
                        </p>
                    </div>

                    <h1 className="mb-6 text-3xl font-semibold text-azul-950">Sign Up</h1>

                    {/* Form */}
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-azul-950 mb-1">
                                Nombre*
                            </label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Nombre"
                                className="w-full rounded-lg border border-gris-300 focus:ring-1 focus:ring-verde-600 focus:outline-none px-4 py-3 text-sm"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-azul-950 mb-1">
                                Email*
                            </label>
                            <input
                                type="email"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                placeholder="Email"
                                className="w-full rounded-lg border border-gris-300 focus:ring-1 focus:ring-verde-600 focus:outline-none px-4 py-3 text-sm"
                            />
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label className="block text-sm font-medium text-azul-950 mb-1">
                                Contraseña*
                            </label>
                            <div className="relative">
                                <input
                                    type={mostrarCon ? "text" : "password"}
                                    value={contraseña}
                                    onChange={(e) => setContraseña(e.target.value)}
                                    placeholder="Contraseña"
                                    className="w-full rounded-lg border border-gris-300 focus:ring-1 focus:ring-verde-600 focus:outline-none px-4 py-3 text-sm pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-3 flex items-center text-gris-300"
                                    onClick={() => setMostrarCon(!mostrarCon)}
                                >
                                    {mostrarCon ? <EyeClosed size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {mensaje && <p className="text-red-700 text-sm">{mensaje}</p>}

                        {/* Botón */}
                        <button
                            type="submit"
                            className="w-full bg-verde-600 text-blanco-50 font-semibold rounded-lg py-3 shadow-md hover:bg-verde-600/90 transition"
                        >
                            Sign up
                        </button>
                    </form>
                </div>
            </div>
        </div>
  )
}
