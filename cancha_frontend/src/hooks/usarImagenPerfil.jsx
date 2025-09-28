/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import axios from "axios";
import placeholderImage from "../assets/placeholder.jpeg";

export default function usarImagenPerfil(imagen_perfil) {
  const [imageSrc, setImageSrc] = useState(placeholderImage);

  useEffect(() => {
    let revokeUrl;
    if (!imagen_perfil) {
      setImageSrc(placeholderImage);
      return;
    }
    const controller = new AbortController();

    (async () => {
      try {
        const token = localStorage.getItem("token");
        const cleanedPath = imagen_perfil.replace(/^\/+/, "");
        const res = await axios.get(`http://localhost:3000/${cleanedPath}`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
          signal: controller.signal,
        });
        const url = URL.createObjectURL(res.data);
        revokeUrl = url;
        setImageSrc(url);
      } catch (e) {
        // axios v1 usa code ERR_CANCELED o name CanceledError
        if (e.code !== "ERR_CANCELED") {
          console.error("Error al cargar imagen:", e);
          setImageSrc(placeholderImage);
        }
      }
    })();

    return () => {
      controller.abort();
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [imagen_perfil]);

  return imageSrc;
}
