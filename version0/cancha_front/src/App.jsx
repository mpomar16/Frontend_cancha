// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Empresa
import EmpresaHome from "./pages/EmpresaHome";
import EmpresaDetail from "./pages/EmpresaDetail";
import EmpresaEdit from "./pages/EmpresaEdit";

// Espacios Deportivos
import EspaciosList from "./pages/EspaciosList";
import EspacioDetail from "./components/EspacioDetalle";
import EspacioCreate from "./pages/EspacioCreate";
import EspacioEdit from "./pages/EspacioEdit";
import EspaciosByAdmin from "./pages/EspaciosByAdmin";
import EspaciosCercanos from "./pages/EspaciosCercanos";
import CanchaDetail from "./pages/CanchaDetail";

// Personas
import PersonasList from "./pages/PersonasList";
import PersonaCreate from "./pages/PersonaCreate";
import PersonaEdit from "./pages/PersonaEdit";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchPersonas from "./pages/SearchPersonas";

//Cancha
import CanchaFormCreate from "./components/CanchaFormCreate";
import CanchaEdit from "./pages/CanchaEdit";

//disciplinas
import DisciplinasList from "./pages/DisciplinasList";
import DisciplinaCreate from "./pages/DisciplinaCreate";
import DisciplinaEdit from "./pages/DisciplinaEdit";

<<<<<<< HEAD:version0/cancha_front/src/App.jsx
//Encargado
import EncargadosList from './pages/EncargadosList';
import EncargadoDetalle from './components/EncargadoDetalle';
import EncargadoCreate from './pages/EncargadoCreate';
import EncargadoEdit from './pages/EncargadoEdit';
import ReporteIncidenciasList from './pages/ReporteIncidenciasList';
import ReporteIncidenciaDetalle from './components/ReporteIncidenciaDetalle';
import ReporteIncidenciaCreate from './pages/ReporteIncidenciaCreate';
import ReporteIncidenciaEdit from './pages/ReporteIncidenciaEdit';
=======
// Clientes
import ClientesList from "./pages/ClientesList";
import ClientesDetalle from "./components/ClientesDetalle"; // <--- IMPORTAR
import ClientesCreate from "./pages/ClientesCreate"; // si existe
import ClientesEdit from "./pages/ClientesEdit"; // si existe

import EncargadosList from "./pages/EncargadosList";
import EncargadoDetalle from "./components/EncargadoDetalle";
import EncargadoCreate from "./pages/EncargadoCreate";
import EncargadoEdit from "./pages/EncargadoEdit";
>>>>>>> 9f651334dd1c4bc75c2a432defb2e5eab652f07e:cancha_front/src/App.jsx

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
        <Route path="/encargado/edit/:id" element={<EncargadoEdit />} />

<<<<<<< HEAD:version0/cancha_front/src/App.jsx
        {/* Reporte Incidencia */}
        <Route path="/reporte-incidencias" element={<ReporteIncidenciasList />} />
        <Route path="/reporte-incidencia/:id" element={<ReporteIncidenciaDetalle />} />
        <Route path="/reporte-incidencia/create" element={<ReporteIncidenciaCreate />} />
        <Route path="/reporte-incidencia/edit/:id" element={<ReporteIncidenciaEdit />} />

=======
        {/* Clientes */}
        <Route path="/clientes" element={<ClientesList />} />
        <Route path="/clientes/:id" element={<ClientesDetalle />} />
        <Route path="/clientes/create" element={<ClientesCreate />} />
        <Route path="/clientes/edit/:id" element={<ClientesEdit />} />
>>>>>>> 9f651334dd1c4bc75c2a432defb2e5eab652f07e:cancha_front/src/App.jsx
      </Routes>
    </BrowserRouter>
  );
}

export default App;
