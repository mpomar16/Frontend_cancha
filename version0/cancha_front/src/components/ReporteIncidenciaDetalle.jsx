// src/pages/ReporteIncidenciaDetalle.jsx
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import SideBar from "../components/Sidebar";
import Alerta from "../components/Alerta";

import {
  obtenerReportePorId,
  obtenerReservaDeReporte,
} from "../services/reporteIncidenciaService";

import { ArrowLeft, ArrowRight, FileText, User, Volleyball } from "lucide-react";

export default function ReporteIncidenciaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const idReporte = Number(id);

  const token = localStorage.getItem("token");

  const [reporte, setReporte] = useState(null);
  const [reserva, setReserva] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorAlert, setErrorAlert] = useState({ open: false, msg: "" });

  useEffect(() => {
    async function fetchData() {
      try {
        setCargando(true);

        // 1) Reporte base (puede traer nombres si ya los agregaste en el backend)
        const repRes = await obtenerReportePorId(idReporte, token);
        const repData = repRes?.data ?? repRes;
        setReporte(repData || null);

        // 2) Reserva asociada (para id_cliente / id_cancha)
        const resRes = await obtenerReservaDeReporte(idReporte, token);
        const resData = resRes?.data ?? resRes;
        setReserva(resData || null);

        setErrorAlert({ open: false, msg: "" });
      } catch (err) {
        setErrorAlert({
          open: true,
          msg: err?.message || "No se pudo cargar el reporte.",
        });
      } finally {
        setCargando(false);
      }
    }

    if (Number.isInteger(idReporte)) fetchData();
  }, [idReporte, token]);

  // IDs (para los links)
  const id_encargado = reporte?.id_encargado ?? null;
  const id_reserva = reporte?.id_reserva ?? null;
  const id_cliente = reserva?.id_cliente ?? null;
  const id_cancha = reserva?.id_cancha ?? null;

  // Nombres “bonitos” (si el backend ya los envía; de lo contrario, se mostrará "—")
  const nombreEncargado = (reporte?.nombre_encargado ?? "").trim() || "—";
  const nombreCliente = (reporte?.nombre_cliente ?? "").trim() || "—";
  const nombreCancha = (reporte?.nombre_cancha ?? "").trim() || "—";

  const detalleMostrar = (reporte?.detalle ?? "").trim() || "—";
  const sugerenciaMostrar = (reporte?.sugerencia ?? "").trim() || "—";

  return (
    <SideBar>
      <main className="flex-1 p-6 sm:p-8 space-y-8">
        {/* ======= HEADER ======= */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/reporte-incidencias")}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
            >
              <ArrowLeft size={16} /> Volver
            </button>
            <h1 className="flex items-center text-2xl font-poppins font-bold text-azul-950">
              <FileText className="mr-2" />
              {`Reporte de Incidencia #${idReporte || "—"}`}
            </h1>
          </div>
        </header>

        {/* ======= ALERTA ======= */}
        {errorAlert.open && (
          <Alerta
            open
            display="inline"
            variant="error"
            title="Ocurrió un error"
            message={errorAlert.msg}
            onClose={() => setErrorAlert({ open: false, msg: "" })}
          />
        )}

        {/* ======= CONTENIDO ======= */}
        {cargando ? (
          <p className="text-sm text-gray-600">Cargando...</p>
        ) : !reporte ? (
          <p className="text-sm text-gray-600">No se encontró el reporte.</p>
        ) : (
          <>
            {/* ======= INFORMACIÓN GENERAL ======= */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow p-5 sm:p-6">
              <h2 className="text-lg font-bold text-azul-950 mb-4">Información General</h2>

              <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
                {/* Encargado (nombre completo, link) */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                  <h3 className="text-sm uppercase tracking-wide text-verde-600 mb-1">Encargado</h3>
                  {id_encargado && nombreEncargado !== "—" ? (
                    <Link
                      to={`/encargado/${id_encargado}`}
                      className="inline-flex items-center gap-2 text-azul-900 hover:underline font-semibold"
                      title="Ver detalle del encargado"
                    >
                      <User className="w-4 h-4" />
                      {nombreEncargado}
                    </Link>
                  ) : (
                    <p className="text-base text-gray-600">—</p>
                  )}
                </div>

                {/* Reserva (solo “Ir a Reserva →”, sin ID visible) */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                  <h3 className="text-sm uppercase tracking-wide text-verde-600 mb-1">Reserva</h3>
                  {id_reserva ? (
                    <Link
                      to={`/reserva/${id_reserva}`}
                      className="inline-flex items-center gap-2 text-azul-900 hover:underline font-semibold"
                      title="Ver detalle de la reserva"
                    >
                      <span>Ir a Reserva</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <p className="text-base text-gray-600">—</p>
                  )}
                </div>

                {/* Cliente (nombre completo, link) */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                  <h3 className="text-sm uppercase tracking-wide text-verde-600 mb-1">Cliente</h3>
                  {id_cliente && nombreCliente !== "—" ? (
                    <Link
                      to={`/cliente/${id_cliente}`}
                      className="inline-flex items-center gap-2 text-azul-900 hover:underline font-semibold"
                      title="Ver detalle del cliente"
                    >
                      <User className="w-4 h-4" />
                      {nombreCliente}
                    </Link>
                  ) : (
                    <p className="text-base text-gray-600">{nombreCliente}</p>
                  )}
                </div>

                {/* Cancha (nombre, link) */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                  <h3 className="text-sm uppercase tracking-wide text-verde-600 mb-1">Cancha</h3>
                  {id_cancha && nombreCancha !== "—" ? (
                    <Link
                      to={`/cancha/${id_cancha}`}
                      className="inline-flex items-center gap-2 text-azul-900 hover:underline font-semibold"
                      title="Ver detalle de la cancha"
                    >
                      <Volleyball className="w-4 h-4" />
                      {nombreCancha}
                    </Link>
                  ) : (
                    <p className="text-base text-gray-600">{nombreCancha}</p>
                  )}
                </div>
              </div>

              {/* Detalle & Sugerencia */}
              <div className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                  <h3 className="text-sm uppercase tracking-wide text-verde-600 mb-1">Detalle</h3>
                  <p className="text-base font-normal text-azul-950 break-words">
                    {detalleMostrar}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                  <h3 className="text-sm uppercase tracking-wide text-verde-600 mb-1">Sugerencia</h3>
                  <p className="text-base font-normal text-azul-950 break-words">
                    {sugerenciaMostrar}
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </SideBar>
  );
}
