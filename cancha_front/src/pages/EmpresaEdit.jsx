import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerEmpresaPorId, actualizarEmpresa } from '../services/empresaService';
import EmpresaForm from '../components/EmpresaForm';

function EmpresaEdit() {
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  // 🔹 Leer roles como array
  const roles = JSON.parse(localStorage.getItem('roles') || '[]');
  const isAdmin = roles.includes('ADMINISTRADOR');

  // Asignar directamente el ID 2
  const empresaId = 2;

  useEffect(() => {
    async function fetchEmpresa() {
      try {
        const response = await obtenerEmpresaPorId(empresaId, token);
        setEmpresa(response.data);
      } catch (err) {
        setError(err.message);
      }
    }
    if (token && isAdmin) {
      fetchEmpresa();
    }
  }, [empresaId, token, isAdmin]);

  const handleSubmit = async (data) => {
    try {
      await actualizarEmpresa(empresaId, data, token);
      navigate(`/`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!token) return <p className="text-red-500">Por favor, inicia sesión para editar.</p>;
  if (!isAdmin) {
    return <p className="text-red-500">Acceso restringido: Solo para administradores</p>;
  }
  if (!empresa) return <div>Cargando...</div>;

  return (
    <div className="pt-10">
      <h1 className="text-4xl font-poppins font-bold text-azul-950 text-center mb-6">
        Editar Información de la Empresa
      </h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="flex justify-center">
        <div className="w-full md:w-3/4">
          <EmpresaForm initialData={empresa} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}

export default EmpresaEdit;
