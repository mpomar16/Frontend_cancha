// src/components/PersonaEditarForm.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerPersona } from "../api/persona_obtener";
import { actualizarPersona } from "../api/persona_actualizar";

export default function PersonaEditarForm({ id }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    sexo: "",
  });
  const [file, setFile] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPersona() {
      setIsLoading(true);
      try {
        const response = await obtenerPersona(id);
        if (response.success && response.data) {
          setFormData({
            nombre: response.data.nombre || "",
            apellido: response.data.apellido || "",
            telefono: response.data.telefono || "",
            correo: response.data.correo || "",
            sexo: response.data.sexo || "",
          });
        } else {
          setMensaje("Error al cargar datos: " + response.message);
        }
      } catch (error) {
        setMensaje(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPersona();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMensaje("");
    try {
      const response = await actualizarPersona(id, formData, file);
      if (response.success) {
        setMensaje("Persona actualizada exitosamente");
        setTimeout(() => navigate("/personas"), 2000); // Redirige después de 2s
      } else {
        setMensaje("Error: " + response.message);
      }
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", maxWidth: "400px", margin: "0 auto" }}>
      <label>Nombre:</label>
      <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} />

      <label>Apellido:</label>
      <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} />
      
      <label>Teléfono:</label>
      <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} />

      <label>Correo:</label>
      <input type="email" name="correo" value={formData.correo} onChange={handleChange} required />

      <label>Sexo:</label>
      <select name="sexo" value={formData.sexo} onChange={handleChange}>
        <option value="">Seleccione</option>
        <option value="masculino">Masculino</option>
        <option value="femenino">Femenino</option>
      </select>

      <label>Imagen de perfil (opcional):</label>
      <input type="file" accept="image/*" onChange={handleFileChange} />

      <button type="submit" disabled={isLoading} style={{ marginTop: "20px" }}>
        {isLoading ? "Actualizando..." : "Actualizar"}
      </button>

      {mensaje && (
        <p style={{ color: mensaje.includes("exitosamente") ? "green" : "red", marginTop: "10px" }}>
          {mensaje}
        </p>
      )}
    </form>
  );
}