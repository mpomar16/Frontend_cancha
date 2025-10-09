const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// --- Modelos ---
// --- Modelos ---
async function getAllReservas(limit = 12, offset = 0) {
  try {
    const query = `
      SELECT
        r.id_reserva,
        r.fecha_reserva,
        r.cupo,
        r.monto_total,
        r.saldo_pendiente,
        r.estado,
        r.id_cliente,
        r.id_cancha,
        r.id_disciplina,

        -- nombre cliente robusto (nombre o apellido o usuario)
        COALESCE(
          NULLIF(TRIM(CONCAT_WS(' ', pc.nombre, pc.apellido)), ''),
          NULLIF(pc.usuario, '')
        ) AS nombre_cliente,

        ca.nombre AS nombre_cancha
      FROM RESERVA r
      JOIN CLIENTE cl ON r.id_cliente = cl.id_cliente
      JOIN PERSONA pc ON cl.id_cliente = pc.id_persona
      JOIN CANCHA  ca ON r.id_cancha  = ca.id_cancha
      ORDER BY r.id_reserva DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  } catch (error) {
    // Log explícito para ver la causa real en consola
    console.error('getAllReservas() ERROR:', error.message);
    throw new Error('Error al listar reservas: ' + error.message);
  }
}

async function getReservaById(id) {
  try {
    const query = `
      SELECT id_reserva, fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina
      FROM RESERVA
      WHERE id_reserva = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener reserva por ID: ' + error.message);
  }
}

