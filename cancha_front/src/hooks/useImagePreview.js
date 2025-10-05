import { useEffect, useRef, useState } from "react";

/**
 * useImagePreview
 * - Maneja archivo + previsualización + drag&drop + validación + cleanup
 *
 * @param {Object} options
 *  - initialUrl: string | null (url ya guardada en el backend)
 *  - allowed: string[] (MIME types) ej: ["image/jpeg","image/png","image/webp"]
 *  - maxMB: number (tamaño máximo en MB)
 */
export default function useImagePreview({
  initialUrl = null,
  allowed = ["image/jpeg", "image/png", "image/webp"],
  maxMB = 5,
} = {}) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialUrl || null);
  const [error, setError] = useState("");
  const objectUrlRef = useRef(null);

  useEffect(() => {
    // si cambió initialUrl y no hay file local, actualiza preview
    if (!file && initialUrl) setPreviewUrl(initialUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl]);

  useEffect(() => {
    // cleanup del object URL generado
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const validate = (f) => {
    if (!f) return "No se seleccionó archivo.";
    if (!allowed.includes(f.type)) return "Formato no válido. Usa JPG, PNG o WEBP.";
    if (f.size > maxMB * 1024 * 1024) return `El archivo supera ${maxMB} MB.`;
    return null;
  };

  const setPreviewFromFile = (f) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    const url = URL.createObjectURL(f);
    objectUrlRef.current = url;
    setPreviewUrl(url);
  };

  const handleFile = (f) => {
    const msg = validate(f);
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    setFile(f);
    setPreviewFromFile(f);
  };

  const onChange = (e) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const onDragOver = (e) => e.preventDefault();

  const clear = () => {
    setFile(null);
    setError("");
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreviewUrl(initialUrl || null);
  };

  return {
    file,                // el File seleccionado (útil para FormData)
    previewUrl,          // url para <img />
    error, setError,     // error de validación
    inputProps: { onChange, accept: allowed.join(","), id: "imagen_perfil", type: "file" },
    dropzoneProps: { onDrop, onDragOver },
    clear,
  };
}
