import { useState, useEffect } from 'react';
import EmpresaBody from '../components/EmpresaBody';
import EmpresaFooter from '../components/EmpresaFooter';
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
    <div>
      <h1 className="text-2xl font-bold mb-4">Bienvenidos a Nuestra Empresa</h1>
      {error && <p className="text-red-500">{error}</p>}
      <EmpresaBody data={bodyData} />
      <EmpresaFooter data={footerData} />
    </div>
  );
}

export default EmpresaHome;