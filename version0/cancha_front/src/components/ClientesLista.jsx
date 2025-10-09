/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listarClientes, eliminarCliente } from "../services/clienteService";

import { User, Plus } from "lucide-react";
import ClientesFila from "../components/ClientesFila";
import SideBar from "../components/Sidebar";
import SearchClientes from "../pages/SearchClientes";
import Paginacion from "../components/Paginacion";
import Alerta from "../components/Alerta";

function ClientesLista() {
  const [clientes, setClientes] = useState([]);
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
  const [clienteToDelete, setClienteToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Alertas
  const [successAlert, setSuccessAlert] = useState({ open: false, msg: "" });
  const [errorAlert, setErrorAlert] = useState({ open: false, msg: "" });

  // Carga inicial
  useEffect(() => {
    async function fetchClientes() {
      try {
        const { clientes, hasMore } = await listarClientes(
          limite,
          desplazamiento,
          token
        );
        setClientes(clientes);
        setHasMore(hasMore);
        setError("");
      } catch (e) {
        setError(e.message);
      }
    }
    if (!hayBusqueda) fetchClientes();
  }, [limite, desplazamiento, token, hayBusqueda]);

  // Manejo de resultados del buscador
  const handleSearchResults = async (results) => {
    try {
      if (results?.limpiar) {
        const response = await listarClientes(token);
        setClientes(response?.data || []);
        setHasMore(false);
        setHayBusqueda(false);
        return;
      }

      if (results?.clientes) {
        setClientes(results.clientes);
        setHasMore(Boolean(results.hasMore));
        setHayBusqueda(false);
      } else {
        setClientes(Array.isArray(results) ? results : []);
        setHasMore(false);
        setHayBusqueda(true);
      }
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Abrir modal de confirmación
  const pedirConfirmacionEliminar = (cliente) => {
    setClienteToDelete(cliente);
    setConfirmOpen(true);
  };

  // Confirmar y eliminar
  const confirmarEliminar = async () => {
    if (!clienteToDelete) return;
    setDeleting(true);
    try {
      await eliminarCliente(clienteToDelete.id_cliente, token);
      setClientes((prev) =>
        prev.filter((x) => x.id_cliente !== clienteToDelete.id_cliente)
      );
      setConfirmOpen(false);
      setClienteToDelete(null);
      setSuccessAlert({
        open: true,
        msg: "Cliente eliminado correctamente.",
      });
    } catch (e) {
      setErrorAlert({
        open: true,
        msg: e?.message || "No se pudo eliminar el cliente.",
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
            <User className="mr-3" />
            Clientes
          </h1>

          {isAdmin && (
            <Link
              to="/cliente/create"
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
        <SearchClientes onHayBusquedaChange={setHayBusqueda} />

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
                    <Th>Correo</Th>
                    <Th>Teléfono</Th>
                    <Th>Estado</Th>
                    <Th>Acciones</Th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-5 bg-white text-sm text-center text-gray-500"
                      >
                        No hay registros
                      </td>
                    </tr>
                  ) : (
                    clientes.map((cliente) => (
                      <ClientesFila
                        key={cliente.id_cliente}
                        cliente={cliente}
                        mostrarAcciones
                        onEliminar={pedirConfirmacionEliminar}
                        eliminando={
                          deleting &&
                          clienteToDelete?.id_cliente === cliente.id_cliente
                        }
                      />
                    ))
                  )}
                </tbody>
              </table>

              {/* Footer */}
              <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
                <span className="text-xs xs:text-sm text-gray-900">
                  Total: {clientes.length}
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
          title="¿Eliminar cliente?"
          message={
            clienteToDelete
              ? `Se eliminará al cliente "${clienteToDelete.nombre} ${clienteToDelete.apellido}". Esta acción no se puede deshacer.`
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

export default ClientesLista;
