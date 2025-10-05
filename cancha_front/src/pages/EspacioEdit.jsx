import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerEspacioPorId, actualizarEspacio } from '../services/espacioService';
import EspacioForm from '../components/EspacioForm';
import Sidebar from '../components/Sidebar';

function EspacioEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [espacio, setEspacio] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchEspacio() {
      try {
        const response = await obtenerEspacioPorId(id, token);
        setEspacio(response.data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchEspacio();
  }, [id, token]);

  const handleSubmit = async (data) => {
    await actualizarEspacio(id, data, token);
    navigate(`/espacio/${id}`);
  };

  if (!espacio) return <div>Cargando...</div>;

  return (
    <Sidebar>
      <h1 className="text-2xl font-bold mb-4">Editar Espacio Deportivo</h1>
      {error && <p className="text-red-500">{error}</p>}
      <EspacioForm initialData={espacio} onSubmit={handleSubmit} token={token} />
    </Sidebar>
  );
}

export default EspacioEdit;