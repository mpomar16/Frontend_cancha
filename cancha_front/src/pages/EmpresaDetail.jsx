// pages/EmpresaDetail.jsx
import Sidebar from "../components/Sidebar";
import EmpresaDetalles from "../components/EmpresaDetalles";

export default function EmpresaDetail() {
  const token = localStorage.getItem("token");
  if (!token) {
    return (
      <Sidebar>
        <main className="flex-1 p-8">
          <p className="text-red-500">Por favor, inicia sesión para ver los detalles.</p>
        </main>
      </Sidebar>
    );
  }
  return (
    <Sidebar>
      <main className="flex-1 p-8">
        <EmpresaDetalles />
      </main>
    </Sidebar>
  );
}