import { useNavigate } from 'react-router-dom';
import PersonaRegistro from '../components/PersonaRegistroCasual';
import { crearPersonaCasual } from '../services/personaService';

function PersonaCreate() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    await crearPersonaCasual(data);
    navigate('/login');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Crear Nueva Persona</h1>
      <PersonaRegistro onSubmit={handleSubmit} isSignUp={true} />
    </div>
  );
}

export default PersonaCreate;