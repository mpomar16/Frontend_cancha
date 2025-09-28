const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// --- Modelos ---
async function getAllPagos() {
  try {
    const query = `
      SELECT id_pago, tipo_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva
      FROM PAGO
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar pagos: ' + error.message);
  }
}

async function getPagoById(id) {
  try {
    const query = `
      SELECT id_pago, tipo_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva
      FROM PAGO
      WHERE id_pago = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener pago por ID: ' + error.message);
  }
}

async function getReservaByPagoId(id) {
  try {
    const query = `
      SELECT r.id_reserva, r.fecha_reserva, r.cupo, r.monto_total, r.saldo_pendiente, r.estado, r.id_cliente, r.id_cancha, r.id_disciplina
      FROM RESERVA r
      JOIN PAGO p ON r.id_reserva = p.id_reserva
      WHERE p.id_pago = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener reserva asociada al pago: ' + error.message);
  }
}

async function getPagosByReservaId(id_reserva) {
  try {
    const query = `
      SELECT id_pago, tipo_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva
      FROM PAGO
      WHERE id_reserva = $1
    `;
    const result = await pool.query(query, [id_reserva]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar pagos por reserva: ' + error.message);
  }
}

async function getPagosByEstado(estado) {
  try {
    const query = `
      SELECT id_pago, tipo_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva
      FROM PAGO
      WHERE estado_pago = $1
    `;
    const result = await pool.query(query, [estado]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar pagos por estado: ' + error.message);
  }
}

async function getPagosByMetodo(metodo) {
  try {
    const query = `
      SELECT id_pago, tipo_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva
      FROM PAGO
      WHERE metodo_pago = $1
    `;
    const result = await pool.query(query, [metodo]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar pagos por método: ' + error.message);
  }
}

async function createPago(tipo_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva) {
  try {
    const query = `
      INSERT INTO PAGO (tipo_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id_pago, tipo_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva
    `;
    const values = [tipo_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear pago: ' + error.message);
  }
}

async function updatePago(id, tipo_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva) {
  try {
    const query = `
      UPDATE PAGO
      SET tipo_pago = COALESCE($1, tipo_pago),
          monto = COALESCE($2, monto),
          metodo_pago = COALESCE($3, metodo_pago),
          fecha_pago = COALESCE($4, fecha_pago),
          estado_pago = COALESCE($5, estado_pago),
          id_reserva = COALESCE($6, id_reserva)
      WHERE id_pago = $7
      RETURNING id_pago, tipo_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva
    `;
    const values = [tipo_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar pago: ' + error.message);
  }
}

async function deletePago(id) {
  try {
    const query = `
      DELETE FROM PAGO
      WHERE id_pago = $1
      RETURNING id_pago, tipo_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar pago: ' + error.message);
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

const listarPagos = async (req, res) => {
  try {
    const pagos = await getAllPagos();
    res.status(200).json(response(true, 'Lista de pagos obtenida', pagos));
  } catch (error) {
    console.error('Error al listar pagos:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerPagoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const pago = await getPagoById(id);
    if (!pago) {
      return res.status(404).json(response(false, 'Pago no encontrado'));
    }
    res.status(200).json(response(true, 'Pago obtenido', pago));
  } catch (error) {
    console.error('Error al obtener pago por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerReservaPorPagoId = async (req, res) => {
  const { id } = req.params;

  try {
    const reserva = await getReservaByPagoId(id);
    if (!reserva) {
      return res.status(404).json(response(false, 'Reserva no encontrada'));
    }
    res.status(200).json(response(true, 'Reserva obtenida', reserva));
  } catch (error) {
    console.error('Error al obtener reserva asociada al pago:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarPagosPorReservaId = async (req, res) => {
  const { id_reserva } = req.params;

  try {
    const pagos = await getPagosByReservaId(id_reserva);
    if (!pagos.length) {
      return res.status(404).json(response(false, 'No se encontraron pagos para esta reserva'));
    }
    res.status(200).json(response(true, 'Pagos obtenidos por reserva', pagos));
  } catch (error) {
    console.error('Error al listar pagos por reserva:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarPagosPorEstado = async (req, res) => {
  const { estado } = req.params;

  try {
    const pagos = await getPagosByEstado(estado);
    if (!pagos.length) {
      return res.status(404).json(response(false, 'No se encontraron pagos para este estado'));
    }
    res.status(200).json(response(true, 'Pagos obtenidos por estado', pagos));
  } catch (error) {
    console.error('Error al listar pagos por estado:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarPagosPorMetodo = async (req, res) => {
  const { metodo } = req.params;

  try {
    const pagos = await getPagosByMetodo(metodo);
    if (!pagos.length) {
      return res.status(404).json(response(false, 'No se encontraron pagos para este método'));
    }
    res.status(200).json(response(true, 'Pagos obtenidos por método', pagos));
  } catch (error) {
    console.error('Error al listar pagos por método:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearPago = async (req, res) => {
  const { tipo_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva } = req.body;

  if (!tipo_pago || !monto || !metodo_pago || !fecha_pago || !estado_pago || !id_reserva) {
    return res.status(400).json(response(false, 'Todos los campos son obligatorios'));
  }

  try {
    // Verificar que id_reserva existe en RESERVA
    const reservaExistente = await pool.query('SELECT id_reserva, monto_total, saldo_pendiente FROM RESERVA WHERE id_reserva = $1', [id_reserva]);
    if (!reservaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Reserva no encontrada'));
    }

    // Validar tipo_pago
    const validTiposPago = ['total', 'cuota'];
    if (!validTiposPago.includes(tipo_pago)) {
      return res.status(400).json(response(false, 'Tipo de pago inválido. Debe ser: total o cuota'));
    }

    // Validar metodo_pago
    const validMetodosPago = ['tarjeta', 'transferencia', 'efectivo'];
    if (!validMetodosPago.includes(metodo_pago)) {
      return res.status(400).json(response(false, 'Método de pago inválido. Debe ser: tarjeta, transferencia o efectivo'));
    }

    // Validar estado_pago
    const validEstadosPago = ['exitoso', 'pendiente', 'fallido', 'reembolsado'];
    if (!validEstadosPago.includes(estado_pago)) {
      return res.status(400).json(response(false, 'Estado de pago inválido. Debe ser: exitoso, pendiente, fallido o reembolsado'));
    }

    // Validar monto
    if (monto <= 0) {
      return res.status(400).json(response(false, 'El monto debe ser mayor que 0'));
    }

    // Validar que el monto no exceda el saldo pendiente
    if (monto > reservaExistente.rows[0].saldo_pendiente) {
      return res.status(400).json(response(false, 'El monto del pago excede el saldo pendiente de la reserva'));
    }

    const nuevoPago = await createPago(tipo_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva);
    res.status(201).json(response(true, 'Pago creado exitosamente', nuevoPago));
  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarPago = async (req, res) => {
  const { id } = req.params;
  const { tipo_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva } = req.body;

  try {
    // Verificar que id_reserva existe si se proporciona
    if (id_reserva) {
      const reservaExistente = await pool.query('SELECT id_reserva, monto_total, saldo_pendiente FROM RESERVA WHERE id_reserva = $1', [id_reserva]);
      if (!reservaExistente.rows[0]) {
        return res.status(404).json(response(false, 'Reserva no encontrada'));
      }
      // Validar monto si se proporciona
      if (monto && monto > reservaExistente.rows[0].saldo_pendiente) {
        return res.status(400).json(response(false, 'El monto del pago excede el saldo pendiente de la reserva'));
      }
    }

    // Validar tipo_pago si se proporciona
    if (tipo_pago) {
      const validTiposPago = ['total', 'cuota'];
      if (!validTiposPago.includes(tipo_pago)) {
        return res.status(400).json(response(false, 'Tipo de pago inválido. Debe ser: total o cuota'));
      }
    }

    // Validar metodo_pago si se proporciona
    if (metodo_pago) {
      const validMetodosPago = ['tarjeta', 'transferencia', 'efectivo'];
      if (!validMetodosPago.includes(metodo_pago)) {
        return res.status(400).json(response(false, 'Método de pago inválido. Debe ser: tarjeta, transferencia o efectivo'));
      }
    }

    // Validar estado_pago si se proporciona
    if (estado_pago) {
      const validEstadosPago = ['exitoso', 'pendiente', 'fallido', 'reembolsado'];
      if (!validEstadosPago.includes(estado_pago)) {
        return res.status(400).json(response(false, 'Estado de pago inválido. Debe ser: exitoso, pendiente, fallido o reembolsado'));
      }
    }

    // Validar monto si se proporciona
    if (monto && monto <= 0) {
      return res.status(400).json(response(false, 'El monto debe ser mayor que 0'));
    }

    const pagoActualizado = await updatePago(id, tipo_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva);
    if (!pagoActualizado) {
      return res.status(404).json(response(false, 'Pago no encontrado'));
    }
    res.status(200).json(response(true, 'Pago actualizado exitosamente', pagoActualizado));
  } catch (error) {
    console.error('Error al actualizar pago:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarPago = async (req, res) => {
  const { id } = req.params;

  try {
    const pagoEliminado = await deletePago(id);
    if (!pagoEliminado) {
      return res.status(404).json(response(false, 'Pago no encontrado'));
    }
    res.status(200).json(response(true, 'Pago eliminado exitosamente'));
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

// --- Rutas ---
const router = express.Router();

router.post('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE']), crearPago);

router.get('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE']), listarPagos);
router.get('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE']), obtenerPagoPorId);
router.get('/:id/reserva', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE']), obtenerReservaPorPagoId);
router.get('/reserva/:id_reserva', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE']), listarPagosPorReservaId);
router.get('/estado/:estado', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE']), listarPagosPorEstado);
router.get('/metodo/:metodo', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE']), listarPagosPorMetodo);

router.patch('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), actualizarPago);
router.delete('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), eliminarPago);

module.exports = router;