import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

import Usuario           from './pages/Usuario';
import Administrador     from './pages/Administrador';
import Cliente           from './pages/Cliente';
import Admin_Esp_Dep     from './pages/Admin_Esp_Dep';
import Deportista        from './pages/Deportista';
import Control           from './pages/Control';
import Encargado         from './pages/Encargado';
import Empresa           from './pages/Empresa';
import Espacio_Deportivo from './pages/Espacio_Deportivo';
import Cancha             from './pages/Cancha';
import Disciplina         from './pages/Disciplina';
import Reserva            from './pages/Reserva';
import Reserva_Horario    from './pages/Reserva_Horario';
import Pago               from './pages/Pago';
import QR_Reserva         from './pages/QR_Reserva';
import Reporte_Incidencia from './pages/Reporte_Incidencia';
import Resena             from './pages/Resena';
import Se_Practica        from './pages/Se_Practica';
import Participa_En       from './pages/Participa_En';

// Centralized routes configuration
const routesConfig = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/', component: Dashboard },
  { id: 'usuario', label: 'Usuario', icon: '👤', path: '/usuario', component: Usuario },
  { id: 'administrador', label: 'Administrador', icon: '👤', path: '/administrador', component: Administrador },
  { id: 'cliente', label: 'Cliente', icon: '💼', path: '/cliente', component: Cliente },
  { id: 'admin_esp_dep', label: 'Admin Esp Dep', icon: '⚙️', path: '/admin-esp-dep', component: Admin_Esp_Dep },
  { id: 'deportista', label: 'Deportista', icon: '🏃', path: '/deportista', component: Deportista },
  { id: 'control', label: 'Control', icon: '🎮', path: '/control', component: Control },
  { id: 'encargado', label: 'Encargado', icon: '👨‍💼', path: '/encargado', component: Encargado },
  { id: 'empresa', label: 'Empresa', icon: '🏢', path: '/empresa', component: Empresa },
  { id: 'espacio_deportivo', label: 'Espacio Deportivo', icon: '🏟️', path: '/espacio-deportivo', component: Espacio_Deportivo },
  { id: 'cancha', label: 'Cancha', icon: '🎾', path: '/cancha', component: Cancha },
  { id: 'disciplina', label: 'Disciplina', icon: '🥋', path: '/disciplina', component: Disciplina },
  { id: 'reserva', label: 'Reserva', icon: '📅', path: '/reserva', component: Reserva },
  { id: 'reserva_horario', label: 'Reserva Horario', icon: '⏰', path: '/reserva-horario', component: Reserva_Horario },
  { id: 'pago', label: 'Pago', icon: '💳', path: '/pago', component: Pago },
  { id: 'qr_reserva', label: 'QR Reserva', icon: '📱', path: '/qr-reserva', component: QR_Reserva },
  { id: 'reporte_incidencia', label: 'Reporte Incidencia', icon: '⚠️', path: '/reporte-incidencia', component: Reporte_Incidencia },
  { id: 'resena', label: 'Reseña', icon: '⭐', path: '/resena', component: Resena },
  { id: 'se_practica', label: 'Se Practica', icon: '🏸', path: '/se-practica', component: Se_Practica },
  { id: 'participa_en', label: 'Participa En', icon: '👥', path: '/participa-en', component: Participa_En },
]

const Header = ({ title }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </div>
    </header>
  );
};

const Sidebar = ({ onPageChange, currentPage }) => {
  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800">Mi App</h1>
      </div>
      <nav className="mt-6">
        {routesConfig.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            onClick={() => onPageChange(item.id, item.label)}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors duration-200 ${
              currentPage === item.id
                ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg mr-3">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageTitle, setPageTitle] = useState('Dashboard');

  const handlePageChange = (page, title) => {
    setCurrentPage(page);
    setPageTitle(title);
  };

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar onPageChange={handlePageChange} currentPage={currentPage} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={pageTitle} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            <Routes>
              {routesConfig.map((route) => (
                <Route
                  key={route.id}
                  path={route.path}
                  element={<route.component />}
                />
              ))}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;