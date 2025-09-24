import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "../features/landing/pages/LandingPage";

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
    </Routes>
  </BrowserRouter>
);
