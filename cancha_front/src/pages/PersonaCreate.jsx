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
    <div className="max-w-3xl mx-auto mt-16">
      <h1 className="text-4xl font-poppins font-bold text-azul-950 text-center mb-6">
        Crear Nueva Persona
      </h1>
      <PersonaRegistro onSubmit={handleSubmit} isSignUp={true} />
    </div>
  );
}

export default PersonaCreate;
