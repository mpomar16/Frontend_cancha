const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// --- Modelos ---
async function getAllReportes(limit = 12, offset = 0) {
  try {
    const query = `
      SELECT 
        r.id_reporte,
        r.detalle,
        r.sugerencia,
        r.id_encargado,
        r.id_reserva,
        -- Cliente asociado a la reserva (PK compartida)
        res.id_cliente AS id_cliente,
        ca.id_cancha AS id_cancha,
        p.usuario AS nombre_cliente,
        ca.nombre AS nombre_cancha,
        d.nombre AS nombre_disciplina,
        COALESCE(
          NULLIF(TRIM(CONCAT_WS(' ', pe.nombre, pe.apellido)), ''),
          NULLIF(pe.usuario, '')
        ) AS nombre_encargado
      FROM REPORTE_INCIDENCIA r
      JOIN RESERVA    res ON r.id_reserva   = res.id_reserva
      JOIN CLIENTE    cl  ON res.id_cliente = cl.id_cliente
      JOIN PERSONA    p   ON cl.id_cliente  = p.id_persona
      JOIN CANCHA     ca  ON res.id_cancha  = ca.id_cancha
      JOIN DISCIPLINA d   ON res.id_disciplina = d.id_disciplina
      JOIN ENCARGADO  e   ON r.id_encargado = e.id_encargado
      JOIN PERSONA    pe  ON e.id_encargado = pe.id_persona
      ORDER BY r.id_reporte DESC
      LIMIT $1 OFFSET $2
    `;

    // Traemos limit+1 para calcular hasMore en el controlador
    const result = await pool.query(query, [limit + 1, offset]);
    return result.rows; // devolvemos el arreglo crudo (lo corta el controlador)
  } catch (error) {
    throw new Error('Error al listar reportes: ' + error.message);
  }
}

async function getReporteById(id) {
  try {
    const query = `
      SELECT
        r.id_reporte,
        r.detalle,
        r.sugerencia,
        r.id_encargado,
        r.id_reserva,

        -- Nombres robustos (nombre+apellido si existen, o solo uno; si no, usuario)
        COALESCE(
          NULLIF(TRIM(CONCAT_WS(' ', pe.nombre, pe.apellido)), ''),
          NULLIF(pe.usuario, '')
        ) AS nombre_encargado,

        COALESCE(
          NULLIF(TRIM(CONCAT_WS(' ', pc.nombre, pc.apellido)), ''),
          NULLIF(pc.usuario, '')
        ) AS nombre_cliente,

        ca.nombre AS nombre_cancha

      FROM REPORTE_INCIDENCIA r
      JOIN ENCARGADO e  ON r.id_encargado = e.id_encargado
      JOIN PERSONA  pe  ON e.id_encargado = pe.id_persona  -- encargado → persona (PK compartida)

      JOIN RESERVA   res ON r.id_reserva   = res.id_reserva
      JOIN CLIENTE   cl  ON res.id_cliente = cl.id_cliente
      JOIN PERSONA   pc  ON cl.id_cliente  = pc.id_persona  -- cliente → persona (PK compartida)
      JOIN CANCHA    ca  ON res.id_cancha  = ca.id_cancha

      WHERE r.id_reporte = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener reporte por ID: ' + error.message);
  }
}

async function getEncargadoByReporteId(id) {
  try {
    const query = `
      SELECT e.id_encargado, e.responsabilidad, e.fecha_inicio, e.hora_ingreso, e.hora_salida, e.estado
      FROM ENCARGADO e
      JOIN REPORTE_INCIDENCIA r ON e.id_encargado = r.id_encargado
      WHERE r.id_reporte = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener encargado asociado al reporte: ' + error.message);
  }
}

