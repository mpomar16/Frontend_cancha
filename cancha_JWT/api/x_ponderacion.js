const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// --- Modelos ---
async function getAllPonderaciones() {
  try {
    const query = `
      SELECT id_ponderacion, calificacion, id_cliente, id_cancha
      FROM PONDERACION
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar ponderaciones: ' + error.message);
  }
}

async function getPonderacionById(id) {
  try {
    const query = `
      SELECT id_ponderacion, calificacion, id_cliente, id_cancha
      FROM PONDERACION
      WHERE id_ponderacion = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener ponderacion por ID: ' + error.message);
  }
}

async function getClienteByPonderacionId(id) {
  try {
    const query = `
      SELECT c.id_cliente, c.fecha_registro, c.fecha_nac, p.id_persona, p.nombre, p.apellido, p.correo
      FROM CLIENTE c
      JOIN PERSONA p ON c.id_cliente = p.id_persona
      JOIN PONDERACION po ON c.id_cliente = po.id_cliente
      WHERE po.id_ponderacion = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener cliente asociado a la ponderacion: ' + error.message);
  }
}

async function getCanchaByPonderacionId(id) {
  try {
    const query = `
      SELECT ca.id_cancha, ca.nombre, ca.capacidad, ca.estado, ca.ubicacion, ca.monto_por_hora, ca.imagen_principal, ca.id_espacio,
             e.nombre as nombre_espacio, e.direccion as direccion_espacio
      FROM CANCHA ca
      JOIN ESPACIO_DEPORTIVO e ON ca.id_espacio = e.id_espacio
      JOIN PONDERACION po ON ca.id_cancha = po.id_cancha
      WHERE po.id_ponderacion = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener cancha asociada a la ponderacion: ' + error.message);
  }
}

