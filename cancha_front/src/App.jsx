// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Empresa
import EmpresaHome from './pages/EmpresaHome';
import EmpresaDetail from './pages/EmpresaDetail';
import EmpresaEdit from './pages/EmpresaEdit';

// Espacios Deportivos
import EspaciosList from './pages/EspaciosList';
import EspacioDetail from './components/EspacioDetalle';
import EspacioCreate from './pages/EspacioCreate';
import EspacioEdit from './pages/EspacioEdit';
import EspaciosByAdmin from './pages/EspaciosByAdmin';
import EspaciosCercanos from './pages/EspaciosCercanos';
import CanchaDetail from './pages/CanchaDetail';

// Personas
import PersonasList from './pages/PersonasList';
import PersonaCreate from './pages/PersonaCreate';
import PersonaEdit from './pages/PersonaEdit';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchPersonas from './pages/SearchPersonas';

//Cancha
import CanchaFormCreate from './components/CanchaFormCreate';
import CanchaEdit from './pages/CanchaEdit';

//disciplinas
import DisciplinasList from './pages/DisciplinasList';
import DisciplinaCreate from './pages/DisciplinaCreate';
import DisciplinaEdit from './pages/DisciplinaEdit';

//Encargado
import EncargadosList from './pages/EncargadosList';
import EncargadoDetalle from './components/EncargadoDetalle';
import EncargadoCreate from './pages/EncargadoCreate';

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
        <Route path="/persona/create" element={<PersonaCreate />} />
        <Route path="/persona/edit/:id" element={<PersonaEdit />} />
        <Route path="/search" element={<SearchPersonas />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


        {/* Espacios Deportivos */}
        <Route path="/espacios" element={<EspaciosList />} />
        <Route path="/espacio/:id" element={<EspacioDetail />} />
        <Route path="/espacio/create" element={<EspacioCreate />} />
        <Route path="/espacio/edit/:id" element={<EspacioEdit />} />
        <Route path="/espacios/admin/:id_admin" element={<EspaciosByAdmin />} />
        <Route path="/espacios/cercanos" element={<EspaciosCercanos />} />
        <Route path="/cancha/create" element={<CanchaFormCreate />} />
        <Route path="/cancha/edit/:id" element={<CanchaEdit />} />
        <Route path="/cancha/:id" element={<CanchaDetail />} />

        {/* Disciplinas */}
        <Route path="/disciplinas" element={<DisciplinasList />} />
        <Route path="/disciplina/create" element={<DisciplinaCreate />} />
        <Route path="/disciplina/edit/:id" element={<DisciplinaEdit />} />

        {/* Encargado */}
        <Route path="/encargados" element={<EncargadosList />} />
        <Route path="/encargado/:id" element={<EncargadoDetalle />} />
        <Route path="/encargado/create" element={<EncargadoCreate />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;