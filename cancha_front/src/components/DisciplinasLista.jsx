/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  listarDisciplinas,
  eliminarDisciplina,
} from "../services/disciplinaService";

import { Dumbbell, Plus } from "lucide-react";
import DisciplinaFila from "../components/DisciplinaFila";
import SideBar from "../components/Sidebar";
import SearchDisciplinas from "../pages/SearchDisciplinas";
import Paginacion from "../components/Paginacion";
import Alerta from "../components/Alerta";

function DisciplinasLista() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [limite, setLimite] = useState(12);
  const [desplazamiento, setDesplazamiento] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [hayBusqueda, setHayBusqueda] = useState(false);

  const token = localStorage.getItem("token");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdmin = Array.isArray(roles) && roles.includes("ADMINISTRADOR");
  const isLoggedIn = !!token;

  // Estado para eliminar con confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disciplinaToDelete, setDisciplinaToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Alertas inline
  const [successAlert, setSuccessAlert] = useState({ open: false, msg: "" });
  const [errorAlert, setErrorAlert] = useState({ open: false, msg: "" });

  // Carga inicial y cuando cambian paginación o cuando NO hay búsqueda activa
  useEffect(() => {
    async function fetchDisciplinas() {
      try {
        const response = await listarDisciplinas(token);
        setDisciplinas(response?.data || []);
        setHasMore(false);
      } catch (err) {
        setError(err.message);
      }
    }
    if (!hayBusqueda) {
      fetchDisciplinas();
    }
  }, [limite, desplazamiento, hayBusqueda, token]);

  // === Resultados desde el buscador ===
  const handleSearchResults = async (results) => {
    try {
      // Si el buscador pidió limpiar, recargamos lista general
      if (results?.limpiar) {
        const response = await listarDisciplinas(token);
        setDisciplinas(response?.data || []);
        setHasMore(false);
        setHayBusqueda(false);
        return;
      }

      // Caso normal: resultados del buscador
      setDisciplinas(Array.isArray(results) ? results : []);
      setHasMore(false);
      setHayBusqueda(true);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // === Eliminar disciplina ===
  const pedirConfirmacionEliminar = (disciplina) => {
    setDisciplinaToDelete(disciplina);
    setConfirmOpen(true);
  };

  const confirmarEliminar = async () => {
    if (!disciplinaToDelete) return;
    setDeleting(true);
    try {
      await eliminarDisciplina(disciplinaToDelete.id_disciplina, token);
      // Actualiza lista local
      setDisciplinas((prev) =>
        prev.filter((x) => x.id_disciplina !== disciplinaToDelete.id_disciplina)
      );

      // Refresca si no hay búsqueda activa
      if (!hayBusqueda) {
        const response = await listarDisciplinas(token);
        setDisciplinas(response?.data || []);
      }

      setConfirmOpen(false);
      setDisciplinaToDelete(null);
      setSuccessAlert({
        open: true,
        msg: "La disciplina fue eliminada correctamente.",
      });
    } catch (e) {
      setErrorAlert({
        open: true,
        msg: e?.message || "No se pudo eliminar la disciplina.",
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
            <Dumbbell className="mr-3" />
            Disciplinas deportivas
          </h1>

          {isAdmin && (
            <Link
              to="/disciplina/create"
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
        <SearchDisciplinas onSearchResults={handleSearchResults} />

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {!isAdmin && (
          <p className="text-red-500 font-semibold">
            Acceso restringido: Solo para administradores
          </p>
        )}

        {/* === Tabla principal (igual que en EspaciosLista) === */}
        {isAdmin && !hayBusqueda && (
          <>
            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
              <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <Th>Nombre</Th>
                      <Th>Descripción</Th>
                      <Th>Acciones</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {disciplinas.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-5 py-5 bg-white text-sm text-center text-gray-500"
                        >
                          No hay registros
                        </td>
                      </tr>
                    ) : (
                      disciplinas.map((disciplina) => (
                        <DisciplinaFila
                          key={disciplina.id_disciplina}
                          disciplina={disciplina}
                          mostrarAcciones
                          onEliminar={pedirConfirmacionEliminar}
                          eliminando={
                            deleting &&
                            disciplinaToDelete?.id_disciplina === disciplina.id_disciplina
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
                    {disciplinas.length > 0
                      ? `${desplazamiento + 1} a ${desplazamiento + disciplinas.length}`
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
          title="¿Eliminar disciplina?"
          message={
            disciplinaToDelete
              ? `Se eliminará "${disciplinaToDelete.nombre}". Esta acción no se puede deshacer.`
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

export default DisciplinasLista;
