import React, { useState } from 'react';
import { Link } from "react-router-dom";

interface SignUpFormData {
  username: string;
  email: string;
  password: string;
}

const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState<SignUpFormData>({
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos de registro:', formData);
  };

  return (
    <div className="min-h-screen flex font-poppins">
      {/* Columna izquierda - Rectángulo azul con imagen EXACTA como Figma */}
      <div 
        className="hidden lg:flex relative"
        style={{ 
          width: '720px', 
          height: '900px',
          background: '#0F2634'
        }}
      >
  
      </div>

      {/* Columna derecha - Formulario */}
      <div className="flex-1 flex flex-col bg-gris-50 min-h-screen">
        {/* Logo con posición exacta */}
        <div 
          className="absolute top-[58px] left-[56px]"
          style={{
            width: '106px',
            height: '64px',
            borderRadius: '16px',
            padding: '8px',
            gap: '10px'
          }}
        >
          <img 
            src="/src/assets/logo.png" 
            alt="Logo" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Formulario con posición exacta */}
        <div 
          className="absolute top-[79px] left-[450px] bg-blanco-50 rounded-2xl shadow-lg"
          style={{
            width: '539px',
            height: '741px',
            padding: '40px' // Ajusta el padding interno según el diseño
          }}
        >
          <h2 className="text-2xl font-semibold text-azul-950 mb-8 text-center">Sign Up</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Nombre de usuario */}
            <div className="flex flex-col">
              <label htmlFor="username" className="text-sm font-medium text-azul-950 mb-2">
                Nombre de usuario*
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nombre de Usuario"
                className="px-4 py-3 border border-gris-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-500 focus:border-transparent transition-all duration-300 bg-blanco-50 placeholder-gris-300 text-azul-950"
                required
              />
            </div>

            {/* Campo Email */}
            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm font-medium text-azul-950 mb-2">
                Email*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="px-4 py-3 border border-gris-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-500 focus:border-transparent transition-all duration-300 bg-blanco-50 placeholder-gris-300 text-azul-950"
                required
              />
            </div>

            {/* Campo Contraseña */}
            <div className="flex flex-col">
              <label htmlFor="password" className="text-sm font-medium text-azul-950 mb-2">
                Contraseña*
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Contraseña"
                className="px-4 py-3 border border-gris-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-500 focus:border-transparent transition-all duration-300 bg-blanco-50 placeholder-gris-300 text-azul-950"
                required
              />
            </div>

            {/* Botón Sign Up */}
            <button
              type="submit"
              className="w-full bg-verde-600 text-blanco-50 py-3 rounded-lg font-semibold hover:bg-verde-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-verde-500 focus:ring-opacity-50 shadow-md hover:shadow-lg text-base mt-4"
            >
              Sign up
            </button>
          </form>

          {/* Enlace para Sign In */}
            <p className="text-center text-azul-950 mt-6 text-sm">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-verde-600 font-semibold hover:text-verde-700 transition-colors duration-300">
                Sign In
            </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;