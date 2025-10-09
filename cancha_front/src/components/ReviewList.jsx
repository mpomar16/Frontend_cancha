function ReviewList({ reviews }) {
  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <p className="text-gray-500">No hay reseñas disponibles.</p>
      ) : (
        reviews.map((review) => (
          <div key={review.id_resena || review.fecha_creacion} className="bg-white p-4 rounded-lg shadow-md">
            <p><strong>Estrellas:</strong> {review.estrellas}</p>
            <p><strong>Comentario:</strong> {review.comentario || 'Sin comentario'}</p>
            <p><strong>Fecha:</strong> {new Date(review.fecha_creacion).toLocaleDateString()}</p>
            {review.nombre_cliente && <p><strong>Cliente:</strong> {review.nombre_cliente}</p>}
            {review.estado && <p><strong>Estado:</strong> {review.estado}</p>}
          </div>
        ))
      )}
    </div>
  );
}

export default ReviewList;