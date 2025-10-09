import { Link, useNavigate } from 'react-router-dom';

function EspacioNavbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Leer persona desde localStorage
  const personaJSON = localStorage.getItem('persona');
  const persona = personaJSON ? JSON.parse(personaJSON) : null;
  const userId = persona?.id_persona || null; // ahora sí tenemos el ID

  const isLoggedIn = !!token;

  const handleLogout = () => {
    console.log('Cerrando sesión...');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('persona');
    navigate('/login'); 
  };

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between">
        <Link to="/espacios" className="text-xl font-bold">Espacios Deportivos</Link>
        <div>
          {isLoggedIn ? (
            <>
              <Link to="/espacios/cercanos" className="mr-4">Espacios Cercanos</Link>
              {(userRole === 'ADMINISTRADOR' || userRole === 'ADMIN_ESP_DEP') && (
                <>
                  <Link to="/espacio/create" className="mr-4">Crear Espacio</Link>
                  <Link 
                    to={`/espacios/admin/${userId}`} 
                    className="mr-4"
                    onClick={() => console.log('Link a Mis Espacios:', `/espacios/admin/${userId}`)}
                  >
                    Mis Espacios
                  </Link>
                </>
              )}
              <button onClick={handleLogout} className="mr-4">Cerrar Sesión</button>
            </>
          ) : (
            <Link to="/login" className="mr-4">Iniciar Sesión</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default EspacioNavbar;
