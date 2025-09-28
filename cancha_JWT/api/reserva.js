const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// --- Modelos ---
async function getAllReservas() {
  try {
    const query = `
      SELECT id_reserva, fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina
      FROM RESERVA
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
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

async function getClienteByReservaId(id) {
  try {
    const query = `
      SELECT c.id_cliente, c.fecha_registro, c.fecha_nac, p.id_persona, p.nombre
      FROM CLIENTE c
      JOIN PERSONA p ON c.id_cliente = p.id_persona
      JOIN RESERVA r ON c.id_cliente = r.id_cliente
      WHERE r.id_reserva = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener cliente asociado a la reserva: ' + error.message);
  }
}

async function getCanchaByReservaId(id) {
  try {
    const query = `
      SELECT c.id_cancha, c.nombre, c.capacidad, c.estado, c.ubicacion, c.monto_por_hora, c.imagen_principal, c.id_espacio
      FROM CANCHA c
      JOIN RESERVA r ON c.id_cancha = r.id_cancha
      WHERE r.id_reserva = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener cancha asociada a la reserva: ' + error.message);
  }
}

async function getDisciplinaByReservaId(id) {
  try {
    const query = `
      SELECT d.id_disciplina, d.nombre, d.descripcion
      FROM DISCIPLINA d
      JOIN RESERVA r ON d.id_disciplina = r.id_disciplina
      WHERE r.id_reserva = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener disciplina asociada a la reserva: ' + error.message);
  }
}

async function getPagosByReservaId(id) {
  try {
    const query = `
      SELECT id_pago, tipo_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva
      FROM PAGO
      WHERE id_reserva = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar pagos de la reserva: ' + error.message);
  }
}

async function getQrByReservaId(id) {
  try {
    const query = `
      SELECT id_qr, fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva
      FROM QR_RESERVA
      WHERE id_reserva = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener QR asociado a la reserva: ' + error.message);
  }
}

async function getReportesByReservaId(id) {
  try {
    const query = `
      SELECT id_reporte, detalle, sugerencia, id_encargado, id_reserva
      FROM REPORTE_INCIDENCIA
      WHERE id_reserva = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar reportes de la reserva: ' + error.message);
  }
}

async function getDeportistasByReservaId(id) {
  try {
    const query = `
      SELECT d.id_deportista, d.nivel, d.disciplina_principal, p.id_persona
      FROM DEPORTISTA d
      JOIN PERSONA p ON d.id_deportista = p.id_persona
      JOIN participa_en pe ON d.id_deportista = pe.id_deportista
      WHERE pe.id_reserva = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar deportistas de la reserva: ' + error.message);
  }
}

