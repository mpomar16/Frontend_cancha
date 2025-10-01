import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerEmpresaPorId, actualizarEmpresa } from '../services/empresaService';
import EmpresaForm from '../components/EmpresaForm';

function EmpresaEdit() {
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  
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
    if (token && localStorage.getItem('role') === 'ADMINISTRADOR') {
      fetchEmpresa();
    }
  }, [empresaId, token]);

  const handleSubmit = async (data) => {
    try {
      await actualizarEmpresa(empresaId, data, token);
      navigate(`/empresa/${empresaId}`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!token) return <p className="text-red-500">Por favor, inicia sesión para editar.</p>;
  if (localStorage.getItem('role') !== 'ADMINISTRADOR') {
    return <p className="text-red-500">Acceso restringido: Solo para administradores</p>;
  }
  if (!empresa) return <div>Cargando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Editar Empresa (ID: {empresaId})</h1>
      {error && <p className="text-red-500">{error}</p>}
      <EmpresaForm initialData={empresa} onSubmit={handleSubmit} />
    </div>
  );
}

export default EmpresaEdit;