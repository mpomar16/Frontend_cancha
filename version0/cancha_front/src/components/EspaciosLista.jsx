// pages/EspaciosLista.jsx
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  listarEspacios,
  listarEspaciosGeneral,
  crearEspacio,
  eliminarEspacio,
} from "../services/espacioService";

import { MapPinned, Plus } from "lucide-react";
import EspacioFila from "../components/EspacioFila";
import SideBar from "../components/Sidebar";
import SearchEspacios from "../pages/SearchEspacios";
import Paginacion from "../components/Paginacion";
import Alerta from "../components/Alerta";

function EspaciosLista() {
  const [espacios, setEspacios] = useState([]);
  const [limite, setLimite] = useState(12);
  const [desplazamiento, setDesplazamiento] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [hayBusqueda, setHayBusqueda] = useState(false);

  const token = localStorage.getItem("token");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdmin = Array.isArray(roles) && roles.includes("ADMINISTRADOR");
  const isLoggedIn = !!token;

  // estado para eliminar con confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [espacioToDelete, setEspacioToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // alerts inline
  const [successAlert, setSuccessAlert] = useState({ open: false, msg: "" });
  const [errorAlert, setErrorAlert] = useState({ open: false, msg: "" });

  // Carga inicial y cuando cambian paginación/rol o cuando NO hay búsqueda activa
  useEffect(() => {
    async function fetchEspacios() {
      try {
        const response = isLoggedIn
          ? await listarEspacios(limite, desplazamiento)
          : await listarEspaciosGeneral(limite, desplazamiento);

        // listarEspacios* -> { espacios, hasMore }
        setEspacios(response?.data?.espacios || []);
        setHasMore(Boolean(response?.data?.hasMore));
      } catch (err) {
        setError(err.message);
      }
    }
    if (!hayBusqueda) {
      fetchEspacios();
    }
  }, [limite, desplazamiento, isLoggedIn, hayBusqueda]);

  const handleSearchResults = async (results) => {
  try {
    // Si el buscador pidió limpiar, recargamos lista general
    if (results?.limpiar) {
      const response = isLoggedIn
        ? await listarEspacios(limite, desplazamiento)
        : await listarEspaciosGeneral(limite, desplazamiento);

      setEspacios(response?.data?.espacios || []);
      setHasMore(Boolean(response?.data?.hasMore));
      setHayBusqueda(false);
      return;
    }

    // Caso normal: búsqueda o listado desde servicio
    if (results?.espacios) {
      setEspacios(results.espacios);
      setHasMore(Boolean(results.hasMore));
      setHayBusqueda(false);
    } else {
      setEspacios(Array.isArray(results) ? results : []);
      setHasMore(false);
      setHayBusqueda(true);
    }
    setError("");
  } catch (err) {
    setError(err.message);
  }
};



  // Crear Espacio (si usas modal/forma aparte)
  // const [openModal, setOpenModal] = useState(false);
  async function handleCreate(formData) {
    try {
      await crearEspacio(formData, token);
      setSuccessAlert({ open: true, msg: "Espacio creado correctamente." });
      // Refresca la página actual
      const response = isLoggedIn
        ? await listarEspacios(limite, desplazamiento)
        : await listarEspaciosGeneral(limite, desplazamiento);
      setEspacios(response?.data?.espacios || []);
      setHasMore(Boolean(response?.data?.hasMore));
      // setOpenModal(false);
    } catch (err) {
      setErrorAlert({
        open: true,
        msg: err?.message || "No se pudo crear el espacio.",
      });
    }
  }

  // Abrir modal de confirmación
  const pedirConfirmacionEliminar = (esp) => {
    setEspacioToDelete(esp);
    setConfirmOpen(true);
  };

  // Confirmar y eliminar
  const confirmarEliminar = async () => {
    if (!espacioToDelete) return;
    setDeleting(true);
    try {
      await eliminarEspacio(espacioToDelete.id_espacio, token);

      // Actualiza lista local
      setEspacios((prev) =>
        prev.filter((x) => x.id_espacio !== espacioToDelete.id_espacio)
      );

      // Opcional: “rellenar” la página llamando a listar* de nuevo si no hay búsqueda
      if (!hayBusqueda) {
        const resp = isLoggedIn
          ? await listarEspacios(limite, desplazamiento)
          : await listarEspaciosGeneral(limite, desplazamiento);
        setEspacios(resp?.data?.espacios || []);
        setHasMore(Boolean(resp?.data?.hasMore));
      }

      setConfirmOpen(false);
      setEspacioToDelete(null);
      setSuccessAlert({
        open: true,
        msg: "El espacio fue eliminado correctamente.",
      });
    } catch (e) {
      setErrorAlert({
        open: true,
        msg: e?.message || "No se pudo eliminar el espacio.",
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
            <MapPinned className="mr-3" />
            Espacios deportivos
          </h1>

          {isAdmin && (
            <Link
              to="/espacio/create"
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
        <SearchEspacios onSearchResults={handleSearchResults} />

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {!isAdmin && (
          <p className="text-red-500 font-semibold">
            Acceso restringido: Solo para administradores
          </p>
        )}

        {/* Tabla — Solo cuando no hay búsqueda (igual que PersonasLista) */}
        {isAdmin && !hayBusqueda && (
          <>
            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
              <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <Th>Nombre</Th>
                      <Th>Dirección</Th>
                      <Th>Descripción</Th>
                      <Th>Horario</Th>
                      <Th>Detalles</Th>
                      <Th>Acciones</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {espacios.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-5 bg-white text-sm text-center text-gray-500"
                        >
                          No hay registros
                        </td>
                      </tr>
                    ) : (
                      espacios.map((espacio) => (
                        <EspacioFila
                          key={espacio.id_espacio}
                          espacio={espacio}
                          mostrarAcciones
                          onEliminar={pedirConfirmacionEliminar}
                          eliminando={
                            deleting &&
                            espacioToDelete?.id_espacio === espacio.id_espacio
                          }
                        />
                      ))
                    )}
                  </tbody>
                </table>

                {/* Footer con paginación */}
                <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
                  <span className="text-xs xs:text-sm text-gray-900">
                    Mostrando{" "}
                    {espacios.length > 0
                      ? `${desplazamiento + 1} a ${desplazamiento + espacios.length}`
                      : 0}
                  </span>

                  <div className="inline-flex mt-2 xs:mt-0">
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
            </div>
          </>
        )}

        {/* Modal de confirmación de eliminación */}
        <Alerta
          open={confirmOpen}
          onClose={() => !deleting && setConfirmOpen(false)}
          variant="confirm"
          title="¿Eliminar espacio?"
          message={
            espacioToDelete
              ? `Se eliminará "${espacioToDelete.nombre}". Esta acción no se puede deshacer.`
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

export default EspaciosLista;
