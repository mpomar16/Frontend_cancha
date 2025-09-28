const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Clave secreta para JWT (usa variable de entorno en producción)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware para verificar el token JWT
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Authorization: Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id_persona: decoded.id_persona };

    // Consulta para obtener el rol del usuario
    const query = `
      SELECT 'Administrador_ESP_DEPORTIVO' AS rol FROM ADMINISTRADOR_ESP_DEPORTIVO WHERE id_admin = $1
      UNION
      SELECT 'CLIENTE' AS rol FROM CLIENTE WHERE id_cliente = $1
      UNION
      SELECT 'DEPORTISTA' AS rol FROM DEPORTISTA WHERE id_deportista = $1
      UNION
      SELECT 'ENCARGADO' AS rol FROM ENCARGADO WHERE id_encargado = $1
    `;
    const result = await pool.query(query, [decoded.id_persona]);

    req.user.rol = result.rows[0]?.rol || 'Registrado';
    next();
  } catch (error) {
    // Captura tipos de error específicos
    if (error.name === 'TokenExpiredError') {
      console.warn('Intento con token expirado');
      return res.status(401).json({
        success: false,
        message: 'Token expirado, por favor inicie sesión nuevamente',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      console.warn('Intento con token inválido');
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }

    console.error('Error inesperado al verificar token:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error interno al verificar token',
    });
  }
};

// Middleware para verificar roles
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = { verifyToken, checkRole };
