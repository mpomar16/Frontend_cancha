import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import RegistroPage from "./pages/PersonaRegistrarseFacil"
import LoginPage from "./pages/PersonaLogin"
import PersonaListPage from "./pages/PersonaListarPagina"
import PersonaEditar from "./pages/PersonaEditar";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      {/* Rutas */}
      <Routes>
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/personas" element={<PersonaListPage />} />
        <Route path="/editar/:id" element={<PersonaEditar />} />
      </Routes>
    </BrowserRouter>
  )
}
