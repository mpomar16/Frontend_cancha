/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    listarReportes,
    eliminarReporte,
} from "../services/reporteIncidenciaService";

import { FileText, Plus } from "lucide-react";
import ReporteIncidenciaFila from "../components/ReporteIncidenciaFila";
import SideBar from "../components/Sidebar";
import Paginacion from "../components/Paginacion";
import Alerta from "../components/Alerta";

function ReporteIncidenciasLista() {
    const [reportes, setReportes] = useState([]);
    const [limite, setLimite] = useState(12);
    const [desplazamiento, setDesplazamiento] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState("");

    // Confirmación de eliminación
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [reporteToDelete, setReporteToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Alertas
    const [successAlert, setSuccessAlert] = useState({ open: false, msg: "" });
    const [errorAlert, setErrorAlert] = useState({ open: false, msg: "" });

    const token = localStorage.getItem("token");
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");
    const isAdmin = Array.isArray(roles) && roles.includes("ADMINISTRADOR");
    const isEncargado = Array.isArray(roles) && roles.includes("ENCARGADO");
    const canView = isAdmin || isEncargado; // listado habilitado para ambos
    const canCreate = isAdmin || isEncargado; // crear habilitado si tu flujo lo permite
    const canDelete = isAdmin; // eliminar solo admin

    // Carga inicial y cambios de paginación
    useEffect(() => {
        async function fetchReportes() {
            try {
                const { reportes, hasMore } = await listarReportes(
                    limite,
                    desplazamiento,
                    token
                );
                setReportes(reportes);
                setHasMore(hasMore);
                setError("");
            } catch (e) {
                setError(e.message);
            }
        }
        if (canView) fetchReportes();
    }, [limite, desplazamiento, token, canView]);

    // Abrir modal de confirmación
    const pedirConfirmacionEliminar = (reporte) => {
        setReporteToDelete(reporte);
        setConfirmOpen(true);
    };

    // Confirmar y eliminar
    const confirmarEliminar = async () => {
        if (!reporteToDelete) return;
        setDeleting(true);
        try {
            await eliminarReporte(reporteToDelete.id_reporte, token);
            setReportes((prev) =>
                prev.filter((x) => x.id_reporte !== reporteToDelete.id_reporte)
            );
            setConfirmOpen(false);
            setReporteToDelete(null);
            setSuccessAlert({
                open: true,
                msg: "Reporte eliminado correctamente.",
            });
        } catch (e) {
            setErrorAlert({
                open: true,
                msg: e?.message || "No se pudo eliminar el reporte.",
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
                        <FileText className="mr-3" />
                        Reportes de Incidencia
                    </h1>

                    {canCreate && (
                        <Link
                            to="/reporte-incidencia/create"
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

                {error && <p className="text-red-600 mb-4">{error}</p>}

                {!canView && (
                    <p className="text-red-500 font-semibold">
                        Acceso restringido: Solo para administradores o encargados.
                    </p>
                )}

                {/* Tabla */}
                {canView && (
                    <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                        <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                            <table className="min-w-full leading-normal">
                                <thead>
                                    <tr>
                                        <Th>Encargado</Th>
                                        <Th>Reserva</Th>
                                        <Th>Detalle</Th>
                                        <Th>Sugerencia</Th>
                                        <Th>Detalles</Th>
                                        <Th>Acciones</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportes.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-5 py-5 bg-white text-sm text-center text-gray-500"
                                            >
                                                No hay registros
                                            </td>
                                        </tr>
                                    ) : (
                                        reportes.map((rep) => (
                                            <ReporteIncidenciaFila
                                                key={rep.id_reporte}
                                                reporte={rep}
                                                mostrarAcciones={canDelete} // solo admin puede eliminar/editar
                                                onEliminar={pedirConfirmacionEliminar}
                                                eliminando={
                                                    deleting &&
                                                    reporteToDelete?.id_reporte === rep.id_reporte
                                                }
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>

                            {/* Footer */}
                            <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
                                <span className="text-xs xs:text-sm text-gray-900">
                                    Total (página): {reportes.length}
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
                    title="¿Eliminar reporte?"
                    message={
                        reporteToDelete
                            ? `Se eliminará el reporte #${reporteToDelete.id_reporte}. Esta acción no se puede deshacer.`
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

export default ReporteIncidenciasLista;
