import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "../features/landing/pages/LandingPage";
import  EspacioDeportivo  from '../features/espacio_deportivo/pages/EspacioDeportivo';




export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
             {/* esto va en el buscador */}
      <Route path="/espacios" element={<EspacioDeportivo />} />
    </Routes>
  </BrowserRouter>
);
