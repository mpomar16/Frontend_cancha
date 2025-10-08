/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  listarEncargados,
  eliminarEncargado,
} from "../services/encargadoService";

import { UserCog, Plus } from "lucide-react";
import EncargadoFila from "../components/EncargadoFila";
import SideBar from "../components/Sidebar";
import SearchEncargados from "../pages/SearchEncargados";
import Paginacion from "../components/Paginacion";
import Alerta from "../components/Alerta";

function EncargadosLista() {
  const [encargados, setEncargados] = useState([]);
  const [limite, setLimite] = useState(12);
  const [desplazamiento, setDesplazamiento] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [hayBusqueda, setHayBusqueda] = useState(false);

  const token = localStorage.getItem("token");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdmin = Array.isArray(roles) && roles.includes("ADMINISTRADOR");

  // Estado para eliminar con confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [encargadoToDelete, setEncargadoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Alertas
  const [successAlert, setSuccessAlert] = useState({ open: false, msg: "" });
  const [errorAlert, setErrorAlert] = useState({ open: false, msg: "" });

  // Carga inicial
  useEffect(() => {
  async function fetchEncargados() {
    try {
      const { encargados, hasMore } = await listarEncargados(limite, desplazamiento, token);
      setEncargados(encargados);
      setHasMore(hasMore);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  if (!hayBusqueda) fetchEncargados();
}, [limite, desplazamiento, token, hayBusqueda]);


  // Manejo de resultados del buscador
  const handleSearchResults = async (results) => {
    try {
      if (results?.limpiar) {
        const response = await listarEncargados(token);
        setEncargados(response?.data || []);
        setHasMore(false);
        setHayBusqueda(false);
        return;
      }

      if (results?.encargados) {
        setEncargados(results.encargados);
        setHasMore(Boolean(results.hasMore));
        setHayBusqueda(false);
      } else {
        setEncargados(Array.isArray(results) ? results : []);
        setHasMore(false);
        setHayBusqueda(true);
      }
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Abrir modal de confirmación
  const pedirConfirmacionEliminar = (encargado) => {
    setEncargadoToDelete(encargado);
    setConfirmOpen(true);
  };

  // Confirmar y eliminar
  const confirmarEliminar = async () => {
    if (!encargadoToDelete) return;
    setDeleting(true);
    try {
      await eliminarEncargado(encargadoToDelete.id_encargado, token);
      setEncargados((prev) =>
        prev.filter((x) => x.id_encargado !== encargadoToDelete.id_encargado)
      );
      setConfirmOpen(false);
      setEncargadoToDelete(null);
      setSuccessAlert({
        open: true,
        msg: "Encargado eliminado correctamente.",
      });
    } catch (e) {
      setErrorAlert({
        open: true,
        msg: e?.message || "No se pudo eliminar el encargado.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SideBar>
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="flex items-center text-2xl font-poppins font-bold text-azul-950">
            <UserCog className="mr-3" />
            Encargados
          </h1>

          {isAdmin && (
            <Link
              to="/encargado/create"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto h-10 px-2 sm:px-5 rounded-lg bg-verde-600 text-white font-medium hover:bg-verde-700 active:scale-[0.99] transition"
            >
              <Plus className="w-4 h-4" />
              <span className="sm:inline">Añadir</span>
            </Link>
          )}
        </div>

        {/* Alertas */}
        {successAlert.open && (
          <div className="mb-3">
            <Alerta
              open
              display="inline"
              variant="success"
              title="Operación exitosa"
              message={successAlert.msg}
              onClose={() => setSuccessAlert({ open: false, msg: "" })}
            />
          </div>
        )}
        {errorAlert.open && (
          <div className="mb-3">
            <Alerta
              open
              display="inline"
              variant="error"
              title="Ocurrió un error"
              message={errorAlert.msg}
              onClose={() => setErrorAlert({ open: false, msg: "" })}
            />
          </div>
        )}

        {/* Buscador */}
        <SearchEncargados onHayBusquedaChange={setHayBusqueda} />

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {!isAdmin && (
          <p className="text-red-500 font-semibold">
            Acceso restringido: Solo para administradores
          </p>
        )}

        {/* Tabla */}
        {isAdmin && !hayBusqueda && (
          <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
            <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    <Th>Foto</Th>
                    <Th>Nombre Completo</Th>
                    <Th>Responsabilidad</Th>
                    <Th>Fecha Inicio</Th>
                    <Th>Horario</Th>
                    <Th>Estado</Th>
                    <Th>Detalles</Th>
                    <Th>Acciones</Th>
                  </tr>
                </thead>
                <tbody>
                  {encargados.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-5 bg-white text-sm text-center text-gray-500"
                      >
                        No hay registros
                      </td>
                    </tr>
                  ) : (
                    encargados.map((encargado) => (
                      <EncargadoFila
                        key={encargado.id_encargado}
                        encargado={encargado}
                        mostrarAcciones
                        onEliminar={pedirConfirmacionEliminar}
                        eliminando={
                          deleting &&
                          encargadoToDelete?.id_encargado === encargado.id_encargado
                        }
                      />
                    ))
                  )}
                </tbody>
              </table>

              {/* Footer */}
              <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
                <span className="text-xs xs:text-sm text-gray-900">
                  Total: {encargados.length}
                </span>

                <Paginacion
                  limite={limite}
                  desplazamiento={desplazamiento}
                  onCambiarDesplazamiento={setDesplazamiento}
                  onCambiarLimite={(n) => {
                    setLimite(n);
                    setDesplazamiento(0);
                  }}
                  totalRegistros={null}
                  hasMore={hasMore}
                  opcionesLimite={[6, 12, 24, 48]}
                />
              </div>
            </div>
          </div>
        )}

        {/* Confirmar eliminación */}
        <Alerta
          open={confirmOpen}
          onClose={() => !deleting && setConfirmOpen(false)}
          variant="confirm"
          title="¿Eliminar encargado?"
          message={
            encargadoToDelete
              ? `Se eliminará al encargado "${encargadoToDelete.nombre} ${encargadoToDelete.apellido}". Esta acción no se puede deshacer.`
              : ""
          }
          primaryAction={{
            label: "Eliminar",
            onClick: confirmarEliminar,
            loading: deleting,
          }}
          secondaryAction={{
            label: "Cancelar",
            onClick: () => setConfirmOpen(false),
          }}
        />
      </main>
    </SideBar>
  );
}

function Th({ children }) {
  return (
    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
      {children}
    </th>
  );
}

export default EncargadosLista;
