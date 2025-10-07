/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  obtenerCanchaPorId,
  actualizarCancha,
  asignarDisciplinas,
  getDisciplinasPorCancha,
} from "../services/canchaService";
import CanchaFormEdit from "../components/CanchaFormEdit";
import Sidebar from "../components/Sidebar";
import { Loader2 } from "lucide-react";

function CanchaEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Si venimos desde la lista, obtenemos la cancha directamente
  const canchaDesdeFila = location.state?.cancha || null;

  // ✅ Guarda el token en estado desde el inicio
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [cancha, setCancha] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // === Cargar datos de la cancha ===
  useEffect(() => {
    async function fetchCancha() {
      try {
        setCargando(true);

        // ✅ Si la cancha vino desde la lista, la usamos directamente
        if (canchaDesdeFila) {
          console.log("💾 Usando cancha desde Fila:", canchaDesdeFila);
          setCancha(canchaDesdeFila);
          setCargando(false);
          return;
        }

        if (!token) {
          throw new Error("Token no disponible o expirado. Inicia sesión nuevamente.");
        }

        // ⚙️ Si no vino desde Fila, hacemos el fetch normal
        const response = await obtenerCanchaPorId(id, token);
        const data = response?.data?.data || response?.data || response;

        const respDisc = await getDisciplinasPorCancha(id, token);

        console.log("📦 Datos base de cancha:", data);
        console.log("🎾 Disciplinas relacionadas:", respDisc.data);

        const canchaCompleta = {
          ...data,
          disciplinas: Array.isArray(respDisc.data)
            ? respDisc.data.map((d) => ({
                id_disciplina: String(d.id_disciplina),
                nombre: d.nombre,
              }))
            : [],
        };

        console.log("✅ Cancha combinada final:", canchaCompleta);
        setCancha(canchaCompleta);
      } catch (err) {
        console.error("❌ Error al obtener la cancha:", err);
        setError(err.message || "No se pudo cargar la cancha.");
      } finally {
        setCargando(false);
      }
    }

    fetchCancha();
  }, [id, token, canchaDesdeFila]);

  // === Enviar cambios ===
  const handleSubmit = async (formData) => {
    try {
      // 1️⃣ Actualizar la información principal de la cancha
      await actualizarCancha(id, formData, token);

      // 2️⃣ Obtener las disciplinas seleccionadas desde el formulario
      const disciplinasSeleccionadas = JSON.parse(formData.get("disciplinas") || "[]");
      console.log("🧩 Disciplinas seleccionadas:", disciplinasSeleccionadas);

      // 3️⃣ Sincronizar las disciplinas (aunque el array esté vacío)
      await asignarDisciplinas(
        id,
        disciplinasSeleccionadas.map((id) => ({ id_disciplina: String(id) })),
        token
      );

      // 4️⃣ Refrescar los datos completos desde backend
      const [updatedCanchaResponse, updatedDiscResponse] = await Promise.all([
        obtenerCanchaPorId(id, token),
        getDisciplinasPorCancha(id, token),
      ]);

      const updatedCancha =
        updatedCanchaResponse?.data?.data ||
        updatedCanchaResponse?.data ||
        updatedCanchaResponse;

      updatedCancha.disciplinas = Array.isArray(updatedDiscResponse.data)
        ? updatedDiscResponse.data.map((d) => ({
            id_disciplina: String(d.id_disciplina),
            nombre: d.nombre,
          }))
        : [];

      setCancha(updatedCancha);
      console.log("✅ Cancha actualizada en frontend:", updatedCancha);

      // 5️⃣ Redirigir (atrás o a detalle)
      navigate(-1);
    } catch (err) {
      console.error("❌ Error al guardar los cambios:", err);
      setError(err.message || "Error al guardar los cambios.");
    }
  };

  // === Estados de carga ===
  if (cargando) {
    return (
      <Sidebar>
        <main className="flex-1 p-6 sm:p-8">
          <div className="flex items-center justify-center h-96 text-gray-500">
            <Loader2 className="animate-spin w-6 h-6 mr-2" />
            Cargando datos de la cancha...
          </div>
        </main>
      </Sidebar>
    );
  }

  if (error) {
    return (
      <Sidebar>
        <main className="flex-1 p-6 sm:p-8">
          <p className="text-red-600 bg-red-50 border border-red-200 p-4 rounded">
            ⚠️ {error}
          </p>
        </main>
      </Sidebar>
    );
  }

  if (!cancha) {
    return (
      <Sidebar>
        <main className="flex-1 p-6 sm:p-8">
          <p className="text-gray-500">No se encontró la cancha solicitada.</p>
        </main>
      </Sidebar>
    );
  }

  // === UI principal ===
  console.log("🧩 Token enviado al formulario:", token);
  return (
    <CanchaFormEdit
      key={id}
      initialData={cancha}
      onSubmit={handleSubmit}
      token={token}
    />
  );
}

export default CanchaEdit;
