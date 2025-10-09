/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, ArrowLeft } from "lucide-react";
import Alerta from "./Alerta";

function DisciplinaFormCreate({ token, onSubmit }) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });

  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [successAlert, setSuccessAlert] = useState({ open: false, msg: "" });
  const navigate = useNavigate();

  // === Manejar cambios de formulario ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  // === Enviar formulario ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;

    setError("");
    setEnviando(true);

    try {
      await onSubmit(formData);
      setSuccessAlert({
        open: true,
        msg: "Disciplina creada correctamente.",
      });

      // Redirige automáticamente tras unos segundos
      setTimeout(() => navigate("/disciplinas"), 1500);
    } catch (err) {
      setError(err.message || "Error al crear la disciplina.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main>
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/disciplinas")}
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <h1 className="flex items-center text-2xl font-poppins font-bold text-azul-950">
            <Dumbbell className="mr-3" />
            Registrar nueva Disciplina Deportiva
          </h1>
        </div>
      </div>

      {/* === Formulario principal === */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-md-xl shadow-lg p-4 px-4 md:p-8">
          <div className="mb-6">
            <h2 className="font-medium text-xl text-verde-600">
              Información General
            </h2>
            <p className="font-light text-verde-600">
              Ingresa los datos de la disciplina y guarda los cambios.
            </p>
          </div>

          <div className="grid gap-4 text-sm grid-cols-1 md:grid-cols-2">
            <div>
              <label className="text-azul-950 font-medium">
                Nombre de la disciplina*
              </label>
              <input
                required
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Fútbol, Natación, Tenis..."
                className="h-10 border border-gray-300 mt-1 rounded-md px-4 w-full bg-white text-azul-950 
                  focus:outline-none focus:ring-2 focus:ring-verde-600 focus:border-0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-azul-950 font-medium">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describe brevemente la disciplina..."
                className="border border-gray-300 mt-1 rounded-md px-4 py-2 w-full focus:ring-2 focus:ring-verde-600"
              />
            </div>
          </div>

          {/* === Botones === */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => navigate("/disciplinas")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-5 rounded-md transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={enviando}
              className="bg-verde-600 hover:bg-verde-700 text-white font-semibold py-2 px-5 rounded-md transition disabled:opacity-60"
            >
              {enviando ? "Guardando…" : "Guardar disciplina"}
            </button>
          </div>

          {/* === Mensajes === */}
          {error && (
            <p className="mt-3 text-red-600 text-sm font-medium">{error}</p>
          )}
        </div>
      </form>

      {/* === Alerta de éxito === */}
      {successAlert.open && (
        <div className="mt-4">
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
    </main>
  );
}

export default DisciplinaFormCreate;
