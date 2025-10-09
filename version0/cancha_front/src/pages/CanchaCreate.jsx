/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { crearCancha } from "../services/canchaService";
import CanchaFormCreate from "../components/CanchaFormCreate";
import Sidebar from "../components/Sidebar";
import { Loader2 } from "lucide-react";

function CanchaCreate() {
  const [searchParams] = useSearchParams();
  const idEspacio = searchParams.get("espacio");
  const navigate = useNavigate();

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  // === Validar token e idEspacio ===
  useEffect(() => {
    if (!token) {
      setError("Token no disponible o expirado. Inicia sesión nuevamente.");
    }
  }, [token]);

  // === Enviar formulario ===
  const handleSubmit = async (formData) => {
    try {
      setEnviando(true);
      setError("");

      // aseguramos incluir el id del espacio si vino por query
      if (idEspacio && !formData.has("id_espacio")) {
        formData.append("id_espacio", idEspacio);
      }

      const res = await crearCancha(formData, token);
      console.log("✅ Cancha creada:", res);

      // ✅ Volvemos al detalle o edición del espacio correspondiente
      navigate(-1);
    } catch (err) {
      console.error("❌ Error al crear la cancha:", err);
      setError(err.message || "Error al registrar la cancha.");
    } finally {
      setEnviando(false);
    }
  };

  // === Estados de carga / error ===
  if (enviando) {
    return (
      <Sidebar>
        <main className="flex-1 p-6 sm:p-8 flex items-center justify-center text-gray-500">
          <Loader2 className="animate-spin w-5 h-5 mr-2" />
          Registrando nueva cancha…
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

  // === UI principal ===
  return (
    <Sidebar>
      <main className="flex-1 p-6 sm:p-8">
        <CanchaFormCreate
          key={idEspacio || "nueva"}
          onSubmit={handleSubmit}
          token={token}
        />
      </main>
    </Sidebar>
  );
}

export default CanchaCreate;
