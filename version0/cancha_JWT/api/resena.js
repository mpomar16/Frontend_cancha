// resenaRoutes.js
const express = require('express');
const { verifyToken, checkRole } = require('../middleware/auth');
const pool = require('../config/database');

// --- Modelos ---
async function getAllResenas() {
  try {
    const query = `
      SELECT 
        r.id_resena,
        r.id_reserva,
        r.estrellas,
        r.comentario,
        r.fecha_creacion,
        r.estado,
        -- Cliente asociado a la reserva
        p.usuario AS nombre_cliente
      FROM RESENA r
      JOIN RESERVA res ON r.id_reserva = res.id_reserva
      JOIN CLIENTE cl ON res.id_cliente = cl.id_cliente
      JOIN PERSONA p ON cl.id_cliente = p.id_persona
      ORDER BY r.id_resena DESC
    `
    const result = await pool.query(query)
    return result.rows
  } catch (error) {
    throw new Error('Error al listar reseñas: ' + error.message)
  }
}

async function getResenaById(id) {
  try {
    const query = `
      SELECT 
        r.id_resena,
        r.id_reserva,
        r.estrellas,
        r.comentario,
        r.fecha_creacion,
        r.estado,
        p.nombre || ' ' || p.apellido AS nombre_cliente
      FROM RESENA r
      JOIN RESERVA res ON r.id_reserva = res.id_reserva
      JOIN CLIENTE c ON res.id_cliente = c.id_cliente
      JOIN PERSONA p ON c.id_cliente = p.id_persona
      WHERE r.id_resena = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener reseña por ID: ' + error.message);
  }
}

async function getResenasByReservaId(id_reserva) {
  try {
    const query = `
      SELECT 
        r.id_resena,
        r.id_reserva,
        r.estrellas,
        r.comentario,
        r.fecha_creacion,
        r.estado,
        p.nombre || ' ' || p.apellido AS nombre_cliente
      FROM RESENA r
      JOIN RESERVA res ON r.id_reserva = res.id_reserva
      JOIN CLIENTE c ON res.id_cliente = c.id_cliente
      JOIN PERSONA p ON c.id_cliente = p.id_persona
      WHERE r.id_reserva = $1
    `;
    const result = await pool.query(query, [id_reserva]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar reseñas por reserva: ' + error.message);
  }
}

async function createResena(id_reserva, estrellas, comentario, estado) {
  try {
    const query = `
      INSERT INTO RESENA (id_reserva, estrellas, comentario, estado)
      VALUES ($1, $2, $3, $4)
      RETURNING id_resena, id_reserva, estrellas, comentario, fecha_creacion, estado
    `;
    const values = [id_reserva, estrellas, comentario, estado];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear reseña: ' + error.message);
  }
}

async function updateResena(id, estrellas, comentario, estado) {
  try {
    const query = `
      UPDATE RESENA
      SET estrellas = COALESCE($1, estrellas),
          comentario = COALESCE($2, comentario),
          estado = COALESCE($3, estado)
      WHERE id_resena = $4
      RETURNING id_resena, id_reserva, estrellas, comentario, fecha_creacion, estado
    `;
    const values = [estrellas, comentario, estado, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar reseña: ' + error.message);
  }
}

async function deleteResena(id) {
  try {
    const query = `
      DELETE FROM RESENA
      WHERE id_resena = $1
      RETURNING id_resena, id_reserva, estrellas, comentario, fecha_creacion, estado
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar reseña: ' + error.message);
  }
}

// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// --- Controladores ---

const response = (success, message, data = null) => ({
  success,
  message,
  data,
});

