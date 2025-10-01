function EmpresaFooter({ data }) {
  if (!data) return <div>Cargando...</div>;

  return (
    <footer className="bg-gray-800 text-white p-6">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-4">Sobre Nosotros</h2>
        <p className="mb-4">{data.quienes_somos}</p>
        <p><strong>Correo:</strong> {data.correo_empresa}</p>
        <p><strong>Teléfono:</strong> {data.telefono}</p>
        <p><strong>Dirección:</strong> {data.direccion}</p>
      </div>
    </footer>
  );
}

export default EmpresaFooter;