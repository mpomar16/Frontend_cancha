import { useState, useEffect } from 'react';
import { listarCanchas } from '../services/canchaService';
import CanchaCard from '../components/CanchaCard';

function CanchasList() {
  const [canchas, setCanchas] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token'); // Assumes token is stored in localStorage

  useEffect(() => {
    async function fetchCanchas() {
      try {
        const response = await listarCanchas(token);
        console.log("Respuesta de listarCanchas:", response); // debug
        setCanchas(response.data || []); // aquí asignamos directamente el array
      } catch (err) {
        setError(err.message);
      }
    }
    fetchCanchas();
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Lista de Canchas</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {canchas.map((cancha) => (
          <CanchaCard key={cancha.id_cancha} cancha={cancha} />
        ))}
      </div>
    </div>
  );
}

export default CanchasList;