// src/components/MainNavbar.jsx
import { Link, useNavigate } from 'react-router-dom';

// Función para decodificar el token JWT
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

function MainNavbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Extraer información del token
  let userId = null;
  if (token) {
    const decodedToken = decodeToken(token);
    userId = decodedToken?.id_persona || null;
  }

  const isLoggedIn = !!token;

  const handleLogout = () => {
    console.log('Cerrando sesión...');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('persona');
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo y Navegación Principal */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-xl font-bold">Inicio</Link>
          <Link to="/espacios" className="text-lg">Espacios Deportivos</Link>
          <Link to="/personas" className="text-lg">Personas</Link>
        </div>

        {/* Navegación de Usuario */}
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              {/* Navegación para Administradores */}
              {userRole === 'ADMINISTRADOR' && (
                <>
                  <Link to="/empresa/edit/1" className="hover:text-blue-200">Editar Empresa</Link>
                  <Link to="/empresa/1" className="hover:text-blue-200">Detalles Empresa</Link>
                </>
              )}

              {/* Espacios Deportivos */}
              <Link to="/espacios/cercanos" className="hover:text-blue-200">Espacios Cercanos</Link>
              {(userRole === 'ADMINISTRADOR' || userRole === 'ADMIN_ESP_DEP') && (
                <>
                  <Link to="/espacio/create" className="hover:text-blue-200">Crear Espacio</Link>
                  <Link 
                    to={`/espacios/admin/${userId}`} 
                    className="hover:text-blue-200"
                    onClick={() => {
                      if (!userId) {
                        console.error('No se pudo obtener el ID del usuario');
                        alert('Error: No se pudo cargar la información del usuario');
                      }
                    }}
                  >
                    Mis Espacios
                  </Link>
                </>
              )}

              {/* Personas */}
              <Link to="/profile" className="hover:text-blue-200">Mi Perfil</Link>
              {userRole === 'ADMINISTRADOR' && (
                <>
                  <Link to="/search" className="hover:text-blue-200">Buscar Personas</Link>
                </>
              )}

              <button 
                onClick={handleLogout} 
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition-colors"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link 
                to="/persona/create" 
                className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default MainNavbar;