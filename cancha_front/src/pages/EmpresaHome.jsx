import { useState, useEffect } from 'react';
import EmpresaBody from '../components/EmpresaBody';
import EmpresaFooter from '../components/EmpresaFooter';
import EmpresaNavbarCasual from '../components/EmpresaNavbarCasual';
import { obtenerEmpresaBody, obtenerEmpresaFooter } from '../services/empresaService';

function EmpresaHome() {
  const [bodyData, setBodyData] = useState(null);
  const [footerData, setFooterData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const bodyResponse = await obtenerEmpresaBody();
        setBodyData(bodyResponse.data);

        const footerResponse = await obtenerEmpresaFooter();
        setFooterData(footerResponse.data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar fijo */}
      <EmpresaNavbarCasual /> {/* 👈 aquí va el navbar arriba */}

      {/* Contenido principal */}
      <main className="flex-grow pt-20"> 
        {/* pt-20 para dejar espacio debajo del navbar fijo */}
        {error && <p className="text-red-500">{error}</p>}
        <EmpresaBody data={bodyData} />
      </main>

      {/* Footer */}
      <EmpresaFooter data={footerData} />
    </div>
  );
}

export default EmpresaHome;
