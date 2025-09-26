import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "../features/landing/pages/LandingPage";
import EspacioDeportivo from '../features/espacio_deportivo/pages/EspacioDeportivo';
import SignUpPage from '../features/auth/pages/SignupPage'; // Asegúrate de que la ruta de importación sea correcta
import SignInPage from '../features/auth/pages/SigninPage';
export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/espacios" element={<EspacioDeportivo />} />
      <Route path="/signup" element={<SignUpPage />} /> 
      <Route path="/login" element={<SignInPage />} />
    </Routes>
  </BrowserRouter>
);