import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DisciplinaFormCreate from "../components/DisciplinaFormCreate";
import { crearDisciplina } from "../services/disciplinaService";

function DisciplinaCreate() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (data) => {
    if (enviando) return; // evita doble envío
    setEnviando(true);
    try {
      await crearDisciplina(data, token);
      navigate(-1); // volver a la página anterior
    } catch (err) {
      console.error(err);
      alert(err?.message || "Ocurrió un error al crear la disciplina.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Sidebar>
      <main className="flex-1 p-8">
        <DisciplinaFormCreate onSubmit={handleSubmit} token={token} />
        {enviando && (
          <p className="mt-3 text-sm text-gray-500">Enviando…</p>
        )}
      </main>
    </Sidebar>
  );
}

export default DisciplinaCreate;