async function getPonderacionesByClienteId(id_cliente) {
  try {
    const query = `
      SELECT id_ponderacion, calificacion, id_cliente, id_cancha
      FROM PONDERACION
      WHERE id_cliente = $1
    `;
    const result = await pool.query(query, [id_cliente]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar ponderaciones por cliente: ' + error.message);
  }
}

async function getPonderacionesByCanchaId(id_cancha) {
  try {
    const query = `
      SELECT id_ponderacion, calificacion, id_cliente, id_cancha
      FROM PONDERACION
      WHERE id_cancha = $1
    `;
    const result = await pool.query(query, [id_cancha]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar ponderaciones por cancha: ' + error.message);
  }
}

async function getPromedioCalificacionByCanchaId(id_cancha) {
  try {
    const query = `
      SELECT AVG(calificacion) as promedio
      FROM PONDERACION
      WHERE id_cancha = $1
    `;
    const result = await pool.query(query, [id_cancha]);
    // Convertir a número o devolver null si no hay calificaciones
    return result.rows[0].promedio ? parseFloat(result.rows[0].promedio) : null;
  } catch (error) {
    throw new Error('Error al obtener promedio de calificacion por cancha: ' + error.message);
  }
}

async function getPonderacionByClienteAndCancha(id_cliente, id_cancha) {
  try {
    const query = `
      SELECT id_ponderacion, calificacion, id_cliente, id_cancha
      FROM PONDERACION
      WHERE id_cliente = $1 AND id_cancha = $2
    `;
    const result = await pool.query(query, [id_cliente, id_cancha]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener ponderacion por cliente y cancha: ' + error.message);
  }
}

async function createPonderacion(calificacion, id_cliente, id_cancha) {
  try {
    const query = `
      INSERT INTO PONDERACION (calificacion, id_cliente, id_cancha)
      VALUES ($1, $2, $3)
      RETURNING id_ponderacion, calificacion, id_cliente, id_cancha
    `;
    const values = [calificacion, id_cliente, id_cancha];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear ponderacion: ' + error.message);
  }
}

async function updatePonderacion(id, calificacion, id_cliente, id_cancha) {
  try {
    const query = `
      UPDATE PONDERACION
      SET calificacion = COALESCE($1, calificacion),
          id_cliente = COALESCE($2, id_cliente),
          id_cancha = COALESCE($3, id_cancha)
      WHERE id_ponderacion = $4
      RETURNING id_ponderacion, calificacion, id_cliente, id_cancha
    `;
    const values = [calificacion, id_cliente, id_cancha, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar ponderacion: ' + error.message);
  }
}

async function deletePonderacion(id) {
  try {
    const query = `
      DELETE FROM PONDERACION
      WHERE id_ponderacion = $1
      RETURNING id_ponderacion, calificacion, id_cliente, id_cancha
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar ponderacion: ' + error.message);
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

const listarPonderaciones = async (req, res) => {
  try {
    const ponderaciones = await getAllPonderaciones();
    res.status(200).json(response(true, 'Lista de ponderaciones obtenida', ponderaciones));
  } catch (error) {
    console.error('Error al listar ponderaciones:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerPonderacionPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const ponderacion = await getPonderacionById(id);
    if (!ponderacion) {
      return res.status(404).json(response(false, 'Ponderacion no encontrada'));
    }
    res.status(200).json(response(true, 'Ponderacion obtenida', ponderacion));
  } catch (error) {
    console.error('Error al obtener ponderacion por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerClientePorPonderacionId = async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await getClienteByPonderacionId(id);
    if (!cliente) {
      return res.status(404).json(response(false, 'Cliente no encontrado'));
    }
    res.status(200).json(response(true, 'Cliente obtenido', cliente));
  } catch (error) {
    console.error('Error al obtener cliente asociado a la ponderacion:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerCanchaPorPonderacionId = async (req, res) => {
  const { id } = req.params;

  try {
    const cancha = await getCanchaByPonderacionId(id);
    if (!cancha) {
      return res.status(404).json(response(false, 'Cancha no encontrada'));
    }
    res.status(200).json(response(true, 'Cancha obtenida', cancha));
  } catch (error) {
    console.error('Error al obtener cancha asociada a la ponderacion:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarPonderacionesPorClienteId = async (req, res) => {
  const { id_cliente } = req.params;

  try {
    const ponderaciones = await getPonderacionesByClienteId(id_cliente);
    if (!ponderaciones.length) {
      return res.status(404).json(response(false, 'No se encontraron ponderaciones para este cliente'));
    }
    res.status(200).json(response(true, 'Ponderaciones obtenidas por cliente', ponderaciones));
  } catch (error) {
    console.error('Error al listar ponderaciones por cliente:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarPonderacionesPorCanchaId = async (req, res) => {
  const { id_cancha } = req.params;

  try {
    const ponderaciones = await getPonderacionesByCanchaId(id_cancha);
    if (!ponderaciones.length) {
      return res.status(404).json(response(false, 'No se encontraron ponderaciones para esta cancha'));
    }
    res.status(200).json(response(true, 'Ponderaciones obtenidas por cancha', ponderaciones));
  } catch (error) {
    console.error('Error al listar ponderaciones por cancha:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerPromedioCalificacionPorCanchaId = async (req, res) => {
  const { id_cancha } = req.params;

  try {
    const promedio = await getPromedioCalificacionByCanchaId(id_cancha);
    if (promedio === null) {
      return res.status(404).json(response(false, 'No hay calificaciones para esta cancha'));
    }
    res.status(200).json(response(true, 'Promedio de calificacion obtenido', { promedio: promedio.toFixed(2) }));
  } catch (error) {
    console.error('Error al obtener promedio de calificacion por cancha:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerPonderacionPorClienteYCancha = async (req, res) => {
  const { id_cliente, id_cancha } = req.params;

  try {
    const ponderacion = await getPonderacionByClienteAndCancha(id_cliente, id_cancha);
    if (!ponderacion) {
      return res.status(404).json(response(false, 'Ponderacion no encontrada para este cliente y cancha'));
    }
    res.status(200).json(response(true, 'Ponderacion obtenida', ponderacion));
  } catch (error) {
    console.error('Error al obtener ponderacion por cliente y cancha:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearPonderacion = async (req, res) => {
  const { calificacion, id_cliente, id_cancha } = req.body;

  if (!calificacion || !id_cliente || !id_cancha) {
    return res.status(400).json(response(false, 'Todos los campos son obligatorios'));
  }

  try {
    // Verificar que id_cliente existe en CLIENTE
    const clienteExistente = await pool.query('SELECT id_cliente FROM CLIENTE WHERE id_cliente = $1', [id_cliente]);
    if (!clienteExistente.rows[0]) {
      return res.status(404).json(response(false, 'Cliente no encontrado'));
    }

    // Verificar que id_cancha existe en CANCHA
    const canchaExistente = await pool.query('SELECT id_cancha FROM CANCHA WHERE id_cancha = $1', [id_cancha]);
    if (!canchaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Cancha no encontrada'));
    }

    // Validar calificacion
    if (calificacion < 1 || calificacion > 5) {
      return res.status(400).json(response(false, 'La calificacion debe estar entre 1 y 5'));
    }

    // Verificar si ya existe una ponderacion para este cliente y cancha (UNIQUE constraint)
    const ponderacionExistente = await getPonderacionByClienteAndCancha(id_cliente, id_cancha);
    if (ponderacionExistente) {
      return res.status(409).json(response(false, 'Ya existe una ponderacion para este cliente y cancha'));
    }

    const nuevaPonderacion = await createPonderacion(calificacion, id_cliente, id_cancha);
    res.status(201).json(response(true, 'Ponderacion creada exitosamente', nuevaPonderacion));
  } catch (error) {
    console.error('Error al crear ponderacion:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarPonderacion = async (req, res) => {
  const { id } = req.params;
  const { calificacion, id_cliente, id_cancha } = req.body;

  try {
    // Verificar que id_cliente existe si se proporciona
    if (id_cliente) {
      const clienteExistente = await pool.query('SELECT id_cliente FROM CLIENTE WHERE id_cliente = $1', [id_cliente]);
      if (!clienteExistente.rows[0]) {
        return res.status(404).json(response(false, 'Cliente no encontrado'));
      }
    }

    // Verificar que id_cancha existe si se proporciona
    if (id_cancha) {
      const canchaExistente = await pool.query('SELECT id_cancha FROM CANCHA WHERE id_cancha = $1', [id_cancha]);
      if (!canchaExistente.rows[0]) {
        return res.status(404).json(response(false, 'Cancha no encontrada'));
      }
    }

    // Validar calificacion si se proporciona
    if (calificacion && (calificacion < 1 || calificacion > 5)) {
      return res.status(400).json(response(false, 'La calificacion debe estar entre 1 y 5'));
    }

    // Si se cambia id_cliente y id_cancha, verificar unicidad
    if (id_cliente && id_cancha) {
      const ponderacionExistente = await getPonderacionByClienteAndCancha(id_cliente, id_cancha);
      if (ponderacionExistente && ponderacionExistente.id_ponderacion !== parseInt(id)) {
        return res.status(409).json(response(false, 'Ya existe una ponderacion para este cliente y cancha'));
      }
    }

    const ponderacionActualizada = await updatePonderacion(id, calificacion, id_cliente, id_cancha);
    if (!ponderacionActualizada) {
      return res.status(404).json(response(false, 'Ponderacion no encontrada'));
    }
    res.status(200).json(response(true, 'Ponderacion actualizada exitosamente', ponderacionActualizada));
  } catch (error) {
    console.error('Error al actualizar ponderacion:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarPonderacion = async (req, res) => {
  const { id } = req.params;

  try {
    const ponderacionEliminada = await deletePonderacion(id);
    if (!ponderacionEliminada) {
      return res.status(404).json(response(false, 'Ponderacion no encontrada'));
    }
    res.status(200).json(response(true, 'Ponderacion eliminada exitosamente'));
  } catch (error) {
    console.error('Error al eliminar ponderacion:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

//-------- Rutas --------- 
//------------------------
//------------------------

const router = express.Router();

router.post('/', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE']), crearPonderacion);

router.get('/datos-total', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), listarPonderaciones);
router.get('/id/:id', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerPonderacionPorId);
router.get('/cliente/:id_cliente', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE']), listarPonderacionesPorClienteId);
router.get('/cancha/:id_cancha', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), listarPonderacionesPorCanchaId);
router.get('/cancha/:id_cancha/promedio', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerPromedioCalificacionPorCanchaId);
router.get('/:id/cliente', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerClientePorPonderacionId);
router.get('/:id/cancha', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerCanchaPorPonderacionId);
router.get('/cliente/:id_cliente/cancha/:id_cancha', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE']), obtenerPonderacionPorClienteYCancha);

router.patch('/:id', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE']), actualizarPonderacion);
router.delete('/:id', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE']), eliminarPonderacion);

module.exports = router;