async function getReservaByReporteId(id) {
  try {
    const query = `
      SELECT r.id_reserva, r.fecha_reserva, r.cupo, r.monto_total, r.saldo_pendiente, r.estado, r.id_cliente, r.id_cancha, r.id_disciplina
      FROM RESERVA r
      JOIN REPORTE_INCIDENCIA ri ON r.id_reserva = ri.id_reserva
      WHERE ri.id_reporte = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener reserva asociada al reporte: ' + error.message);
  }
}

async function getReportesByEncargadoId(id_encargado, limit = 12, offset = 0) {
  try {
    const query = `
      SELECT id_reporte, detalle, sugerencia, id_encargado, id_reserva
      FROM REPORTE_INCIDENCIA
      WHERE id_encargado = $1
      ORDER BY id_reporte DESC
      LIMIT $2 OFFSET $3
    `;
    // Traemos limit+1 para poder calcular hasMore en el controlador
    const result = await pool.query(query, [id_encargado, limit + 1, offset]);
    return result.rows; // el controlador hará el slice y el hasMore
  } catch (error) {
    throw new Error('Error al listar reportes por encargado: ' + error.message);
  }
}

async function getReportesByReservaId(id_reserva, limit = 12, offset = 0) {
  try {
    const query = `
      SELECT id_reporte, detalle, sugerencia, id_encargado, id_reserva
      FROM REPORTE_INCIDENCIA
      WHERE id_reserva = $1
      ORDER BY id_reporte DESC
      LIMIT $2 OFFSET $3
    `;
    // Traemos limit+1 para poder calcular hasMore en el controlador
    const result = await pool.query(query, [id_reserva, limit + 1, offset]);
    return result.rows; // el controlador hará el slice y el hasMore
  } catch (error) {
    throw new Error('Error al listar reportes por reserva: ' + error.message);
  }
}

async function createReporte(detalle, sugerencia, id_encargado, id_reserva) {
  try {
    const query = `
      INSERT INTO REPORTE_INCIDENCIA (detalle, sugerencia, id_encargado, id_reserva)
      VALUES ($1, $2, $3, $4)
      RETURNING id_reporte, detalle, sugerencia, id_encargado, id_reserva
    `;
    const values = [detalle, sugerencia, id_encargado, id_reserva];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear reporte: ' + error.message);
  }
}

async function updateReporte(id, detalle, sugerencia, id_encargado, id_reserva) {
  try {
    const query = `
      UPDATE REPORTE_INCIDENCIA
      SET detalle = COALESCE($1, detalle),
          sugerencia = COALESCE($2, sugerencia),
          id_encargado = COALESCE($3, id_encargado),
          id_reserva = COALESCE($4, id_reserva)
      WHERE id_reporte = $5
      RETURNING id_reporte, detalle, sugerencia, id_encargado, id_reserva
    `;
    const values = [detalle, sugerencia, id_encargado, id_reserva, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar reporte: ' + error.message);
  }
}

async function deleteReporte(id) {
  try {
    const query = `
      DELETE FROM REPORTE_INCIDENCIA
      WHERE id_reporte = $1
      RETURNING id_reporte, detalle, sugerencia, id_encargado, id_reserva
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar reporte: ' + error.message);
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

const listarReportes = async (req, res) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit ?? '12', 10));
    const offset = Math.max(0, parseInt(req.query.offset ?? '0', 10));

    const rows = await getAllReportes(limit, offset);
    const hasMore = rows.length > limit;
    const reportes = hasMore ? rows.slice(0, limit) : rows;

    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    return res.status(200).json(response(true, 'Lista de reportes obtenida', {
      reportes,
      hasMore,
      limit,
      offset,
    }));
  } catch (error) {
    console.error('Error al listar reportes:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerReportePorId = async (req, res) => {
  const { id } = req.params;
  console.log("ID recibido:", id);

  try {
    const reporte = await getReporteById(id);
    
    if (!reporte) {
      return res.status(404).json(response(false, 'Reporte no encontrado'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Reporte obtenido', reporte));
  } catch (error) {
    console.error('Error al obtener reporte por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerEncargadoPorReporteId = async (req, res) => {
  const { id } = req.params;

  try {
    const encargado = await getEncargadoByReporteId(id);
    if (!encargado) {
      return res.status(404).json(response(false, 'Encargado no encontrado'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Encargado obtenido', encargado));
  } catch (error) {
    console.error('Error al obtener encargado asociado al reporte:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerReservaPorReporteId = async (req, res) => {
  const { id } = req.params;

  try {
    const reserva = await getReservaByReporteId(id);
    if (!reserva) {
      return res.status(404).json(response(false, 'Reserva no encontrada'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Reserva obtenida', reserva));
  } catch (error) {
    console.error('Error al obtener reserva asociada al reporte:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarReportesPorEncargadoId = async (req, res) => {
  const { id_encargado } = req.params;

  try {
    const limit = Math.max(1, parseInt(req.query.limit ?? '12', 10));
    const offset = Math.max(0, parseInt(req.query.offset ?? '0', 10));

    const rows = await getReportesByEncargadoId(id_encargado, limit, offset);
    const hasMore = rows.length > limit;
    const reportes = hasMore ? rows.slice(0, limit) : rows;

    if (!reportes.length) {
      // Si prefieres 200 con lista vacía en paginado, cambia esto por un 200.
      return res.status(404).json(response(false, 'No se encontraron reportes para este encargado'));
    }

    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    return res.status(200).json(response(true, 'Reportes obtenidos por encargado', {
      reportes,
      hasMore,
      limit,
      offset,
    }));
  } catch (error) {
    console.error('Error al listar reportes por encargado:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarReportesPorReservaId = async (req, res) => {
  const { id_reserva } = req.params;

  try {
    const limit = Math.max(1, parseInt(req.query.limit ?? '12', 10));
    const offset = Math.max(0, parseInt(req.query.offset ?? '0', 10));

    const rows = await getReportesByReservaId(id_reserva, limit, offset);
    const hasMore = rows.length > limit;
    const reportes = hasMore ? rows.slice(0, limit) : rows;

    if (!reportes.length) {
      // Si prefieres 200 con lista vacía en paginado, cambia esto por un 200.
      return res.status(404).json(response(false, 'No se encontraron reportes para esta reserva'));
    }

    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    return res.status(200).json(response(true, 'Reportes obtenidos por reserva', {
      reportes,
      hasMore,
      limit,
      offset,
    }));
  } catch (error) {
    console.error('Error al listar reportes por reserva:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearReporte = async (req, res) => {
  const { detalle, sugerencia, id_encargado, id_reserva } = req.body;

  if (!detalle || !id_encargado || !id_reserva) {
    return res.status(400).json(response(false, 'Detalle, id_encargado e id_reserva son obligatorios'));
  }

  try {
    // Verificar que id_encargado existe en ENCARGADO
    const encargadoExistente = await pool.query('SELECT id_encargado FROM ENCARGADO WHERE id_encargado = $1', [id_encargado]);
    if (!encargadoExistente.rows[0]) {
      return res.status(404).json(response(false, 'Encargado no encontrado'));
    }

    // Verificar que id_reserva existe en RESERVA
    const reservaExistente = await pool.query('SELECT id_reserva FROM RESERVA WHERE id_reserva = $1', [id_reserva]);
    if (!reservaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Reserva no encontrada'));
    }

    const nuevoReporte = await createReporte(detalle, sugerencia, id_encargado, id_reserva);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(201).json(response(true, 'Reporte creado exitosamente', nuevoReporte));
  } catch (error) {
    console.error('Error al crear reporte:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarReporte = async (req, res) => {
  const { id } = req.params;
  const { detalle, sugerencia, id_encargado, id_reserva } = req.body;

  try {
    // Verificar que id_encargado existe si se proporciona
    if (id_encargado) {
      const encargadoExistente = await pool.query('SELECT id_encargado FROM ENCARGADO WHERE id_encargado = $1', [id_encargado]);
      if (!encargadoExistente.rows[0]) {
        return res.status(404).json(response(false, 'Encargado no encontrado'));
      }
    }

    // Verificar que id_reserva existe si se proporciona
    if (id_reserva) {
      const reservaExistente = await pool.query('SELECT id_reserva FROM RESERVA WHERE id_reserva = $1', [id_reserva]);
      if (!reservaExistente.rows[0]) {
        return res.status(404).json(response(false, 'Reserva no encontrada'));
      }
    }

    const reporteActualizado = await updateReporte(id, detalle, sugerencia, id_encargado, id_reserva);
    if (!reporteActualizado) {
      return res.status(404).json(response(false, 'Reporte no encontrado'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Reporte actualizado exitosamente', reporteActualizado));
  } catch (error) {
    console.error('Error al actualizar reporte:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarReporte = async (req, res) => {
  const { id } = req.params;

  try {
    const reporteEliminado = await deleteReporte(id);
    if (!reporteEliminado) {
      return res.status(404).json(response(false, 'Reporte no encontrado'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Reporte eliminado exitosamente'));
  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

//-------- Rutas --------- 
//------------------------
//------------------------

const router = express.Router();

router.post('/', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), crearReporte);

router.get('/datos-total', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), listarReportes);
router.get('/id/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), obtenerReportePorId);
router.get('/encargado/:id_encargado', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), listarReportesPorEncargadoId);
router.get('/reserva/:id_reserva', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), listarReportesPorReservaId);
router.get('/:id/encargado', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), obtenerEncargadoPorReporteId);
router.get('/:id/reserva', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), obtenerReservaPorReporteId);

router.patch('/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), actualizarReporte);
router.delete('/:id', verifyToken, checkRole(['ADMINISTRADOR']), eliminarReporte);

module.exports = router;