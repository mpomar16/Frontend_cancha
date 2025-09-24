import { Navbar } from "../../../components/Navbar";
import { useEffect, useState } from 'react';
import { obtenerEspaciosDeportivos } from '../services/EspacioDeportivoService';


export default function EspacioDeportivo() {
  const [espacios, setEspacios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const porPagina = 12;

  useEffect(() => {
    obtenerEspaciosDeportivos().then(res => {
      if (res.success) setEspacios(res.data);
      else console.error(res.message);
    });
  }, []);

  const filtrados = espacios.filter((e: any) =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.direccion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const paginados = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    
    <div className="p-0">
        <Navbar />
      {/* Buscador */}
      <div className="flex justify-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o dirección"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-80 px-4 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        <button className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-700">
          Filtrar
        </button>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {paginados.map((e: any) => (
          <div key={e.id_espacio} className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="h-36 bg-gray-300 rounded-md mb-4" />
            <h3 className="text-lg font-semibold">{e.nombre}</h3>
            <p className="text-gray-600">{e.direccion}</p>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="flex justify-center mt-8 gap-2">
        {[...Array(Math.ceil(filtrados.length / porPagina)).keys()].map(n => (
          <button
            key={n}
            onClick={() => setPagina(n + 1)}
            className={`px-3 py-1 rounded-md ${
              pagina === n + 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {n + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
