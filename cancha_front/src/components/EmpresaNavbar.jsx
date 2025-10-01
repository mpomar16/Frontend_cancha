import { Link, useNavigate } from 'react-router-dom';

function EmpresaNavbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login'); // Assumes login page from persona app
  };

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between">
        <Link to="/" className="text-xl font-bold">Empresa App</Link>
        <div>
          {isLoggedIn ? (
            <>
              {userRole === 'ADMINISTRADOR' && (
                <>
                  <Link to="/empresa/edit/1" className="mr-4">Editar Empresa</Link>
                  <Link to="/empresa/1" className="mr-4">Detalles Empresa</Link>
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

export default EmpresaNavbar;