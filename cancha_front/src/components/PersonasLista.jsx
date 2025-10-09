// pages/PersonasList.jsx
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listarPersonas, eliminarPersona } from "../services/personaService";
import { Users, Plus } from "lucide-react";
import PersonaFila from "./PersonaFila";
import SideBar from "./Sidebar";
import SearchPersonas from "../pages/SearchPersonas";
import Paginacion from "./Paginacion";
import Alerta from "./Alerta";

function PersonasLista() {
  const [personas, setPersonas] = useState([]);
  const [limite, setLimite] = useState(12);
  const [desplazamiento, setDesplazamiento] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [hayBusqueda, setHayBusqueda] = useState(false);

  const token = localStorage.getItem("token");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdmin = roles.includes("ADMINISTRADOR");

  // estado para eliminar con confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // alerts inline
  const [successAlert, setSuccessAlert] = useState({ open: false, msg: "" });
  const [errorAlert, setErrorAlert] = useState({ open: false, msg: "" });

  useEffect(() => {
    async function fetchPersonas() {
      try {
        const response = await listarPersonas(limite, desplazamiento, token);
        setPersonas(response.data.personas || []);
        setHasMore(Boolean(response.data.hasMore));
      } catch (err) {
        setError(err.message);
      }
    }
    if (isAdmin && !hayBusqueda) {
      fetchPersonas();
    }
  }, [limite, desplazamiento, token, isAdmin, hayBusqueda]);

  // editar (si quieres, puedes cambiar a useNavigate en vez de window.location)
  const handleEditar = (p) => {
    window.location.href = `/persona/${p.id_persona}/editar`;
  };

  // abrir modal de confirmación
  const pedirConfirmacionEliminar = (p) => {
    setPersonToDelete(p);
    setConfirmOpen(true);
  };

  // confirmar y eliminar
  const confirmarEliminar = async () => {
    if (!personToDelete) return;
    setDeleting(true);
    try {
      await eliminarPersona(personToDelete.id_persona, token);

      // actualizar lista actual (sin recargar toda la app)
      setPersonas((prev) =>
        prev.filter((x) => x.id_persona !== personToDelete.id_persona)
      );

      // opcional: “rellenar” la página llamando de nuevo a listar
      const resp = await listarPersonas(limite, desplazamiento, token);
      setPersonas(resp.data.personas || []);
      setHasMore(Boolean(resp.data.hasMore));

      setConfirmOpen(false);
      setPersonToDelete(null);
      setSuccessAlert({
        open: true,
        msg: "La persona fue eliminada correctamente.",
      });
    } catch (e) {
      setErrorAlert({
        open: true,
        msg: e?.message || "No se pudo eliminar la persona.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SideBar>
      <main className="flex-1 p-8">
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="flex items-center text-2xl font-poppins font-bold text-azul-950">
            <Users className="mr-3" />
            Personas
          </h1>
          {isAdmin && (
            <Link
              to="/persona/create"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto h-10 px-2 sm:px-5 rounded-lg bg-verde-600 text-white font-medium hover:bg-verde-700 active:scale-[0.99] transition"
            >
              <Plus className="w-4 h-4" />
              <span className="sm:inline">Añadir</span>
            </Link>
          )}
        </div>

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

        <SearchPersonas onHayBusquedaChange={setHayBusqueda} />

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {!isAdmin && (
          <p className="text-red-500 font-semibold">
            Acceso restringido: Solo para administradores
          </p>
        )}

        {isAdmin && !hayBusqueda && (
          <>
            {/* === Contenedor responsivo y estilos del snippet === */}
            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
              <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                <table className="bg-verde-600 min-w-full leading-normal">
                  <thead>
                    <tr>
                      <Th>Foto</Th>
                      <Th>Nombre</Th>
                      <Th>Correo</Th>
                      <Th>Usuario</Th>
                      <Th>Teléfono</Th>
                      <Th>Sexo</Th>
                      <Th>Acciones</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {personas.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-5 bg-white text-sm text-center text-gray-500"
                        >
                          No hay registros
                        </td>
                      </tr>
                    ) : (
                      personas.map((persona) => (
                        <PersonaFila
                          key={persona.id_persona}
                          persona={persona}
                          onEditar={handleEditar}
                          onEliminar={pedirConfirmacionEliminar} // 👈 abre modal
                          eliminando={deleting && personToDelete?.id_persona === persona.id_persona}
                          mostrarAcciones
                        />
                      ))
                    )}
                  </tbody>
                </table>

                {/* Footer con estilo del snippet */}
                <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
                  <span className="text-xs xs:text-sm text-gray-900">
                    Mostrando{" "}
                    {personas.length > 0
                      ? `${desplazamiento + 1} a ${desplazamiento + personas.length}`
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
          title="¿Eliminar persona?"
          message={
            personToDelete
              ? `Se eliminará a "${personToDelete.nombre} ${personToDelete.apellido}". Esta acción no se puede deshacer.`
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

export default PersonasLista;
