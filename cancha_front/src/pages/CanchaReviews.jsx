import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { listarResenasPorCancha, listarResenasDetalladas, calcularPromedioResenas } from '../services/canchaService';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

function CanchaReviews() {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [detailedReviews, setDetailedReviews] = useState([]);
  const [promedio, setPromedio] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const fetchReviews = async () => {
    try {
      const reviewsResponse = await listarResenasPorCancha(id, token);
      setReviews(reviewsResponse.data);
      const detailedResponse = await listarResenasDetalladas(id, token);
      setDetailedReviews(detailedResponse.data);
      const promedioResponse = await calcularPromedioResenas(id, token);
      setPromedio(promedioResponse.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id, token]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reseñas de la Cancha</h1>
      {error && <p className="text-red-500">{error}</p>}
      <p><strong>Promedio:</strong> {promedio?.promedio_estrellas || 'Sin reseñas'} ({promedio?.total_comentarios || 0} comentarios)</p>
      <h2 className="text-xl font-bold mt-4">Crear Reseña</h2>
      <ReviewForm canchaId={id} token={token} onReviewSubmitted={fetchReviews} />
      <h2 className="text-xl font-bold mt-4">Reseñas</h2>
      <ReviewList reviews={reviews} />
      <h2 className="text-xl font-bold mt-4">Reseñas Detalladas</h2>
      <ReviewList reviews={detailedReviews} />
    </div>
  );
}

export default CanchaReviews;