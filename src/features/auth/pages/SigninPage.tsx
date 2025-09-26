import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface SignInFormData {
  email: string;
  password: string;
}

const SignInPage: React.FC = () => {
  const [formData, setFormData] = useState<SignInFormData>({
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
    console.log('Datos de inicio de sesión:', formData);
    // Aquí conectarás con el servicio de autenticación
  };

  return (
    <div className="min-h-screen flex font-poppins relative">
      {/* Rectangle 3684 - Fondo azul con medidas exactas */}
      <div 
        className="hidden lg:block absolute"
        style={{ 
          width: '720px', 
          height: '900px',
          left: '0px',
          top: '0px',
          background: '#0F2634',
          opacity: 1
        }}
      />

      {/* Logo con posición exacta */}
      <div 
        className="absolute hidden lg:block"
        style={{
          width: '106px',
          height: '64px',
          top: '58px',
          left: '56px',
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

      {/* Contenedor del formulario con posición exacta */}
      <div 
        className="absolute hidden lg:block bg-blanco-50"
        style={{
          width: '539px',
          height: '741px',
          top: '79px',
          left: '450px',
          borderRadius: '16px',
          opacity: 1
        }}
      >
        <div className="p-8 h-full flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-azul-950 mb-8 text-center">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Solo Email y Contraseña para Sign In */}
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

            {/* Enlace "¿Olvidaste tu contraseña?" - común en Sign In */}
            <div className="text-right">
              <a href="/forgot-password" className="text-verde-600 text-sm hover:text-verde-700 transition-colors duration-300">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-verde-600 text-blanco-50 py-3 rounded-lg font-semibold hover:bg-verde-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-verde-500 focus:ring-opacity-50 shadow-md hover:shadow-lg text-base mt-4"
            >
              Sign In
            </button>
          </form>

          {/* Enlace para Sign Up */}
            <p className="text-center text-azul-950 mt-6 text-sm">
            ¿No tienes una cuenta?{' '}
            <Link to="/signup" className="text-verde-600 font-semibold hover:text-verde-700 transition-colors duration-300">
                Sign Up
            </Link>
            </p>
        </div>
      </div>

      {/* Versión responsive para móvil */}
      <div className="lg:hidden w-full flex flex-col bg-gris-50 min-h-screen">
        {/* Logo para móvil */}
        <div className="pt-6 pl-6">
          <img 
            src="/src/assets/logo.png" 
            alt="Logo" 
            style={{ width: '80px', height: '48px' }}
          />
        </div>

        {/* Formulario para móvil */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md bg-blanco-50 p-8 rounded-2xl shadow-lg border border-gris-200">
            <h2 className="text-2xl font-semibold text-azul-950 mb-8 text-center">Sign In</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col">
                <label htmlFor="email-mobile" className="text-sm font-medium text-azul-950 mb-2">
                  Email*
                </label>
                <input
                  type="email"
                  id="email-mobile"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="px-4 py-3 border border-gris-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-500 focus:border-transparent transition-all duration-300 bg-blanco-50 placeholder-gris-300 text-azul-950"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="password-mobile" className="text-sm font-medium text-azul-950 mb-2">
                  Contraseña*
                </label>
                <input
                  type="password"
                  id="password-mobile"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Contraseña"
                  className="px-4 py-3 border border-gris-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-500 focus:border-transparent transition-all duration-300 bg-blanco-50 placeholder-gris-300 text-azul-950"
                  required
                />
              </div>

              <div className="text-right">
                <a href="/forgot-password" className="text-verde-600 text-sm hover:text-verde-700 transition-colors duration-300">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-verde-600 text-blanco-50 py-3 rounded-lg font-semibold hover:bg-verde-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-verde-500 focus:ring-opacity-50 shadow-md hover:shadow-lg text-base"
              >
                Sign In
              </button>
            </form>

            <p className="text-center text-azul-950 mt-6 text-sm">
              ¿No tienes una cuenta?{' '}
              <Link to="/signup" className="text-verde-600 font-semibold hover:text-verde-700 transition-colors duration-300">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;