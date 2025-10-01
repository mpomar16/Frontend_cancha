const API_BASE = "http://localhost:3000";

function EmpresaBody({ data }) {
  if (!data) return <div>Cargando...</div>;

  // Función para manejar errores de carga de imágenes
  const handleImageError = (e) => {
    e.target.src = "/default-avatar.png";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h1 className="text-3xl font-bold mb-4">{data.titulo_h1}</h1>
      <p className="text-gray-700 mb-4">{data.descripcion_h1}</p>
      
      {data.logo_imagen && (
        <img 
          src={`${API_BASE}${data.logo_imagen}`}
          alt="Logo" 
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
          onError={handleImageError}
        />
      )}
      
      <h2 className="text-2xl font-bold mb-2">Te Ofrecemos</h2>
      <p className="text-gray-700 mb-4">{data.te_ofrecemos}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {data.imagen_1 && (
          <div>
            <img 
              src={`${API_BASE}${data.imagen_1}`}
              alt="Imagen 1" 
              className="w-full h-48 object-cover rounded mb-2"
              onError={handleImageError}
            />
            <h3 className="text-xl font-bold">{data.titulo_1}</h3>
            <p className="text-gray-700">{data.descripcion_1}</p>
          </div>
        )}
        
        {data.imagen_2 && (
          <div>
            <img 
              src={`${API_BASE}${data.imagen_2}`}
              alt="Imagen 2" 
              className="w-full h-48 object-cover rounded mb-2"
              onError={handleImageError}
            />
            <h3 className="text-xl font-bold">{data.titulo_2}</h3>
            <p className="text-gray-700">{data.descripcion_2}</p>
          </div>
        )}
        
        {data.imagen_3 && (
          <div>
            <img 
              src={`${API_BASE}${data.imagen_3}`}
              alt="Imagen 3" 
              className="w-full h-48 object-cover rounded mb-2"
              onError={handleImageError}
            />
            <h3 className="text-xl font-bold">{data.titulo_3}</h3>
            <p className="text-gray-700">{data.descripcion_3}</p>
          </div>
        )}
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Misión</h2>
      <p className="text-gray-700 mb-4">{data.mision}</p>
      
      <h2 className="text-2xl font-bold mb-2">Visión</h2>
      <p className="text-gray-700 mb-4">{data.vision}</p>
      
      <h2 className="text-2xl font-bold mb-2">Nuestro Objetivo</h2>
      <p className="text-gray-700 mb-4">{data.nuestro_objetivo}</p>
      
      <ul className="list-disc pl-6">
        {data.objetivo_1 && <li className="text-gray-700">{data.objetivo_1}</li>}
        {data.objetivo_2 && <li className="text-gray-700">{data.objetivo_2}</li>}
        {data.objetivo_3 && <li className="text-gray-700">{data.objetivo_3}</li>}
      </ul>
    </div>
  );
}

export default EmpresaBody;