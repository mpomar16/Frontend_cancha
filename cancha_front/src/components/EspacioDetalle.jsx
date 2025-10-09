import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerEspacioPorId } from "../services/espacioService";
import { listarCanchas } from "../services/canchaService"; // 👈 importamos
import SideBar from "./Sidebar";
import { Building2, ArrowLeft } from "lucide-react";
import Alerta from "./Alerta";
import CanchaLista from "./CanchasLista";

const API_BASE = "http://localhost:3000";

export default function EspacioDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const espacioId = Number(id);

  const [espacio, setEspacio] = useState(null);
  const [canchas, setCanchas] = useState([]); // 👈 nuevo estado
  const [cargando, setCargando] = useState(true);
  const [errorAlert, setErrorAlert] = useState({ open: false, msg: "" });
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchData() {
      try {
        setCargando(true);
        const [espRes, canRes] = await Promise.all([
          obtenerEspacioPorId(espacioId, token),
          listarCanchas(token),
        ]);

        setEspacio(espRes.data);

        // 👇 filtramos solo las canchas del espacio actual
        const canchasFiltradas = (canRes.data || []).filter(
          (c) => c.id_espacio === espacioId
        );
        setCanchas(canchasFiltradas);
      } catch (err) {
        setErrorAlert({ open: true, msg: err?.message || "Error al obtener datos." });
      } finally {
        setCargando(false);
      }
    }

    if (Number.isInteger(espacioId)) fetchData();
  }, [espacioId, token]);

  return (
    <SideBar>
      <main className="flex-1 p-6 sm:p-8 space-y-8">
        {/* ======= HEADER ======= */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/espacios")}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
            >
              <ArrowLeft size={16} /> Volver
            </button>
            <h1 className="flex items-center text-2xl font-poppins font-bold text-azul-950">
              <Building2 className="mr-2" />
              {espacio?.nombre || "Espacio deportivo"}
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
        ) : !espacio ? (
          <p className="text-sm text-gray-600">No se encontró el espacio.</p>
        ) : (
          <>
            {/* ======= INFORMACIÓN GENERAL ======= */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow p-5 sm:p-6">
              <h2 className="text-lg font-bold text-azul-950 mb-4">Información General</h2>

              <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* Administrador */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                  <h3 className="text-sm uppercase tracking-wide text-verde-600 mb-1">Administrador</h3>
                  <p className="text-base font-semibold text-azul-950 break-words">
                    {espacio?.admin_nombre_completo ??
                      (Number.isInteger(espacio?.id_admin_esp_dep)
                        ? `#${espacio.id_admin_esp_dep}`
                        : "—")}
                  </p>
                </div>

                {/* Descripción */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                  <h3 className="text-sm uppercase tracking-wide text-verde-600 mb-1">Dirección</h3>
                  <p className="text-base text-azul-950 leading-snug">
                    {espacio?.direccion || "Sin descripción registrada."}
                  </p>
                </div>

                {/* Horario */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                  <h3 className="text-sm uppercase tracking-wide text-verde-600 mb-1">Horario</h3>
                  <p className="text-base font-semibold text-azul-950">
                    Apertura:{" "}
                    <span className="font-normal">{espacio?.horario_apertura || "—"}</span>
                    <br />
                    Cierre:{" "}
                    <span className="font-normal">{espacio?.horario_cierre || "—"}</span>
                  </p>
                </div>
              </div>

              {/* Dirección + Mapa */}
              <div className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                  <h3 className="text-sm uppercase tracking-wide text-verde-600 mb-1">Descripción</h3>
                  <p className="text-base font-normal text-azul-950 break-words">
                    {espacio?.descripcion || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  {espacio?.latitud && espacio?.longitud ? (
                    <iframe
                      src={`https://www.google.com/maps?q=${espacio.latitud},${espacio.longitud}&hl=es&z=15&output=embed`}
                      className="w-full h-56 rounded-b-lg"
                      title="Mapa de ubicación"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-56 text-sm text-gray-500">
                      Sin coordenadas
                    </div>
                  )}
                  <figcaption className="text-center py-2 text-sm uppercase tracking-wide text-verde-600">
                    Ubicación
                  </figcaption>
                </div>
              </div>
            </section>

            {/* ======= GALERÍA ======= */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow p-5 sm:p-6">
              <h2 className="text-lg font-bold text-azul-950 mb-4">Galería</h2>
              {(() => {
                const tiles = [
                  { key: "principal", src: espacio?.imagen_principal, label: "Principal" },
                  { key: "sec1", src: espacio?.imagen_sec_1, label: "Secundaria 1" },
                  { key: "sec2", src: espacio?.imagen_sec_2, label: "Secundaria 2" },
                  { key: "sec3", src: espacio?.imagen_sec_3, label: "Secundaria 3" },
                  { key: "sec4", src: espacio?.imagen_sec_4, label: "Secundaria 4" },
                ].filter(t => t.src);

                if (tiles.length === 0)
                  return <p className="text-sm text-gray-600">Sin imágenes.</p>;

                return (
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 auto-rows-[100px] sm:auto-rows-[120px] lg:auto-rows-[130px]">
                    {tiles.map((t) => (
                      <figure
                        key={t.key}
                        className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
                      >
                        <img
                          src={`${API_BASE}${t.src}`}
                          alt={`${t.label} de ${espacio?.nombre}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                        <figcaption className="absolute bottom-1 left-1 bg-azul-900/70 text-verde-600 text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">
                          {t.label}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                );
              })()}
            </section>

            {/* ======= CANCHAS ======= */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-azul-950">Canchas disponibles</h2>
              </div>
              <CanchaLista canchas={canchas} mostrarAcciones={false} />
            </section>
          </>
        )}
      </main>
    </SideBar>
  );
}
