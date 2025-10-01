import { useNavigate } from 'react-router-dom';
import CanchaForm from '../components/CanchaForm';
import { crearCancha } from '../services/canchaService';

function CanchaCreate() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleSubmit = async (data) => {
    await crearCancha(data, token);
    navigate('/');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Crear Nueva Cancha</h1>
      <CanchaForm onSubmit={handleSubmit} token={token} />
    </div>
  );
}

export default CanchaCreate;