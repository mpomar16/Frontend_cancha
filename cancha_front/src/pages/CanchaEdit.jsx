import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerCanchaPorId, actualizarCancha } from '../services/canchaService';
import CanchaForm from '../components/CanchaForm';

function CanchaEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cancha, setCancha] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchCancha() {
      try {
        const response = await obtenerCanchaPorId(id, token);
        setCancha(response.data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchCancha();
  }, [id, token]);

  const handleSubmit = async (data) => {
    await actualizarCancha(id, data, token);
    navigate(`/cancha/${id}`);
  };

  if (!cancha) return <div>Cargando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Editar Cancha</h1>
      {error && <p className="text-red-500">{error}</p>}
      <CanchaForm initialData={cancha} onSubmit={handleSubmit} token={token} />
    </div>
  );
}

export default CanchaEdit;