import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenerEmpresaPorId } from '../services/empresaService';

function EmpresaDetail() {
  const { id } = useParams();
  const [empresa, setEmpresa] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchEmpresa() {
      try {
        const response = await obtenerEmpresaPorId(id, token);
        setEmpresa(response.data);
      } catch (err) {
        setError(err.message);
      }
    }
    if (token) fetchEmpresa();
  }, [id, token]);

  if (!token) return <p className="text-red-500">Por favor, inicia sesión para ver los detalles.</p>;
  if (!empresa) return <div>Cargando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{empresa.nombre_sistema}</h1>
      {error && <p className="text-red-500">{error}</p>}
      {empresa.logo_imagen && (
        <img src={empresa.logo_imagen} alt="Logo" className="w-32 h-32 rounded-full mb-4" />
      )}
      <p><strong>Fecha Registrado:</strong> {new Date(empresa.fecha_registrado).toLocaleDateString()}</p>
      <p><strong>Título H1:</strong> {empresa.titulo_h1}</p>
      <p><strong>Descripción H1:</strong> {empresa.descripcion_h1}</p>
      <p><strong>Te Ofrecemos:</strong> {empresa.te_ofrecemos}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {empresa.imagen_1 && (
          <div>
            <img src={empresa.imagen_1} alt="Imagen 1" className="w-full h-48 object-cover rounded mb-2" />
            <p><strong>Título 1:</strong> {empresa.titulo_1}</p>
            <p><strong>Descripción 1:</strong> {empresa.descripcion_1}</p>
          </div>
        )}
        {empresa.imagen_2 && (
          <div>
            <img src={empresa.imagen_2} alt="Imagen 2" className="w-full h-48 object-cover rounded mb-2" />
            <p><strong>Título 2:</strong> {empresa.titulo_2}</p>
            <p><strong>Descripción 2:</strong> {empresa.descripcion_2}</p>
          </div>
        )}
        {empresa.imagen_3 && (
          <div>
            <img src={empresa.imagen_3} alt="Imagen 3" className="w-full h-48 object-cover rounded mb-2" />
            <p><strong>Título 3:</strong> {empresa.titulo_3}</p>
            <p><strong>Descripción 3:</strong> {empresa.descripcion_3}</p>
          </div>
        )}
      </div>
      <p><strong>Misión:</strong> {empresa.mision}</p>
      <p><strong>Visión:</strong> {empresa.vision}</p>
      <p><strong>Nuestro Objetivo:</strong> {empresa.nuestro_objetivo}</p>
      <ul className="list-disc pl-6 mb-4">
        {empresa.objetivo_1 && <li>{empresa.objetivo_1}</li>}
        {empresa.objetivo_2 && <li>{empresa.objetivo_2}</li>}
        {empresa.objetivo_3 && <li>{empresa.objetivo_3}</li>}
      </ul>
      <p><strong>Quienes Somos:</strong> {empresa.quienes_somos}</p>
      <p><strong>Correo Empresa:</strong> {empresa.correo_empresa}</p>
      <p><strong>Teléfono:</strong> {empresa.telefono}</p>
      <p><strong>Dirección:</strong> {empresa.direccion}</p>
      <p><strong>ID Administrador:</strong> {empresa.id_administrador}</p>
      {localStorage.getItem('role') === 'ADMINISTRADOR' && (
        <Link to={`/empresa/edit/${id}`} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mt-4 inline-block">
          Editar Empresa
        </Link>
      )}
    </div>
  );
}

export default EmpresaDetail;