const listarResenas = async (req, res) => {
  try {
    const resenas = await getAllResenas();
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Lista de reseñas obtenida', resenas));
  } catch (error) {
    console.error('Error al listar reseñas:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerResenaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const resena = await getResenaById(id);
    if (!resena) {
      return res.status(404).json(response(false, 'Reseña no encontrada'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Reseña obtenida', resena));
  } catch (error) {
    console.error('Error al obtener reseña por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarResenasPorReservaId = async (req, res) => {
  const { id_reserva } = req.params;

  try {
    const resenas = await getResenasByReservaId(id_reserva);
    if (!resenas.length) {
      return res.status(404).json(response(false, 'No se encontraron reseñas para esta reserva'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Reseñas obtenidas por reserva', resenas));
  } catch (error) {
    console.error('Error al listar reseñas por reserva:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearResena = async (req, res) => {
  const { id_reserva, estrellas, comentario, estado } = req.body;

  // Validar campos requeridos
  if (!id_reserva || !estrellas) {
    return res.status(400).json(response(false, 'Los campos id_reserva y estrellas son obligatorios'));
  }

  try {
    // Verificar que id_reserva existe en RESERVA
    const reservaExistente = await pool.query('SELECT id_reserva FROM RESERVA WHERE id_reserva = $1', [id_reserva]);
    if (!reservaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Reserva no encontrada'));
    }

    // Verificar si la reserva ya tiene una reseña asignada
    const existingResena = await getResenasByReservaId(id_reserva);
    if (existingResena.length > 0) {
      return res.status(400).json(response(false, 'La reserva ya tiene una reseña asignada'));
    }

    // Validar estrellas
    if (!Number.isInteger(estrellas) || estrellas < 1 || estrellas > 5) {
      return res.status(400).json(response(false, 'El campo estrellas debe ser un entero entre 1 y 5'));
    }

    // Validar comentario si se proporciona
    if (comentario && typeof comentario !== 'string') {
      return res.status(400).json(response(false, 'El comentario debe ser una cadena de texto'));
    }

    // Validar estado si se proporciona
    if (estado !== undefined && typeof estado !== 'boolean') {
      return res.status(400).json(response(false, 'El estado debe ser un valor booleano'));
    }

    // Crear reseña
    const nuevaResena = await createResena(id_reserva, estrellas, comentario || null, estado || false);
    
    // Obtener la reseña completa con nombre_cliente para la respuesta
    const resenaConCliente = await getResenaById(nuevaResena.id_resena);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(201).json(response(true, 'Reseña creada exitosamente', resenaConCliente));
  } catch (error) {
    console.error('Error al crear reseña:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarResena = async (req, res) => {
  const { id } = req.params;
  const { estrellas, comentario, estado } = req.body;

  try {
    // Verificar que la reseña existe
    const resenaActual = await getResenaById(id);
    if (!resenaActual) {
      return res.status(404).json(response(false, 'Reseña no encontrada'));
    }

    // Validar estrellas si se proporciona
    if (estrellas !== undefined) {
      if (!Number.isInteger(estrellas) || estrellas < 1 || estrellas > 5) {
        return res.status(400).json(response(false, 'El campo estrellas debe ser un entero entre 1 y 5'));
      }
    }

    // Validar comentario si se proporciona
    if (comentario !== undefined && typeof comentario !== 'string') {
      return res.status(400).json(response(false, 'El comentario debe ser una cadena de texto'));
    }

    // Validar estado si se proporciona
    if (estado !== undefined && typeof estado !== 'boolean') {
      return res.status(400).json(response(false, 'El estado debe ser un valor booleano'));
    }

    // Actualizar reseña
    const resenaActualizada = await updateResena(id, estrellas, comentario, estado);

    // Obtener la reseña completa con nombre_cliente para la respuesta
    const resenaConCliente = await getResenaById(resenaActualizada.id_resena);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Reseña actualizada exitosamente', resenaConCliente));
  } catch (error) {
    console.error('Error al actualizar reseña:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarResena = async (req, res) => {
  const { id } = req.params;

  try {
    const resena = await getResenaById(id);
    if (!resena) {
      return res.status(404).json(response(false, 'Reseña no encontrada'));
    }

    const resenaEliminada = await deleteResena(id);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Reseña eliminada exitosamente'));
  } catch (error) {
    console.error('Error al eliminar reseña:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

// --- Rutas ---

const router = express.Router();

// Rutas públicas (lectura) accesibles por clientes, administradores y encargados
router.get('/datos-total', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'ENCARGADO']), listarResenas);
router.get('/id/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'ENCARGADO']), obtenerResenaPorId);
router.get('/reserva/:id_reserva', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'ENCARGADO']), listarResenasPorReservaId);

// Rutas para crear (clientes) y modificar/eliminar (administradores)
router.post('/', verifyToken, checkRole(['CLIENTE']), crearResena);
router.patch('/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE']), actualizarResena);
router.delete('/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP']), eliminarResena);

module.exports = router;