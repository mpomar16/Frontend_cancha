import { useState } from 'react';
import { crearResenaCancha } from '../services/canchaService';

function ReviewForm({ canchaId, token, onReviewSubmitted }) {
  const [formData, setFormData] = useState({
    id_reserva: '',
    estrellas: '',
    comentario: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearResenaCancha(formData, token);
      alert('Reseña creada exitosamente');
      setFormData({ id_reserva: '', estrellas: '', comentario: '' });
      onReviewSubmitted();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4">
        <label className="block text-gray-700">ID de Reserva</label>
        <input
          type="number"
          name="id_reserva"
          value={formData.id_reserva}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Estrellas (1-5)</label>
        <input
          type="number"
          name="estrellas"
          value={formData.estrellas}
          onChange={handleChange}
          min="1"
          max="5"
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Comentario</label>
        <textarea
          name="comentario"
          value={formData.comentario}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Enviar Reseña
      </button>
    </form>
  );
}

export default ReviewForm;