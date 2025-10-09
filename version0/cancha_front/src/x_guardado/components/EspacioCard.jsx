const BASE_URL = "http://localhost:3000";

export default function EspacioCard({ espacio }) {
  const imageUrl = espacio.imagen_principal
    ? espacio.imagen_principal.startsWith("http")
      ? espacio.imagen_principal
      : `${BASE_URL}${espacio.imagen_principal}`
    : null;

  return (
    // 📏 Ancho fijo de la tarjeta → cámbialo para hacer la card más chica o grande
    <div className="border rounded-lg p-3 shadow-md text-center w-48 mx-auto">
      {imageUrl ? (
        <img src={imageUrl} alt={espacio.nombre} style={{ width: "210px" }} 
        onError={e => { e.target.style.display = "none"; 
          e.target.nextSibling.style.display = "flex"; 
        }} />
      ) : (
        // 📏 Si no hay imagen → mismo tamaño para mantener consistencia
        <div className="w-32 h-24 bg-gray-200 flex items-center justify-center rounded mb-2 mx-auto text-xs">
          Sin imagen
        </div>
      )}
      {/* 📏 Tamaño de la fuente → usa text-sm o text-base según prefieras */}
      <h3 className="text-sm font-semibold">{espacio.nombre}</h3>
      <p className="text-gray-600 text-xs">{espacio.direccion}</p>
    </div>
  );
}
