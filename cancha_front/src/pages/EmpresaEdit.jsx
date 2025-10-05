// pages/EmpresaEdit.jsx
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Building2, Save, ArrowLeft } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Alerta from "../components/Alerta";
import EmpresaFormEdit from "../components/EmpresaFormEdit";
import { obtenerEmpresaPorId, actualizarEmpresa } from "../services/empresaService";

function EmpresaEdit() {
  const navigate = useNavigate();
  const { id: idParam } = useParams();

  // 🔹 Token y roles
  const token = localStorage.getItem("token");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdmin = roles.includes("ADMINISTRADOR");

  // 🔹 ID empresa: usa el de la ruta; si no hay, fallback a 2
  const empresaId = Number.isInteger(Number(idParam)) ? Number(idParam) : 2;

  // 🔹 Estados
  const [empresa, setEmpresa] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // alerts inline (mismo patrón que PersonasLista)
  const [successAlert, setSuccessAlert] = useState({ open: false, msg: "" });
  const [errorAlert, setErrorAlert] = useState({ open: false, msg: "" });

  useEffect(() => {
    async function fetchEmpresa() {
      try {
        if (!Number.isInteger(empresaId)) {
          throw new Error("ID inválido de empresa.");
        }
        const resp = await obtenerEmpresaPorId(empresaId, token);
        setEmpresa(resp.data || null);
      } catch (e) {
        setError(e?.message || "No se pudo cargar la empresa.");
      } finally {
        setCargando(false);
      }
    }

    if (token && isAdmin) {
      fetchEmpresa();
    } else {
      setCargando(false);
    }
  }, [empresaId, token, isAdmin]);

  const handleSubmit = async (data) => {
    try {
      await actualizarEmpresa(empresaId, data, token);
      setSuccessAlert({
        open: true,
        msg: "La empresa fue actualizada correctamente.",
      });
      // Redirigir al detalle (o a donde prefieras)
      navigate(`/empresa/${empresaId}`);
    } catch (e) {
      setErrorAlert({
        open: true,
        msg: e?.message || "No se pudo actualizar la empresa.",
      });
    }
  };

  // 🔒 Guards de acceso
  if (!token) {
    return (
      <Sidebar>
        <main className="flex-1 p-8">
          <p className="text-red-500">Por favor, inicia sesión para editar.</p>
        </main>
      </Sidebar>
    );
  }

  if (!isAdmin) {
    return (
      <Sidebar>
        <main className="flex-1 p-8">
          <p className="text-red-500">Acceso restringido: Solo para administradores</p>
        </main>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <main className="flex-1 p-8">
        {/* Header: título + acciones */}
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="flex items-center text-2xl font-poppins font-bold text-azul-950">
            <Building2 className="mr-3" />
            Editar Empresa
          </h1>

          <div className="flex items-center gap-2">
            <Link
              to={`/empresa/${empresaId}`}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-gray-200 text-azul-950 font-medium hover:bg-gray-300 active:scale-[0.99] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver</span>
            </Link>
          </div>
        </div>

        {/* Alerts */}
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

        {error && (
          <div className="mb-3">
            <Alerta
              open
              display="inline"
              variant="error"
              title="Error al cargar"
              message={error}
              onClose={() => setError("")}
            />
          </div>
        )}

        {/* Contenido principal */}
        <div className="pt-2">
          {cargando ? (
            <div className="text-sm text-gray-600">Cargando...</div>
          ) : !empresa ? (
            <div className="text-sm text-gray-600">
              No se encontró la información de la empresa.
            </div>
          ) : (
            <div className="flex justify-center grid grid-cols-1">
              <EmpresaFormEdit initialData={empresa} onSubmit={handleSubmit} />
            </div>
          )}
        </div>
      </main>
    </Sidebar>
  );
}

export default EmpresaEdit;
