// hooks/MepresaImagenes.js
export const API_BASE = "http://localhost:3000";

export function armarImagenUrl(path, placeholder = "") {
  if (!path) return placeholder;
  // si ya es absoluta (http/https/data/base64), no toques
  if (/^(https?:)?\/\//i.test(path) || /^data:|^blob:/i.test(path)) return path;
  // asegura un único slash entre base y path
  const needsSlash = !path.startsWith("/");
  return `${API_BASE}${needsSlash ? "/" : ""}${path}`;
}
