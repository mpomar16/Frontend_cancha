// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainNavbar from "./MainNavbar";

// Espacios Deportivos
import EspaciosList from "./pages/EspaciosList";
import EspacioDetail from "./pages/EspacioDetail";
import EspacioCreate from "./pages/EspacioCreate";
import EspacioEdit from "./pages/EspacioEdit";
import EspaciosByAdmin from "./pages/EspaciosByAdmin";
import EspaciosCercanos from "./pages/EspaciosCercanos";

// Personas
import PersonasList from "./pages/PersonasList";
import PersonaDetail from "./pages/PersonaDetail";
import PersonaCreate from "./pages/PersonaCreate";
import PersonaEdit from "./pages/PersonaEdit";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import SearchPersonas from "./pages/SearchPersonas";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <MainNavbar />
        <div className="container mx-auto p-4">
          <Routes>
            {/* Personas */}
            <Route path="/" element={<PersonasList />} />
            <Route path="/persona/:id" element={<PersonaDetail />} />
            <Route path="/persona/create" element={<PersonaCreate />} />
            <Route path="/persona/edit/:id" element={<PersonaEdit />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/search" element={<SearchPersonas />} />

            {/* Espacios Deportivos */}
            <Route path="/espacios" element={<EspaciosList />} />
            <Route path="/espacio/:id" element={<EspacioDetail />} />
            <Route path="/espacio/create" element={<EspacioCreate />} />
            <Route path="/espacio/edit/:id" element={<EspacioEdit />} />
            <Route
              path="/espacios/admin/:id_admin"
              element={<EspaciosByAdmin />}
            />
            <Route path="/espacios/cercanos" element={<EspaciosCercanos />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
