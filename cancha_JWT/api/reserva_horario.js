const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// ----------------------
// --- MODELOS ---------
// ----------------------

async function getAllReservaHorario() {
  const query = `SELECT * FROM RESERVA_HORARIO ORDER BY fecha, hora_inicio`;
  const result = await pool.query(query);
  return result.rows;
}

async function getReservaHorarioById(id_horario) {
  const query = `SELECT * FROM RESERVA_HORARIO WHERE id_horario = $1`;
  const result = await pool.query(query, [id_horario]);
  return result.rows[0];
}

async function createReservaHorario({ id_reserva, fecha, hora_inicio, hora_fin, monto }) {
  const query = `
    INSERT INTO RESERVA_HORARIO (id_reserva, fecha, hora_inicio, hora_fin, monto)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [id_reserva, fecha, hora_inicio, hora_fin, monto];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function updateReservaHorario(id_horario, { fecha, hora_inicio, hora_fin, monto }) {
  const query = `
    UPDATE RESERVA_HORARIO
    SET fecha = COALESCE($1, fecha),
        hora_inicio = COALESCE($2, hora_inicio),
        hora_fin = COALESCE($3, hora_fin),
        monto = COALESCE($4, monto)
    WHERE id_horario = $5
    RETURNING *
  `;
  const values = [fecha, hora_inicio, hora_fin, monto, id_horario];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function deleteReservaHorario(id_horario) {
  const query = `DELETE FROM RESERVA_HORARIO WHERE id_horario = $1 RETURNING *`;
  const result = await pool.query(query, [id_horario]);
  return result.rows[0];
}

// ----------------------
// --- CONTROLADORES ----
// ----------------------

const response = (success, message, data = null) => ({ success, message, data });

const listarReservaHorario = async (req, res) => {
  try {
    const horarios = await getAllReservaHorario();
    res.status(200).json(response(true, 'Horarios de reserva obtenidos', horarios));
  } catch (error) {
    console.error(error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerReservaHorario = async (req, res) => {
  try {
    const { id_horario } = req.params;
    const horario = await getReservaHorarioById(id_horario);
    if (!horario) return res.status(404).json(response(false, 'Horario no encontrado'));
    res.status(200).json(response(true, 'Horario obtenido', horario));
  } catch (error) {
    console.error(error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearReservaHorarioCtrl = async (req, res) => {
  try {
    const { id_reserva, fecha, hora_inicio, hora_fin, monto } = req.body;
    if (!id_reserva || !hora_inicio || !hora_fin) {
      return res.status(400).json(response(false, 'id_reserva, hora_inicio y hora_fin son obligatorios'));
    }
    const nuevoHorario = await createReservaHorario({ id_reserva, fecha, hora_inicio, hora_fin, monto });
    res.status(201).json(response(true, 'Horario de reserva creado', nuevoHorario));
  } catch (error) {
    console.error(error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarReservaHorarioCtrl = async (req, res) => {
  try {
    const { id_horario } = req.params;
    const { fecha, hora_inicio, hora_fin, monto } = req.body;
    const horarioActualizado = await updateReservaHorario(id_horario, { fecha, hora_inicio, hora_fin, monto });
    if (!horarioActualizado) return res.status(404).json(response(false, 'Horario no encontrado'));
    res.status(200).json(response(true, 'Horario actualizado', horarioActualizado));
  } catch (error) {
    console.error(error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarReservaHorarioCtrl = async (req, res) => {
  try {
    const { id_horario } = req.params;
    const horarioEliminado = await deleteReservaHorario(id_horario);
    if (!horarioEliminado) return res.status(404).json(response(false, 'Horario no encontrado'));
    res.status(200).json(response(true, 'Horario eliminado', horarioEliminado));
  } catch (error) {
    console.error(error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

// ----------------------
// --- RUTAS -----------
// ----------------------

const router = express.Router();

router.get('/', verifyToken, listarReservaHorario);
router.get('/:id_horario', verifyToken, obtenerReservaHorario);

router.post('/', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE']), crearReservaHorarioCtrl);
router.patch('/:id_horario', verifyToken, checkRole(['ADMINISTRADOR']), actualizarReservaHorarioCtrl);

router.delete('/:id_horario', verifyToken, checkRole(['ADMINISTRADOR']), eliminarReservaHorarioCtrl);

module.exports = router;
