import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "../features/landing/pages/LandingPage";
import  EspacioDeportivo  from '../features/espacio_deportivo/pages/EspacioDeportivo';
import Signin from "../features/auth/pages/Signin";



export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/espacios" element={<EspacioDeportivo />} />
      <Route path="/signin" element={<Signin />} />
    </Routes>
  </BrowserRouter>
);
