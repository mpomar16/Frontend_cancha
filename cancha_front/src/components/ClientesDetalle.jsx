// pages/ClienteDetalle.jsx
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  obtenerClientePorId,
  obtenerReservasPorCliente,
  obtenerComentariosPorCliente,
} from "../services/clienteService";

import SideBar from "../components/Sidebar";
import Alerta from "../components/Alerta";
import placeholder from "../assets/placeholder.jpeg";

import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CalendarDays,
  MessageSquare,
  BookOpen,
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

export default function ClienteDetalle() {
  const { id } = useParams();
  const clienteId = Number(id);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const [cliente, setCliente] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorAlert, setErrorAlert] = useState({ open: false, msg: "" });

  useEffect(() => {
    async function fetchData() {
      setCargando(true);
      try {
        const cliRes = await obtenerClientePorId(clienteId, token);
        const cliData = cliRes?.data ?? cliRes;
        setCliente(cliData);

        try {
          const resRes = await obtenerReservasPorCliente(clienteId);
          setReservas(Array.isArray(resRes) ? resRes : []);
        } catch (e) {
          setReservas([]);
        }

        try {
          const comRes = await obtenerComentariosPorCliente(clienteId);
          setComentarios(Array.isArray(comRes) ? comRes : []);
        } catch (e) {
          setComentarios([]);
        }
      } catch (err) {
        setErrorAlert({
          open: true,
          msg: err?.message || "Error al obtener datos del cliente.",
        });
      } finally {
        setCargando(false);
      }
    }

    if (Number.isInteger(clienteId)) fetchData();
  }, [clienteId, token]);

  const nombreCompleto = cliente
    ? `${cliente?.nombre ?? ""} ${cliente?.apellido ?? ""}`.trim() || "—"
    : "—";

  const srcImg = cliente?.imagen_perfil
    ? `${API_BASE}${cliente.imagen_perfil}`
    : placeholder;

  return (
    <SideBar>
      <main className="flex-1 p-6 sm:p-8 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/clientes")}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
            >
              <ArrowLeft size={16} /> Volver
            </button>
            <h1 className="flex items-center text-2xl font-poppins font-bold text-azul-950">
              <User className="mr-2" />
              {nombreCompleto || "Cliente"}
            </h1>
          </div>
        </header>

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

        {cargando ? (
          <p className="text-sm text-gray-600">Cargando...</p>
        ) : !cliente ? (
          <p className="text-sm text-gray-600">No se encontró el cliente.</p>
        ) : (
          <>
            {/* Perfil del cliente */}
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
                    title="Correo"
                    icon={<Mail className="w-4 h-4" />}
                    value={cliente?.correo || "—"}
                  />
                  <InfoCard
                    title="Teléfono"
                    icon={<Phone className="w-4 h-4" />}
                    value={cliente?.telefono || "—"}
                  />
                  <InfoCard
                    title="Fecha de Registro"
                    icon={<CalendarDays className="w-4 h-4" />}
                    value={formatFechaDDMMYYYY(cliente?.fecha_registro)}
                  />
                </div>
              </div>
            </section>

            {/* Reservas */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow p-5 sm:p-6">
              <h2 className="text-lg font-bold text-azul-950 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-verde-600" />
                Reservas
              </h2>

              {reservas.length === 0 ? (
                <p className="text-sm text-gray-600">Sin reservas.</p>
              ) : (
                <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-2 overflow-x-auto">
                  <table className="min-w-full leading-normal">
                    <thead>
                      <tr>
                        <Th>ID</Th>
                        <Th>Fecha</Th>
                        <Th>Hora</Th>
                        <Th>Cancha</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservas.map((r) => (
                        <tr key={r.id_reserva}>
                          <Td>{r.id_reserva}</Td>
                          <Td>{formatFechaDDMMYYYY(r.fecha)}</Td>
                          <Td>
                            {r.hora_inicio} - {r.hora_fin}
                          </Td>
                          <Td>{r.nombre_cancha || "—"}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Comentarios */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow p-5 sm:p-6">
              <h2 className="text-lg font-bold text-azul-950 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-verde-600" />
                Comentarios
              </h2>

              {comentarios.length === 0 ? (
                <p className="text-sm text-gray-600">Sin comentarios.</p>
              ) : (
                <ul className="space-y-3">
                  {comentarios.map((c) => (
                    <li
                      key={c.id_comentario}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                    >
                      <p className="text-sm text-gray-800">{c.detalle}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFechaDDMMYYYY(c.fecha_comentario)}
                      </p>
                    </li>
                  ))}
                </ul>
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
