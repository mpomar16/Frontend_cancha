import { useState, useEffect } from 'react';
import { listarEstadoCanchaEnum, listarDisciplinas, asignarDisciplinas } from "../services/canchaService";

function CanchaForm({ initialData = {}, onSubmit, token }) {
  const [formData, setFormData] = useState({
    nombre: initialData.nombre || '',
    capacidad: initialData.capacidad || '',
    estado: initialData.estado || '',
    ubicacion: initialData.ubicacion || '',
    monto_por_hora: initialData.monto_por_hora || '',
    id_espacio: initialData.id_espacio || '',
  });
  const [imagen_cancha, setImagenCancha] = useState(null);
  const [estados, setEstados] = useState([]);
  const [error, setError] = useState('');
  const [disciplinas, setDisciplinas] = useState([]);
  const [disciplinasSeleccionadas, setDisciplinasSeleccionadas] = useState([]);

  // 🔹 Cargar estados
  useEffect(() => {
    async function fetchEstados() {
      try {
        const response = await listarEstadoCanchaEnum(token);
        setEstados(response.data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchEstados();
  }, [token]);

  // 🔹 Cargar disciplinas
  useEffect(() => {
    async function fetchDisciplinas() {
      try {
        const response = await listarDisciplinas(token);
        setDisciplinas(response.data); // [{id_disciplina, nombre}, ...]
      } catch (err) {
        setError(err.message);
      }
    }
    fetchDisciplinas();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setImagenCancha(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });
    if (imagen_cancha) data.append('imagen_cancha', imagen_cancha);

    try {
      // Crear cancha
      const res = await onSubmit(data); // { success, message, data }
      const nuevaCancha = res.data;

      // Asignar disciplinas si hay
      if (disciplinasSeleccionadas.length > 0 && nuevaCancha?.id_cancha) {
        console.log("Asignando disciplinas:", {
  cancha: nuevaCancha.id_cancha,
  disciplinas: disciplinasSeleccionadas.map((id) => ({
    id_disciplina: id,
    frecuencia_practica: null
  }))
});
        await asignarDisciplinas(
          nuevaCancha.id_cancha,
          disciplinasSeleccionadas.map((id) => ({
            id_disciplina: id,
            frecuencia_practica: null
          })),
          token
        );
      }

      alert('Operación exitosa');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4">
        <label className="block text-gray-700">Nombre</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Capacidad</label>
        <input
          type="number"
          name="capacidad"
          value={formData.capacidad}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Estado</label>
        <select
          name="estado"
          value={formData.estado}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Seleccione un estado</option>
          {estados.map((estado) => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Ubicación</label>
        <input
          type="text"
          name="ubicacion"
          value={formData.ubicacion}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Monto por hora</label>
        <input
          type="number"
          name="monto_por_hora"
          value={formData.monto_por_hora}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Disciplinas</label>
        <div className="grid grid-cols-2 gap-2">
          {disciplinas.map((disc) => (
            <label key={disc.id_disciplina} className="flex items-center">
              <input
                type="checkbox"
                value={disc.id_disciplina}
                checked={disciplinasSeleccionadas.includes(disc.id_disciplina)}
                onChange={(e) => {
                  const id = disc.id_disciplina;
                  if (e.target.checked) {
                    setDisciplinasSeleccionadas([...disciplinasSeleccionadas, id]);
                  } else {
                    setDisciplinasSeleccionadas(
                      disciplinasSeleccionadas.filter((d) => d !== id)
                    );
                  }
                }}
                className="mr-2"
              />
              {disc.nombre}
            </label>
          ))}
        </div>
      </div>
      <div className="hidden mb-4">
        <label className="block text-gray-700">ID Espacio</label>
        <input
          type="number"
          name="id_espacio"
          value={formData.id_espacio}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Imagen</label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="w-full p-2"
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Guardar
      </button>
    </form>
  );
}

export default CanchaForm;
