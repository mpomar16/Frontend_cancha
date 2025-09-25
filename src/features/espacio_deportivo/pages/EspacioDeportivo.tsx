/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navbar } from "../../../components/Navbar";
import { useEffect, useState } from 'react';
import { obtenerEspaciosDeportivos, obtenerEspaciosPorDisciplina } from '../services/EspacioDeportivoService';
import { Footer } from "../../../components/Footer";
import { Funnel, Search } from 'lucide-react';

export default function EspacioDeportivo() {
  const [espacios, setEspacios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [modalMensaje, setModalMensaje] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const porPagina = 12;

  useEffect(() => {
    obtenerEspaciosDeportivos().then(res => {
      if (res.success) setEspacios(res.data);
      else console.error(res.message);
    });
  }, []);

  const filtrarPorDisciplina = (idDisciplina: number) => {
    obtenerEspaciosPorDisciplina(idDisciplina).then(res => {
      if (res.success) {
        setEspacios(res.data);
        setPagina(1);
        setMostrarFiltro(false);

        if (res.data.length === 0) {
          setModalMensaje("No se encontraron espacios deportivos");
          setMostrarModal(true);
        }
      } else {
        setModalMensaje("No se encontraron espacios deportivos");
        setMostrarModal(true);
      }
    });
  };

  const filtrados = espacios.filter((e: any) =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.direccion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const paginados = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <>
      <div className="pt-30 px-6 font-poppins">
        <Navbar />

        {/* Buscador y botón filtro */}
        <div className="flex justify-center gap-4 mb-6 relative">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-300" size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre o dirección"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gris-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-azul-950"
            />
          </div>


          <div className="relative">
            <button
              onClick={() => setMostrarFiltro(!mostrarFiltro)}
              className="flex items-center gap-2 px-4 py-2 bg-azul-950 hover:bg-azul-900 text-blanco-50 rounded-md font-semibold text-sm "
            >
              <Funnel className="text-blanco-50" size={16} />
              <span>Filtrar</span>
            </button>


            {mostrarFiltro && (
              <div className="absolute top-full mt-1 left-0 bg-blanco-50 border border-gris-200 rounded-md shadow-lg w-56 p-4 z-10">
                <h3 className="font-bold text-azul-950 mb-2">DISCIPLINAS</h3>
                <ul className="space-y-2">
                  <li className="cursor-pointer text-azul-900 hover:text-verde-600 font-medium" onClick={() => {
                    obtenerEspaciosDeportivos().then(res => {
                      if (res.success) setEspacios(res.data);
                      setPagina(1);
                      setMostrarFiltro(false);
                    });
                  }}>TODOS</li>
                  <li className="cursor-pointer text-azul-900 hover:text-verde-600 font-medium" onClick={() => filtrarPorDisciplina(1)}>Tenis</li>
                  <li className="cursor-pointer text-azul-900 hover:text-verde-600 font-medium" onClick={() => filtrarPorDisciplina(2)}>Futbol</li>
                  <li className="cursor-pointer text-azul-900 hover:text-verde-600 font-medium" onClick={() => filtrarPorDisciplina(3)}>Vóley</li>
                  <li className="cursor-pointer text-azul-900 hover:text-verde-600 font-medium" onClick={() => filtrarPorDisciplina(4)}>Baloncesto</li>
                  <li className="cursor-pointer text-azul-900 hover:text-verde-600 font-medium" onClick={() => filtrarPorDisciplina(5)}>Atletismo</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Grid de tarjetas */}
        {paginados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {paginados.map((e: any) => (
              <div key={e.id_espacio} className="bg-blanco-50 rounded-lg shadow-md p-4 text-center">
                {/* Imagen del espacio */}
                <div className="h-36 mb-4">
                  {e.imagen_principal ? (
                    <img
                      src={e.imagen_principal}
                      alt={e.nombre}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <div className="h-full bg-gris-300 rounded-md" />
                  )}
                </div>

                <h3 className="text-lg font-semibold">{e.nombre}</h3>
                <p className="text-azul-950">{e.direccion}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-azul-900 font-semibold mt-8">
            No se encuentran espacios deportivos
          </p>
        )}

        {/* Paginación */}
        <div className="flex justify-center mt-8 gap-2">
          {[...Array(Math.ceil(filtrados.length / porPagina)).keys()].map(n => (
            <button
              key={n}
              onClick={() => setPagina(n + 1)}
              className={`px-3 py-1 rounded-md ${pagina === n + 1 ? 'bg-verde-600 text-blanco-50' : 'bg-gris-200 text-azul-900'} font-medium`}
            >
              {n + 1}
            </button>
          ))}
        </div>

        {/* Modal emergente */}
        {mostrarModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-blanco-50 rounded-lg p-6 w-80 text-center shadow-lg pointer-events-auto font-medium">
              <p className="mb-4 font-semibold">{modalMensaje}</p>
              <button
                className="px-4 py-2 bg-verde-600 text-blanco-50 rounded hover:bg-green-500 font-semibold"
                onClick={() => setMostrarModal(false)}
              >
                Aceptar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer separado y ancho completo */}
      <section id="contactos" className="mt-5 w-full">
        <Footer />
      </section>
    </>
  );
}
