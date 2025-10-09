// pages/EncargadoDetalle.jsx
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  obtenerEncargadoPorId,
  obtenerReportesPorEncargadoId,
} from "../services/encargadoService";

import SideBar from "./Sidebar";
import Alerta from "./Alerta";
import placeholder from "../assets/placeholder.jpeg";

import {
  ArrowLeft,
  UserCog,
  Mail,
  Phone,
  Briefcase,
  Clock,
  CalendarDays,
} from "lucide-react";

const API_BASE = "http://localhost:3000";

function formatFechaDDMMYYYY(fecha) {
  if (!fecha) return "—";
  try {
    let d;
    if (/^\d{4}-\d{2}-\d{2}/.test(fecha)) {
      const [y, m, day] = fecha.split("T")[0].split("-");
      d = new Date(Number(y), Number(m) - 1, Number(day));
    } else {
      d = new Date(fecha);
    }
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function normalizeHora(h) {
  if (!h) return null;
  const m = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(h);
  return m ? `${m[1]}:${m[2]}` : null;
}

// Normaliza el estado recibido (boolean o string) y devuelve label + clases
function getEstadoInfo(raw) {
  // normalización
  let isActive;
  if (typeof raw === "boolean") {
    isActive = raw;
  } else if (typeof raw === "string") {
    const v = raw.toLowerCase();
    isActive = v === "activo" || v === "true";
  } else {
    isActive = false; // default seguro
  }

  return isActive
    ? {
        label: "Activo",
        classes:
          "bg-green-100 text-green-700 ring-1 ring-green-200",
      }
    : {
        label: "Inactivo",
        classes:
          "bg-red-100 text-red-700 ring-1 ring-red-200",
      };
}

export default function EncargadoDetalle() {
  const { id } = useParams();
  const encId = Number(id);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const [encargado, setEncargado] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorAlert, setErrorAlert] = useState({ open: false, msg: "" });

  useEffect(() => {
    async function fetchData() {
      setCargando(true);
      try {
        // Encargado
        const encRes = await obtenerEncargadoPorId(encId, token);
        const encData = encRes?.data ?? encRes; // por si el helper ya entrega data
        setEncargado(encData);

        // Reportes (404 = sin reportes)
        try {
          const repRes = await obtenerReportesPorEncargadoId(encId, token);
          setReportes(Array.isArray(repRes?.data) ? repRes.data : []);
        } catch (e) {
          if (e?.message?.toLowerCase().includes("no se encontraron reportes")) {
            setReportes([]);
          } else {
            throw e;
          }
        }
      } catch (err) {
        setErrorAlert({
          open: true,
          msg: err?.message || "Error al obtener datos del encargado.",
        });
      } finally {
        setCargando(false);
      }
    }

    if (Number.isInteger(encId)) fetchData();
  }, [encId, token]);

  const nombreCompleto = encargado
    ? `${encargado?.nombre ?? ""} ${encargado?.apellido ?? ""}`.trim() || "—"
    : "—";

  const srcImg = encargado?.imagen_perfil
    ? `${API_BASE}${encargado.imagen_perfil}`
    : placeholder;

  const fechaInicio = formatFechaDDMMYYYY(encargado?.fecha_inicio);
  const hi = normalizeHora(encargado?.hora_ingreso);
  const hs = normalizeHora(encargado?.hora_salida);
  const horario = hi && hs ? `${hi}–${hs}` : "—";

  // info del chip de estado
  const estadoInfo = getEstadoInfo(encargado?.estado);

  return (
    <SideBar>
      <main className="flex-1 p-6 sm:p-8 space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/encargados")}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
            >
              <ArrowLeft size={16} /> Volver
            </button>

            <div className="flex items-center gap-2">
              <h1 className="flex items-center text-2xl font-poppins font-bold text-azul-950">
                <UserCog className="mr-2" />
                {nombreCompleto || "Encargado"}
              </h1>

              {/* Chip de Estado */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${estadoInfo.classes}`}
                title={`Estado: ${estadoInfo.label}`}
              >
                {estadoInfo.label}
              </span>
            </div>
          </div>
        </header>

        {/* Alerta */}
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

        {/* Contenido */}
        {cargando ? (
          <p className="text-sm text-gray-600">Cargando...</p>
        ) : !encargado ? (
          <p className="text-sm text-gray-600">No se encontró el encargado.</p>
        ) : (
          <>
            {/* Perfil */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow p-5 sm:p-6">
              <div className="flex items-start gap-5">
                <div className="w-24 h-24">
                  <img
                    src={srcImg}
                    alt={nombreCompleto}
                    className="w-24 h-24 rounded-full object-cover bg-gray-100 border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = placeholder;
                    }}
                  />
                </div>

                <div className="flex-1 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  <InfoCard
                    title="Responsabilidad"
                    icon={<Briefcase className="w-4 h-4" />}
                    value={encargado?.responsabilidad || "—"}
                  />
                  <InfoCard
                    title="Fecha de inicio"
                    icon={<CalendarDays className="w-4 h-4" />}
                    value={fechaInicio}
                  />
                  <InfoCard
                    title="Horario"
                    icon={<Clock className="w-4 h-4" />}
                    value={horario}
                  />
                  <InfoCard
                    title="Correo"
                    icon={<Mail className="w-4 h-4" />}
                    value={encargado?.correo || "—"}
                  />
                  <InfoCard
                    title="Teléfono"
                    icon={<Phone className="w-4 h-4" />}
                    value={encargado?.telefono || "—"}
                  />
                  <InfoCard
                    title="Sexo"
                    icon={<UserCog className="w-4 h-4" />}
                    value={encargado?.sexo || "—"}
                  />
                </div>
              </div>
            </section>

            {/* Reportes */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-azul-950">Reportes</h2>
              </div>

              {reportes.length === 0 ? (
                <p className="text-sm text-gray-600">Sin reportes.</p>
              ) : (
                <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-2 overflow-x-auto">
                  <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                    <table className="min-w-full leading-normal">
                      <thead>
                        <tr>
                          <Th>#</Th>
                          <Th>Detalle</Th>
                          <Th>Sugerencia</Th>
                          <Th>Reserva</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportes.map((r) => (
                          <tr key={r.id_reporte}>
                            <Td>{r.id_reporte}</Td>
                            <Td>{r.detalle || "—"}</Td>
                            <Td>{r.sugerencia || "—"}</Td>
                            <Td>
                              {r.id_reserva ? (
                                <Link
                                  to={`/reserva/${r.id_reserva}`}
                                  className="text-azul-900 underline"
                                >
                                  Ver más
                                </Link>
                              ) : (
                                "—"
                              )}
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </SideBar>
  );
}

function InfoCard({ title, icon, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
      <h3 className="text-xs uppercase tracking-wide text-verde-600 mb-1 flex items-center gap-1">
        {icon} {title}
      </h3>
      <p className="text-base font-semibold text-azul-950 break-words">
        {value}
      </p>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
      {children}
    </th>
  );
}
function Td({ children }) {
  return (
    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-azul-950 align-top">
      {children}
    </td>
  );
}
