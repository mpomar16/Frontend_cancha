import { useEffect, useState } from "react";
import axios from "axios";
import placeholderImage from "../../assets/placeholder.jpeg";

export default function PersonaCard({ persona }) {
  const [imageSrc, setImageSrc] = useState(placeholderImage);

  useEffect(() => {
    const fetchImage = async () => {
      if (persona.imagen_perfil) {
        try {
          const token = localStorage.getItem("token");
          const cleanedPath = persona.imagen_perfil.replace(/^\/+/, "");
          const response = await axios.get(`http://localhost:3000/${cleanedPath}`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: "blob",
          });
          const url = URL.createObjectURL(response.data);
          setImageSrc(url);
          // Limpieza al desmontar
          return () => URL.revokeObjectURL(url);
        } catch (err) {
          console.error("Error al cargar imagen:", err);
        }
      }
    };
    fetchImage();
  }, [persona.imagen_perfil]);

  return (
    <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <p><strong>{persona.nombre} {persona.apellido || ""}</strong></p>
      <p>Correo: {persona.correo}</p>
      {persona.telefono && <p>Teléfono: {persona.telefono}</p>}
      {persona.sexo && <p>Sexo: {persona.sexo}</p>}
      <img
        src={imageSrc}
        alt={persona.nombre}
        style={{ height: "100px", width: "100px", objectFit: "cover", borderRadius: "50%" }}
      />
    </div>
  );
}