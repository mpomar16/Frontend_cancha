const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// --- Modelos ---
async function getAllParticipaEn() {
  try {
    const query = `
      SELECT id_deportista, id_reserva, fecha_reserva, estado_participacion
      FROM PARTICIPA_EN
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar relaciones deportista-reserva: ' + error.message);
  }
}

async function getParticipaEnById(id_deportista, id_reserva) {
  try {
    const query = `
      SELECT id_deportista, id_reserva, fecha_reserva, estado_participacion
      FROM PARTICIPA_EN
      WHERE id_deportista = $1 AND id_reserva = $2
    `;
    const result = await pool.query(query, [id_deportista, id_reserva]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener relación deportista-reserva por ID: ' + error.message);
  }
}

async function getReservasByDeportistaId(id_deportista) {
  try {
    const query = `
      SELECT r.id_reserva, r.fecha_reserva, r.cupo, r.monto_total, r.saldo_pendiente, r.estado, r.id_cliente, r.id_cancha, r.id_disciplina
      FROM RESERVA r
      JOIN PARTICIPA_EN pe ON r.id_reserva = pe.id_reserva
      WHERE pe.id_deportista = $1
    `;
    const result = await pool.query(query, [id_deportista]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar reservas por deportista: ' + error.message);
  }
}

async function getDeportistasByReservaId(id_reserva) {
  try {
    const query = `
      SELECT d.id_deportista, d.nivel, d.disciplina_principal,
            p.id_persona, p.nombre, p.apellido, p.correo
      FROM DEPORTISTA d
      JOIN PARTICIPA_EN pe ON d.id_deportista = pe.id_deportista
      JOIN PERSONA p ON d.id_deportista = p.id_persona
      WHERE pe.id_reserva = $1;
    `;
    const result = await pool.query(query, [id_reserva]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar deportistas por reserva: ' + error.message);
  }
}

async function getParticipaEnByEstado(estado) {
  try {
    const query = `
      SELECT id_deportista, id_reserva, fecha_reserva, estado_participacion
      FROM PARTICIPA_EN
      WHERE estado_participacion = $1
    `;
    const result = await pool.query(query, [estado]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar relaciones por estado: ' + error.message);
  }
}

async function createParticipaEn(id_deportista, id_reserva, fecha_reserva, estado_participacion) {
  try {
    const query = `
      INSERT INTO PARTICIPA_EN (id_deportista, id_reserva, fecha_reserva, estado_participacion)
      VALUES ($1, $2, $3, $4)
      RETURNING id_deportista, id_reserva, fecha_reserva, estado_participacion
    `;
    const values = [id_deportista, id_reserva, fecha_reserva, estado_participacion];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear relación deportista-reserva: ' + error.message);
  }
}

async function updateParticipaEn(id_deportista, id_reserva, fecha_reserva, estado_participacion) {
  try {
    const query = `
      UPDATE PARTICIPA_EN
      SET fecha_reserva = COALESCE($1, fecha_reserva),
          estado_participacion = COALESCE($2, estado_participacion)
      WHERE id_deportista = $3 AND id_reserva = $4
      RETURNING id_deportista, id_reserva, fecha_reserva, estado_participacion
    `;
    const values = [fecha_reserva, estado_participacion, id_deportista, id_reserva];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar relación deportista-reserva: ' + error.message);
  }
}

async function deleteParticipaEn(id_deportista, id_reserva) {
  try {
    const query = `
      DELETE FROM PARTICIPA_EN
      WHERE id_deportista = $1 AND id_reserva = $2
      RETURNING id_deportista, id_reserva, fecha_reserva, estado_participacion
    `;
    const result = await pool.query(query, [id_deportista, id_reserva]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar relación deportista-reserva: ' + error.message);
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

const listarParticipaEn = async (req, res) => {
  try {
    const relaciones = await getAllParticipaEn();
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Lista de relaciones deportista-reserva obtenida', relaciones));
  } catch (error) {
    console.error('Error al listar relaciones deportista-reserva:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerParticipaEnPorId = async (req, res) => {
  const { id_deportista, id_reserva } = req.params;

  try {
    const relacion = await getParticipaEnById(id_deportista, id_reserva);
    if (!relacion) {
      return res.status(404).json(response(false, 'Relación deportista-reserva no encontrada'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Relación deportista-reserva obtenida', relacion));
  } catch (error) {
    console.error('Error al obtener relación deportista-reserva por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarReservasPorDeportistaId = async (req, res) => {
  const { id_deportista } = req.params;

  try {
    const reservas = await getReservasByDeportistaId(id_deportista);
    if (!reservas.length) {
      return res.status(404).json(response(false, 'No se encontraron reservas para este deportista'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Reservas obtenidas por deportista', reservas));
  } catch (error) {
    console.error('Error al listar reservas por deportista:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarDeportistasPorReservaId = async (req, res) => {
  const { id_reserva } = req.params;

  try {
    const deportistas = await getDeportistasByReservaId(id_reserva);
    if (!deportistas.length) {
      return res.status(404).json(response(false, 'No se encontraron deportistas para esta reserva'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Deportistas obtenidos por reserva', deportistas));
  } catch (error) {
    console.error('Error al listar deportistas por reserva:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarParticipaEnPorEstado = async (req, res) => {
  const { estado } = req.params;

  try {
    const relaciones = await getParticipaEnByEstado(estado);
    if (!relaciones.length) {
      return res.status(404).json(response(false, 'No se encontraron relaciones para este estado'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Relaciones obtenidas por estado', relaciones));
  } catch (error) {
    console.error('Error al listar relaciones por estado:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearParticipaEn = async (req, res) => {
  const { id_deportista, id_reserva, fecha_reserva, estado_participacion } = req.body;

  if (!id_deportista || !id_reserva || !fecha_reserva || !estado_participacion) {
    return res.status(400).json(response(false, 'Todos los campos son obligatorios'));
  }

  try {
    // Verificar que id_deportista existe en DEPORTISTA
    const deportistaExistente = await pool.query('SELECT id_deportista FROM DEPORTISTA WHERE id_deportista = $1', [id_deportista]);
    if (!deportistaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Deportista no encontrado'));
    }

    // Verificar que id_reserva existe en RESERVA
    const reservaExistente = await pool.query('SELECT id_reserva, cupo FROM RESERVA WHERE id_reserva = $1', [id_reserva]);
    if (!reservaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Reserva no encontrada'));
    }

    // Validar estado_participacion
    const validEstados = ['confirmado', 'pendiente', 'cancelado'];
    if (!validEstados.includes(estado_participacion)) {
      return res.status(400).json(response(false, 'Estado de participación inválido. Debe ser: confirmado, pendiente o cancelado'));
    }

    // Verificar que no exista una relación duplicada
    const relacionExistente = await pool.query('SELECT id_deportista FROM PARTICIPA_EN WHERE id_deportista = $1 AND id_reserva = $2', [id_deportista, id_reserva]);
    if (relacionExistente.rows[0]) {
      return res.status(400).json(response(false, 'La relación deportista-reserva ya existe'));
    }

    // Verificar límite de cupo
    const participantes = await pool.query('SELECT COUNT(*) as total FROM PARTICIPA_EN WHERE id_reserva = $1 AND estado_participacion = $2', [id_reserva, 'confirmado']);
    const totalParticipantes = parseInt(participantes.rows[0].total);
    const cupoReserva = reservaExistente.rows[0].cupo;

    if (estado_participacion === 'confirmado' && totalParticipantes >= cupoReserva) {
      return res.status(400).json(response(false, 'El cupo de la reserva está lleno'));
    }

    const nuevaRelacion = await createParticipaEn(id_deportista, id_reserva, fecha_reserva, estado_participacion);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(201).json(response(true, 'Relación deportista-reserva creada exitosamente', nuevaRelacion));
  } catch (error) {
    console.error('Error al crear relación deportista-reserva:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarParticipaEn = async (req, res) => {
  const { id_deportista, id_reserva } = req.params;
  const { fecha_reserva, estado_participacion } = req.body;

  try {
    // Validar estado_participacion si se proporciona
    if (estado_participacion) {
      const validEstados = ['confirmado', 'pendiente', 'cancelado'];
      if (!validEstados.includes(estado_participacion)) {
        return res.status(400).json(response(false, 'Estado de participación inválido. Debe ser: confirmado, pendiente o cancelado'));
      }

      // Verificar límite de cupo si se actualiza a confirmado
      if (estado_participacion === 'confirmado') {
        const reservaExistente = await pool.query('SELECT cupo FROM RESERVA WHERE id_reserva = $1', [id_reserva]);
        if (!reservaExistente.rows[0]) {
          return res.status(404).json(response(false, 'Reserva no encontrada'));
        }

        const participantes = await pool.query('SELECT COUNT(*) as total FROM PARTICIPA_EN WHERE id_reserva = $1 AND estado_participacion = $2', [id_reserva, 'confirmado']);
        const totalParticipantes = parseInt(participantes.rows[0].total);
        const cupoReserva = reservaExistente.rows[0].cupo;

        const relacionActual = await getParticipaEnById(id_deportista, id_reserva);
        if (!relacionActual) {
          return res.status(404).json(response(false, 'Relación deportista-reserva no encontrada'));
        }

        if (relacionActual.estado_participacion !== 'confirmado' && totalParticipantes >= cupoReserva) {
          return res.status(400).json(response(false, 'El cupo de la reserva está lleno'));
        }
      }
    }

    const relacionActualizada = await updateParticipaEn(id_deportista, id_reserva, fecha_reserva, estado_participacion);
    if (!relacionActualizada) {
      return res.status(404).json(response(false, 'Relación deportista-reserva no encontrada'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Relación deportista-reserva actualizada exitosamente', relacionActualizada));
  } catch (error) {
    console.error('Error al actualizar relación deportista-reserva:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarParticipaEn = async (req, res) => {
  const { id_deportista, id_reserva } = req.params;

  try {
    const relacionEliminada = await deleteParticipaEn(id_deportista, id_reserva);
    if (!relacionEliminada) {
      return res.status(404).json(response(false, 'Relación deportista-reserva no encontrada'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Relación deportista-reserva eliminada exitosamente'));
  } catch (error) {
    console.error('Error al eliminar relación deportista-reserva:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};


//-------- Rutas --------- 
//------------------------
//------------------------

const router = express.Router();

router.post('/', verifyToken, checkRole(['CLIENTE', 'ADMINISTRADOR']), crearParticipaEn);

router.get('/datos-total', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'ENCARGADO']), listarParticipaEn);
router.get('/deportista/:id_deportista', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'ENCARGADO']), listarReservasPorDeportistaId);
router.get('/reserva/:id_reserva', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'ENCARGADO']), listarDeportistasPorReservaId);
router.get('/estado/:estado', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'ENCARGADO']), listarParticipaEnPorEstado);
router.get('/:id_deportista/:id_reserva', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'ENCARGADO']), obtenerParticipaEnPorId);

router.patch('/:id_deportista/:id_reserva', verifyToken, checkRole(['CLIENTE', 'ADMINISTRADOR']), actualizarParticipaEn);
router.delete('/:id_deportista/:id_reserva', verifyToken, checkRole(['CLIENTE', 'ADMINISTRADOR']), eliminarParticipaEn);

module.exports = router;
