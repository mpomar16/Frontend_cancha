import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { obtenerEspaciosPorAdminId } from '../services/espacioService';
import EspacioCard from '../components/EspacioCard';

function EspaciosByAdmin() {
  const { id_admin } = useParams();
  const [espacios, setEspacios] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchEspacios() {
      try {
        const response = await obtenerEspaciosPorAdminId(id_admin, token);
        setEspacios(response.data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchEspacios();
  }, [id_admin, token]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Espacios por Administrador</h1>
      {error && <p className="text-red-500">{error}</p>}
      {(localStorage.getItem('role') !== 'ADMINISTRADOR' && localStorage.getItem('role') !== 'ADMIN_ESP_DEP') && (
        <p className="text-red-500">Acceso restringido: Solo para administradores</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {espacios.map((espacio) => (
          <EspacioCard key={espacio.id_espacio} espacio={espacio} />
        ))}
      </div>
    </div>
  );
}

export default EspaciosByAdmin;