async function getReservasByEstado(estado) {
  try {
    const query = `
      SELECT id_reserva, fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina
      FROM RESERVA
      WHERE estado = $1
    `;
    const result = await pool.query(query, [estado]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar reservas por estado: ' + error.message);
  }
}

async function getReservasByClienteId(id_cliente) {
  try {
    const query = `
      SELECT id_reserva, fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina
      FROM RESERVA
      WHERE id_cliente = $1
    `;
    const result = await pool.query(query, [id_cliente]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar reservas por cliente: ' + error.message);
  }
}

async function getReservasByCanchaId(id_cancha) {
  try {
    const query = `
      SELECT id_reserva, fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina
      FROM RESERVA
      WHERE id_cancha = $1
    `;
    const result = await pool.query(query, [id_cancha]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar reservas por cancha: ' + error.message);
  }
}

async function getReservasByFecha(fecha) {
  try {
    const query = `
      SELECT id_reserva, fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina
      FROM RESERVA
      WHERE fecha_reserva = $1
    `;
    const result = await pool.query(query, [fecha]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar reservas por fecha: ' + error.message);
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
    const reservas = await getAllReservas();
    res.status(200).json(response(true, 'Lista de reservas obtenida', reservas));
  } catch (error) {
    console.error('Error al listar reservas:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerReservaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const reserva = await getReservaById(id);
    if (!reserva) {
      return res.status(404).json(response(false, 'Reserva no encontrada'));
    }
    res.status(200).json(response(true, 'Reserva obtenida', reserva));
  } catch (error) {
    console.error('Error al obtener reserva por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerClientePorReservaId = async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await getClienteByReservaId(id);
    if (!cliente) {
      return res.status(404).json(response(false, 'Cliente no encontrado'));
    }
    res.status(200).json(response(true, 'Cliente obtenido', cliente));
  } catch (error) {
    console.error('Error al obtener cliente asociado a la reserva:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerCanchaPorReservaId = async (req, res) => {
  const { id } = req.params;

  try {
    const cancha = await getCanchaByReservaId(id);
    if (!cancha) {
      return res.status(404).json(response(false, 'Cancha no encontrada'));
    }
    res.status(200).json(response(true, 'Cancha obtenida', cancha));
  } catch (error) {
    console.error('Error al obtener cancha asociada a la reserva:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerDisciplinaPorReservaId = async (req, res) => {
  const { id } = req.params;

  try {
    const disciplina = await getDisciplinaByReservaId(id);
    if (!disciplina) {
      return res.status(404).json(response(false, 'Disciplina no encontrada'));
    }
    res.status(200).json(response(true, 'Disciplina obtenida', disciplina));
  } catch (error) {
    console.error('Error al obtener disciplina asociada a la reserva:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerPagosPorReservaId = async (req, res) => {
  const { id } = req.params;

  try {
    const pagos = await getPagosByReservaId(id);
    if (!pagos.length) {
      return res.status(404).json(response(false, 'No se encontraron pagos para esta reserva'));
    }
    res.status(200).json(response(true, 'Pagos obtenidos', pagos));
  } catch (error) {
    console.error('Error al listar pagos de la reserva:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerQrPorReservaId = async (req, res) => {
  const { id } = req.params;

  try {
    const qr = await getQrByReservaId(id);
    if (!qr) {
      return res.status(404).json(response(false, 'QR no encontrado'));
    }
    res.status(200).json(response(true, 'QR obtenido', qr));
  } catch (error) {
    console.error('Error al obtener QR asociado a la reserva:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerReportesPorReservaId = async (req, res) => {
  const { id } = req.params;

  try {
    const reportes = await getReportesByReservaId(id);
    if (!reportes.length) {
      return res.status(404).json(response(false, 'No se encontraron reportes para esta reserva'));
    }
    res.status(200).json(response(true, 'Reportes obtenidos', reportes));
  } catch (error) {
    console.error('Error al listar reportes de la reserva:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerDeportistasPorReservaId = async (req, res) => {
  const { id } = req.params;

  try {
    const deportistas = await getDeportistasByReservaId(id);
    if (!deportistas.length) {
      return res.status(404).json(response(false, 'No se encontraron deportistas para esta reserva'));
    }
    res.status(200).json(response(true, 'Deportistas obtenidos', deportistas));
  } catch (error) {
    console.error('Error al listar deportistas de la reserva:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarReservasPorEstado = async (req, res) => {
  const { estado } = req.params;

  try {
    const reservas = await getReservasByEstado(estado);
    if (!reservas.length) {
      return res.status(404).json(response(false, 'No se encontraron reservas para este estado'));
    }
    res.status(200).json(response(true, 'Reservas obtenidas por estado', reservas));
  } catch (error) {
    console.error('Error al listar reservas por estado:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarReservasPorClienteId = async (req, res) => {
  const { id_cliente } = req.params;

  try {
    const reservas = await getReservasByClienteId(id_cliente);
    if (!reservas.length) {
      return res.status(404).json(response(false, 'No se encontraron reservas para este cliente'));
    }
    res.status(200).json(response(true, 'Reservas obtenidas por cliente', reservas));
  } catch (error) {
    console.error('Error al listar reservas por cliente:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarReservasPorCanchaId = async (req, res) => {
  const { id_cancha } = req.params;

  try {
    const reservas = await getReservasByCanchaId(id_cancha);
    if (!reservas.length) {
      return res.status(404).json(response(false, 'No se encontraron reservas para esta cancha'));
    }
    res.status(200).json(response(true, 'Reservas obtenidas por cancha', reservas));
  } catch (error) {
    console.error('Error al listar reservas por cancha:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarReservasPorFecha = async (req, res) => {
  const { fecha } = req.params;

  try {
    const reservas = await getReservasByFecha(fecha);
    if (!reservas.length) {
      return res.status(404).json(response(false, 'No se encontraron reservas para esta fecha'));
    }
    res.status(200).json(response(true, 'Reservas obtenidas por fecha', reservas));
  } catch (error) {
    console.error('Error al listar reservas por fecha:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearReserva = async (req, res) => {
  const { fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina } = req.body;

  if (!fecha_reserva || !cupo || !monto_total || !estado || !id_cliente || !id_cancha || !id_disciplina) {
    return res.status(400).json(response(false, 'Todos los campos son obligatorios'));
  }

  try {
    // Verificar que id_cliente existe en CLIENTE
    const clienteExistente = await pool.query('SELECT id_cliente FROM CLIENTE WHERE id_cliente = $1', [id_cliente]);
    if (!clienteExistente.rows[0]) {
      return res.status(404).json(response(false, 'Cliente no encontrado'));
    }

    // Verificar que id_cancha existe en CANCHA
    const canchaExistente = await pool.query('SELECT id_cancha, capacidad FROM CANCHA WHERE id_cancha = $1 AND estado = true', [id_cancha]);
    if (!canchaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Cancha no encontrada o no disponible'));
    }

    // Verificar que id_disciplina existe en DISCIPLINA
    const disciplinaExistente = await pool.query('SELECT id_disciplina FROM DISCIPLINA WHERE id_disciplina = $1', [id_disciplina]);
    if (!disciplinaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Disciplina no encontrada'));
    }

    // Validar cupo
    if (cupo <= 0 || cupo > canchaExistente.rows[0].capacidad) {
      return res.status(400).json(response(false, `El cupo debe ser mayor que 0 y menor o igual a ${canchaExistente.rows[0].capacidad}`));
    }

    // Validar monto_total y saldo_pendiente
    if (monto_total <= 0) {
      return res.status(400).json(response(false, 'El monto total debe ser mayor que 0'));
    }
    if (saldo_pendiente < 0 || saldo_pendiente > monto_total) {
      return res.status(400).json(response(false, 'El saldo pendiente debe estar entre 0 y el monto total'));
    }

    // Validar estado
    const validEstados = ['pagada', 'en_cuotas', 'cancelada'];
    if (!validEstados.includes(estado)) {
      return res.status(400).json(response(false, 'Estado inválido. Debe ser: pagada, en_cuotas o cancelada'));
    }

    const nuevaReserva = await createReserva(fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina);
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
    // Verificar que id_cliente existe si se proporciona
    if (id_cliente) {
      const clienteExistente = await pool.query('SELECT id_cliente FROM CLIENTE WHERE id_cliente = $1', [id_cliente]);
      if (!clienteExistente.rows[0]) {
        return res.status(404).json(response(false, 'Cliente no encontrado'));
      }
    }

    // Verificar que id_cancha existe y está disponible si se proporciona
    if (id_cancha) {
      const canchaExistente = await pool.query('SELECT id_cancha, capacidad FROM CANCHA WHERE id_cancha = $1 AND estado = true', [id_cancha]);
      if (!canchaExistente.rows[0]) {
        return res.status(404).json(response(false, 'Cancha no encontrada o no disponible'));
      }
      // Validar cupo si se proporciona
      if (cupo && (cupo <= 0 || cupo > canchaExistente.rows[0].capacidad)) {
        return res.status(400).json(response(false, `El cupo debe ser mayor que 0 y menor o igual a ${canchaExistente.rows[0].capacidad}`));
      }
    }

    // Verificar que id_disciplina existe si se proporciona
    if (id_disciplina) {
      const disciplinaExistente = await pool.query('SELECT id_disciplina FROM DISCIPLINA WHERE id_disciplina = $1', [id_disciplina]);
      if (!disciplinaExistente.rows[0]) {
        return res.status(404).json(response(false, 'Disciplina no encontrada'));
      }
    }

    // Validar monto_total si se proporciona
    if (monto_total && monto_total <= 0) {
      return res.status(400).json(response(false, 'El monto total debe ser mayor que 0'));
    }

    // Validar saldo_pendiente si se proporciona
    if (saldo_pendiente && (saldo_pendiente < 0 || (monto_total && saldo_pendiente > monto_total))) {
      return res.status(400).json(response(false, 'El saldo pendiente debe estar entre 0 y el monto total'));
    }

    // Validar estado si se proporciona
    if (estado) {
      const validEstados = ['pagada', 'en_cuotas', 'cancelada'];
      if (!validEstados.includes(estado)) {
        return res.status(400).json(response(false, 'Estado inválido. Debe ser: pagada, en_cuotas o cancelada'));
      }
    }

    const reservaActualizada = await updateReserva(id, fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina);
    if (!reservaActualizada) {
      return res.status(404).json(response(false, 'Reserva no encontrada'));
    }
    res.status(200).json(response(true, 'Reserva actualizada exitosamente', reservaActualizada));
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
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
    res.status(200).json(response(true, 'Reserva eliminada exitosamente'));
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

// --- Rutas ---
const router = express.Router();

router.post('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE']), crearReserva);

router.get('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), listarReservas);
router.get('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerReservaPorId);
router.get('/:id/cliente', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerClientePorReservaId);
router.get('/:id/cancha', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerCanchaPorReservaId);
router.get('/:id/disciplina', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerDisciplinaPorReservaId);
router.get('/estado/:estado', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), listarReservasPorEstado);
router.get('/cliente/:id_cliente', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE']), listarReservasPorClienteId);
router.get('/cancha/:id_cancha', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), listarReservasPorCanchaId);
router.get('/fecha/:fecha', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), listarReservasPorFecha);
router.get('/:id/deportistas', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerDeportistasPorReservaId);
router.get('/:id/pagos', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerPagosPorReservaId);
router.get('/:id/qr', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerQrPorReservaId);
router.get('/:id/reportes', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'ENCARGADO']), obtenerReportesPorReservaId);

router.patch('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE']), actualizarReserva);
router.delete('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE']), eliminarReserva);

module.exports = router;