import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerPersonaPorId, actualizarPersona } from '../services/personaService';
import PersonaForm from '../components/PersonaForm';

function PersonaEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [persona, setPersona] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchPersona() {
      try {
        const response = await obtenerPersonaPorId(id, token);
        setPersona(response.data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchPersona();
  }, [id, token]);

  const handleSubmit = async (data) => {
    await actualizarPersona(id, data, token);
    navigate(`/persona/${id}`);
  };

  if (!persona) return <div>Cargando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Editar Persona</h1>
      {error && <p className="text-red-500">{error}</p>}
      <PersonaForm initialData={persona} onSubmit={handleSubmit} token={token} />
    </div>
  );
}

export default PersonaEdit;