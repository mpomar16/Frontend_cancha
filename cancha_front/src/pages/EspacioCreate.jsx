import { useNavigate } from 'react-router-dom';
import EspacioForm from '../components/EspacioForm';
import { crearEspacio } from '../services/espacioService';

function EspacioCreate() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleSubmit = async (data) => {
    await crearEspacio(data, token);
    navigate('/espacios');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Crear Nuevo Espacio Deportivo</h1>
      <EspacioForm onSubmit={handleSubmit} token={token} />
    </div>
  );
}

export default EspacioCreate;