// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Empresa
import EmpresaHome from './pages/EmpresaHome';
import EmpresaDetail from './pages/EmpresaDetail';
import EmpresaEdit from './pages/EmpresaEdit';

// Espacios Deportivos
import EspaciosList from './pages/EspaciosList';
import EspacioDetail from './pages/EspacioDetail';
import EspacioCreate from './pages/EspacioCreate';
import EspacioEdit from './pages/EspacioEdit';
import EspaciosByAdmin from './pages/EspaciosByAdmin';
import EspaciosCercanos from './pages/EspaciosCercanos';
import CanchaDetail from './pages/CanchaDetail';

// Personas
import PersonasList from './pages/PersonasList';
import PersonaDetail from './pages/PersonaDetail';
import PersonaCreate from './pages/PersonaCreate';
import PersonaEdit from './pages/PersonaEdit';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchPersonas from './pages/SearchPersonas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página Principal - Empresa */}
        <Route path="/" element={<EmpresaHome />} />

        {/* Rutas de Empresa */}
        <Route path="/empresa/:id" element={<EmpresaDetail />} />
        <Route path="/empresa/edit/:id" element={<EmpresaEdit />} />

        {/* Personas */}
        <Route path="/personas" element={<PersonasList />} />

        <Route path="/persona/:id" element={<PersonaDetail />} />
        <Route path="/persona/create" element={<PersonaCreate />} />
        <Route path="/persona/edit/:id" element={<PersonaEdit />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<SearchPersonas />} />

        {/* Espacios Deportivos */}
        <Route path="/espacios" element={<EspaciosList />} />
        <Route path="/espacio/:id" element={<EspacioDetail />} />
        <Route path="/espacio/create" element={<EspacioCreate />} />
        <Route path="/espacio/edit/:id" element={<EspacioEdit />} />
        <Route path="/espacios/admin/:id_admin" element={<EspaciosByAdmin />} />
        <Route path="/espacios/cercanos" element={<EspaciosCercanos />} />
        <Route path="/cancha/:id" element={<CanchaDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;