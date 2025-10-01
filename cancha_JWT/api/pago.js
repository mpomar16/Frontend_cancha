const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// --- Modelos ---
async function getAllPagos() {
  const query = `
    SELECT id_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva
    FROM PAGO
  `;
  const result = await pool.query(query);
  return result.rows;
}

async function getPagoById(id) {
  const query = `
    SELECT id_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva
    FROM PAGO
    WHERE id_pago = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

async function createPago(monto, metodo_pago, fecha_pago, estado_pago, id_reserva) {
  const query = `
    INSERT INTO PAGO (monto, metodo_pago, fecha_pago, estado_pago, id_reserva)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva
  `;
  const values = [monto, metodo_pago, fecha_pago, estado_pago, id_reserva];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function updatePago(id, monto, metodo_pago, fecha_pago, estado_pago, id_reserva) {
  const query = `
    UPDATE PAGO
    SET monto = COALESCE($1, monto),
        metodo_pago = COALESCE($2, metodo_pago),
        fecha_pago = COALESCE($3, fecha_pago),
        estado_pago = COALESCE($4, estado_pago),
        id_reserva = COALESCE($5, id_reserva)
    WHERE id_pago = $6
    RETURNING id_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva
  `;
  const values = [monto, metodo_pago, fecha_pago, estado_pago, id_reserva, id];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function deletePago(id) {
  const query = `
    DELETE FROM PAGO
    WHERE id_pago = $1
    RETURNING id_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

// Obtener valores de enums directamente de la base
async function getEnumValues(enumName) {
  const query = `
    SELECT enumlabel AS value
    FROM pg_enum
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
    WHERE typname = $1
    ORDER BY enumsortorder
  `;
  const result = await pool.query(query, [enumName]);
  return result.rows.map(r => r.value);
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

const response = (success, message, data = null) => ({ success, message, data });

const listarPagos = async (req, res) => {
  try {
    const pagos = await getAllPagos();
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Pagos obtenidos exitosamente', pagos));
  } catch (error) {
    console.error(error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerPagoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const pago = await getPagoById(id);
    if (!pago) return res.status(404).json(response(false, 'Pago no encontrado'));
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Pago obtenido exitosamente', pago));
  } catch (error) {
    console.error(error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearPagoController = async (req, res) => {
  const { monto, metodo_pago, fecha_pago, estado_pago, id_reserva } = req.body;

  if (!monto || !metodo_pago || !fecha_pago || !estado_pago || !id_reserva) {
    return res.status(400).json(response(false, 'Todos los campos son obligatorios'));
  }

  try {
    const reserva = await pool.query('SELECT id_reserva, saldo_pendiente FROM RESERVA WHERE id_reserva = $1', [id_reserva]);
    if (!reserva.rows[0]) return res.status(404).json(response(false, 'Reserva no encontrada'));
    if (monto <= 0 || monto > reserva.rows[0].saldo_pendiente) return res.status(400).json(response(false, 'Monto inválido'));

    const metodosValidos = await getEnumValues('metodo_pago_enum');
    const estadosValidos = await getEnumValues('estado_pago_enum');

    if (!metodosValidos.includes(metodo_pago)) return res.status(400).json(response(false, `Método de pago inválido. Debe ser uno de: ${metodosValidos.join(', ')}`));
    if (!estadosValidos.includes(estado_pago)) return res.status(400).json(response(false, `Estado de pago inválido. Debe ser uno de: ${estadosValidos.join(', ')}`));

    const pago = await createPago(monto, metodo_pago, fecha_pago, estado_pago, id_reserva);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(201).json(response(true, 'Pago creado exitosamente', pago));
  } catch (error) {
    console.error(error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarPagoController = async (req, res) => {
  const { id } = req.params;
  const { monto, metodo_pago, fecha_pago, estado_pago, id_reserva } = req.body;

  try {
    if (id_reserva) {
      const reserva = await pool.query('SELECT id_reserva, saldo_pendiente FROM RESERVA WHERE id_reserva = $1', [id_reserva]);
      if (!reserva.rows[0]) return res.status(404).json(response(false, 'Reserva no encontrada'));
      if (monto && monto > reserva.rows[0].saldo_pendiente) return res.status(400).json(response(false, 'Monto excede saldo pendiente'));
    }

    const metodosValidos = await getEnumValues('metodo_pago_enum');
    const estadosValidos = await getEnumValues('estado_pago_enum');

    if (metodo_pago && !metodosValidos.includes(metodo_pago)) return res.status(400).json(response(false, `Método de pago inválido. Debe ser uno de: ${metodosValidos.join(', ')}`));
    if (estado_pago && !estadosValidos.includes(estado_pago)) return res.status(400).json(response(false, `Estado de pago inválido. Debe ser uno de: ${estadosValidos.join(', ')}`));
    if (monto && monto <= 0) return res.status(400).json(response(false, 'Monto debe ser mayor que 0'));

    const pago = await updatePago(id, monto, metodo_pago, fecha_pago, estado_pago, id_reserva);
    if (!pago) return res.status(404).json(response(false, 'Pago no encontrado'));

    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Pago actualizado exitosamente', pago));
  } catch (error) {
    console.error(error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarPago = async (req, res) => {
  const { id } = req.params;
  try {
    const pago = await deletePago(id);
    if (!pago) return res.status(404).json(response(false, 'Pago no encontrado'));
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Pago eliminado exitosamente', pago));
  } catch (error) {
    console.error(error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerMetodoPagoEnum = async (req, res) => {
  try {
    const valores = await getEnumValues('metodo_pago_enum');
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Valores de método de pago obtenidos', valores));
  } catch (error) {
    console.error(error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerEstadoPagoEnum = async (req, res) => {
  try {
    const valores = await getEnumValues('estado_pago_enum');
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Valores de estado de pago obtenidos', valores));
  } catch (error) {
    console.error(error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

// --- Rutas ---
const router = express.Router();

router.post('/', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE']), crearPagoController);

router.get('/datos-total', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE']), listarPagos);
router.get('/id/:id', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE']), obtenerPagoPorId);

router.patch('/:id', verifyToken, checkRole(['ADMINISTRADOR']), actualizarPagoController);
router.delete('/:id', verifyToken, checkRole(['ADMINISTRADOR']), eliminarPago);

router.get('/metodo-pago-enum', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE']), obtenerMetodoPagoEnum);
router.get('/estado-pago-enum', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE']), obtenerEstadoPagoEnum);

module.exports = router;