async function createReserva(fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina) {
  try {
    const query = `
      INSERT INTO RESERVA (fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id_reserva, fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina
    `;
    const values = [fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear reserva: ' + error.message);
  }
}

async function updateReserva(id, fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina) {
  try {
    const query = `
      UPDATE RESERVA
      SET fecha_reserva = COALESCE($1, fecha_reserva),
          cupo = COALESCE($2, cupo),
          monto_total = COALESCE($3, monto_total),
          saldo_pendiente = COALESCE($4, saldo_pendiente),
          estado = COALESCE($5, estado),
          id_cliente = COALESCE($6, id_cliente),
          id_cancha = COALESCE($7, id_cancha),
          id_disciplina = COALESCE($8, id_disciplina)
      WHERE id_reserva = $9
      RETURNING id_reserva, fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina
    `;
    const values = [fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar reserva: ' + error.message);
  }
}

async function deleteReserva(id) {
  try {
    const query = `
      DELETE FROM RESERVA
      WHERE id_reserva = $1
      RETURNING id_reserva, fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar reserva: ' + error.message);
  }
}
async function getEstadoReservaEnumValues() {
  try {
    const query = `
      SELECT e.enumlabel AS value
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'estado_reserva_enum'
      ORDER BY e.enumsortorder
    `;
    const result = await pool.query(query);
    return result.rows.map(row => row.value);
  } catch (error) {
    throw new Error('Error al obtener valores de estado_reserva_enum: ' + error.message);
  }
}


// Obtener todos los horarios de una cancha en una fecha
async function getHorariosCancha(id_cancha, fecha) {
  const horariosCanchaQuery = `
    SELECT rh.id_horario, rh.hora_inicio, rh.hora_fin,
           CASE WHEN r.estado IS NOT NULL THEN 'ocupado' ELSE 'libre' END AS estado
    FROM RESERVA_HORARIO rh
    LEFT JOIN RESERVA r ON rh.id_reserva = r.id_reserva AND r.fecha_reserva = $2
    WHERE rh.id_reserva IN (
      SELECT id_reserva FROM RESERVA WHERE id_cancha = $1 AND fecha_reserva = $2
    )
    ORDER BY rh.hora_inicio
  `;
  const result = await pool.query(horariosCanchaQuery, [id_cancha, fecha]);
  return result.rows;
}

// Crear reserva
async function createReserva({ id_cliente, id_cancha, id_disciplina, fecha, cupo, monto_total }) {
  const query = `
    INSERT INTO RESERVA (id_cliente, id_cancha, id_disciplina, fecha_reserva, cupo, monto_total, saldo_pendiente, estado)
    VALUES ($1, $2, $3, $4, $5, $6, $6, 'pendiente')
    RETURNING *
  `;
  const values = [id_cliente, id_cancha, id_disciplina, fecha, cupo, monto_total];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// Insertar múltiples horarios de reserva desde un array
async function createMultipleReservaHorarios(id_reserva, fecha, horarios) {
  try {
    const values = horarios.map(h => `(${id_reserva}, $1, '${h.hora_inicio}', '${h.hora_fin}', ${h.monto || null})`).join(',');
    const query = `
      INSERT INTO RESERVA_HORARIO (id_reserva, fecha, hora_inicio, hora_fin, monto)
      VALUES ${values}
      RETURNING id_horario, id_reserva, fecha, hora_inicio, hora_fin, monto
    `;
    const result = await pool.query(query, [fecha]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al crear horarios de reserva: ' + error.message);
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

const listarReservas = async (req, res) => {
  try {
    const limitQ = parseInt(req.query.limit, 10);
    const offsetQ = parseInt(req.query.offset, 10);
    const limit  = Number.isFinite(limitQ) && limitQ > 0 ? limitQ : 12;
    const offset = Number.isFinite(offsetQ) && offsetQ >= 0 ? offsetQ : 0;

    // Pedimos limit+1 para saber si hay más
    const rowsPlus = await getAllReservas(limit + 1, offset);
    const hasMore = rowsPlus.length > limit;
    const reservas = hasMore ? rowsPlus.slice(0, limit) : rowsPlus;

    console.log(
      `✅ [${req.method}] ${req.originalUrl} OK -> limit=${limit}, offset=${offset}, hasMore=${hasMore}`
    );

    res.status(200).json({
      success: true,
      message: 'Lista de reservas obtenida',
      data: { reservas, hasMore, limit, offset },
    });
  } catch (error) {
    console.error('Error al listar reservas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const obtenerReservaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const reserva = await getReservaById(id);
    if (!reserva) {
      return res.status(404).json(response(false, 'Reserva no encontrada'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Reserva obtenida', reserva));
  } catch (error) {
    console.error('Error al obtener reserva por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

// Reescritura: crearReserva (usa validación del enum y disponibilidad)
const crearReserva = async (req, res) => {
  const { fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina } = req.body;

  if (!fecha_reserva || !cupo || !monto_total || !estado || !id_cliente || !id_cancha || !id_disciplina) {
    return res.status(400).json(response(false, 'Todos los campos son obligatorios'));
  }

  try {
    // Validar estado de la reserva contra enum de la base de datos
    const validEstadosReserva = await getEstadoReservaEnumValues();
    if (!validEstadosReserva.includes(estado)) {
      return res.status(400).json(response(false, `Estado inválido. Debe ser uno de: ${validEstadosReserva.join(', ')}`));
    }

    // Verificar cliente
    const clienteExistente = await pool.query('SELECT id_cliente FROM CLIENTE WHERE id_cliente = $1', [id_cliente]);
    if (!clienteExistente.rows[0]) return res.status(404).json(response(false, 'Cliente no encontrado'));

    // Verificar cancha
    const canchaRes = await pool.query('SELECT id_cancha, capacidad, estado FROM CANCHA WHERE id_cancha = $1', [id_cancha]);
    if (!canchaRes.rows[0]) return res.status(404).json(response(false, 'Cancha no encontrada'));
    const cancha = canchaRes.rows[0];

    // Solo permitir reservar si la cancha está disponible
    if (cancha.estado !== 'disponible') {
      return res.status(400).json(response(false, `La cancha no está disponible para reservar. Estado actual: ${cancha.estado}`));
    }

    // Verificar disciplina
    const disciplinaExistente = await pool.query('SELECT id_disciplina FROM DISCIPLINA WHERE id_disciplina = $1', [id_disciplina]);
    if (!disciplinaExistente.rows[0]) return res.status(404).json(response(false, 'Disciplina no encontrada'));

    // Validar cupo y montos
    if (cupo <= 0 || cupo > cancha.capacidad) {
      return res.status(400).json(response(false, `El cupo debe ser mayor que 0 y menor o igual a ${cancha.capacidad}`));
    }
    if (monto_total <= 0) {
      return res.status(400).json(response(false, 'El monto total debe ser mayor que 0'));
    }
    if (saldo_pendiente < 0 || saldo_pendiente > monto_total) {
      return res.status(400).json(response(false, 'El saldo pendiente debe estar entre 0 y el monto total'));
    }

    // Crear reserva
    const nuevaReserva = await createReserva(fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(201).json(response(true, 'Reserva creada exitosamente', nuevaReserva));
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarReserva = async (req, res) => {
  const { id } = req.params;
  const { fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina } = req.body;

  try {
    // Verificar cliente si se proporciona
    if (id_cliente) {
      const clienteExistente = await pool.query('SELECT id_cliente FROM CLIENTE WHERE id_cliente = $1', [id_cliente]);
      if (!clienteExistente.rows[0]) return res.status(404).json(response(false, 'Cliente no encontrado'));
    }

    // Verificar cancha si se proporciona
    let capacidadCancha = null;
    if (id_cancha) {
      const canchaRes = await pool.query('SELECT id_cancha, capacidad, estado FROM CANCHA WHERE id_cancha = $1', [id_cancha]);
      if (!canchaRes.rows[0]) return res.status(404).json(response(false, 'Cancha no encontrada'));
      const cancha = canchaRes.rows[0];

      // Solo permitir si la cancha está disponible
      if (cancha.estado !== 'disponible') {
        return res.status(400).json(response(false, `La cancha seleccionada no está disponible. Estado actual: ${cancha.estado}`));
      }

      capacidadCancha = cancha.capacidad;
    }

    // Verificar disciplina si se proporciona
    if (id_disciplina) {
      const disciplinaExistente = await pool.query('SELECT id_disciplina FROM DISCIPLINA WHERE id_disciplina = $1', [id_disciplina]);
      if (!disciplinaExistente.rows[0]) return res.status(404).json(response(false, 'Disciplina no encontrada'));
    }

    // Validar cupo si se proporciona y si se cambió la cancha
    if (cupo !== undefined) {
      const capacidad = capacidadCancha || (await pool.query('SELECT capacidad FROM CANCHA c JOIN RESERVA r ON c.id_cancha = r.id_cancha WHERE r.id_reserva = $1', [id])).rows[0].capacidad;
      if (cupo <= 0 || cupo > capacidad) {
        return res.status(400).json(response(false, `El cupo debe ser mayor que 0 y menor o igual a ${capacidad}`));
      }
    }

    // Validar montos si se proporcionan
    if (monto_total !== undefined && monto_total <= 0) {
      return res.status(400).json(response(false, 'El monto total debe ser mayor que 0'));
    }
    if (saldo_pendiente !== undefined && (saldo_pendiente < 0 || (monto_total !== undefined && saldo_pendiente > monto_total))) {
      return res.status(400).json(response(false, 'El saldo pendiente debe estar entre 0 y el monto total'));
    }

    // Validar estado de la reserva si se proporciona (usando enum de la DB)
    if (estado) {
      const validEstadosReserva = await getEstadoReservaEnumValues();
      if (!validEstadosReserva.includes(estado)) {
        return res.status(400).json(response(false, `Estado inválido. Debe ser uno de: ${validEstadosReserva.join(', ')}`));
      }
    }

    // Actualizar reserva
    const reservaActualizada = await updateReserva(id, fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina);
    if (!reservaActualizada) return res.status(404).json(response(false, 'Reserva no encontrada'));

    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Reserva actualizada exitosamente', reservaActualizada));
  } catch (error) {
    console.error('Error al actualizar reserva:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarReserva = async (req, res) => {
  const { id } = req.params;

  try {
    const reservaEliminada = await deleteReserva(id);
    if (!reservaEliminada) {
      return res.status(404).json(response(false, 'Reserva no encontrada'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Reserva eliminada exitosamente'));
  } catch (error) {
    console.error('Error al eliminar reserva:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarEstadoReservaEnum = async (req, res) => {
  try {
    const valores = await getEstadoReservaEnumValues();
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json({ success: true,
      message: 'Valores de estado_reserva_enum obtenidos correctamente',
      data: valores,
    });
  } catch (error) {
    console.error('Error al listar estado_reserva_enum:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};


const listarHorariosCanchaCtrl = async (req, res) => {
  try {
    const { id_cancha, fecha } = req.params;
    const horarios = await getHorariosCancha(id_cancha, fecha);
    res.status(200).json(response(true, 'Horarios de la cancha', horarios));
  } catch (error) {
    console.error(error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearReservaCtrl = async (req, res) => {
  try {
    const { id_disciplina, fecha, cupo, bloques, monto_total } = req.body;
    const id_cliente = req.user.id_cliente; // asumimos que viene del token

    if (!id_cliente || !fecha || !cupo || !bloques || !monto_total) {
      return res.status(400).json(response(false, 'Datos incompletos'));
    }

    // Crear reserva
    const reserva = await createReserva({ id_cliente, id_cancha: bloques[0].id_cancha, id_disciplina, fecha, cupo, monto_total });

    // Crear horarios
    const bloquesConMonto = bloques.map(b => ({ ...b, monto: monto_total / bloques.length }));
    const horarios = await createReservaHorarios(reserva.id_reserva, fecha, bloquesConMonto);

    res.status(201).json(response(true, 'Reserva creada exitosamente', { reserva, horarios }));
  } catch (error) {
    console.error(error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearMultipleHorariosCtrl = async (req, res) => {
  try {
    const { id_reserva, fecha, horarios } = req.body;

    if (!id_reserva || !fecha || !horarios || !Array.isArray(horarios) || !horarios.length) {
      return res.status(400).json(response(false, 'id_reserva, fecha y horarios (array no vacío) son obligatorios'));
    }

    // Validar que la reserva existe y pertenece al cliente autenticado
    const reservaExistente = await pool.query(
      'SELECT id_reserva, id_cliente FROM RESERVA WHERE id_reserva = $1',
      [id_reserva]
    );
    if (!reservaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Reserva no encontrada'));
    }
    if (reservaExistente.rows[0].id_cliente !== req.user.id_cliente) {
      return res.status(403).json(response(false, 'No autorizado para modificar esta reserva'));
    }

    // Validar formato de horarios
    for (const horario of horarios) {
      if (!horario.hora_inicio || !horario.hora_fin) {
        return res.status(400).json(response(false, 'Cada horario debe incluir hora_inicio y hora_fin'));
      }
      // Validar formato de hora (HH:MM:SS)
      const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
      if (!timeRegex.test(horario.hora_inicio) || !timeRegex.test(horario.hora_fin)) {
        return res.status(400).json(response(false, 'Formato de hora inválido (debe ser HH:MM:SS)'));
      }
    }

    // Crear horarios
    const nuevosHorarios = await createMultipleReservaHorarios(id_reserva, fecha, horarios);

    res.status(201).json(response(true, 'Horarios creados exitosamente', nuevosHorarios));
  } catch (error) {
    console.error('Error al crear horarios:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

//-------- Rutas --------- 
//------------------------
//------------------------

const router = express.Router();

router.post('/', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE']), crearReserva);

router.get('/datos-total', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), listarReservas);
router.get('/id/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerReservaPorId);
router.get('/estado-reserva-enum', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE']), listarEstadoReservaEnum);

router.get('/horarios/:id_cancha/:fecha', verifyToken, listarHorariosCanchaCtrl);
router.post('/reserva', verifyToken, crearReservaCtrl);
router.post('/reserva-horarios', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'DEPORTISTA']), crearMultipleHorariosCtrl);


router.patch('/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE']), actualizarReserva);
router.delete('/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE']), eliminarReserva);

module.exports = router;