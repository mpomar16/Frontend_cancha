export async function obtenerEspaciosDeportivos() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/espacio_deportivo', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return await res.json();
  } catch (error) {
    console.error('Error al obtener espacios:', error);
    return { success: false, message: 'Error de conexión' };
  }
}
