const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');
const path = require('path');
const fs = require('fs').promises;

// 👇 Importar tu handleUpload genérico
const { handleUpload } = require('../middleware/multer');

// --- Modelos ---
async function getAllQRs() {
  try {
    const query = `
      SELECT id_qr, fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva, id_control
      FROM QR_RESERVA
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar QRs: ' + error.message);
  }
}

async function getQRById(id) {
  try {
    const query = `
      SELECT id_qr, fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva, id_control
      FROM QR_RESERVA
      WHERE id_qr = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener QR por ID: ' + error.message);
  }
}

async function getReservaByQRId(id) {
  try {
    const query = `
      SELECT r.id_reserva, r.fecha_reserva, r.cupo, r.monto_total, r.saldo_pendiente, r.estado, r.id_cliente, r.id_cancha, r.id_disciplina
      FROM RESERVA r
      JOIN QR_RESERVA q ON r.id_reserva = q.id_reserva
      WHERE q.id_qr = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener reserva asociada al QR: ' + error.message);
  }
}

async function getControlByQRId(id) {
  try {
    const query = `
      SELECT c.id_control, c.fecha_asignacion, c.estado
      FROM CONTROL c
      JOIN QR_RESERVA q ON c.id_control = q.id_control
      WHERE q.id_qr = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener control asociado al QR: ' + error.message);
  }
}

async function getQRsByReservaId(id_reserva) {
  try {
    const query = `
      SELECT id_qr, fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva, id_control
      FROM QR_RESERVA
      WHERE id_reserva = $1
    `;
    const result = await pool.query(query, [id_reserva]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar QRs por reserva: ' + error.message);
  }
}

async function getQRsByEstado(estado) {
  try {
    const query = `
      SELECT id_qr, fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva, id_control
      FROM QR_RESERVA
      WHERE estado = $1
    `;
    const result = await pool.query(query, [estado]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar QRs por estado: ' + error.message);
  }
}

async function createQR(fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva, id_control) {
  try {
    const query = `
      INSERT INTO QR_RESERVA (fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva, id_control)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_qr, fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva, id_control
    `;
    const values = [fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva, id_control];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear QR: ' + error.message);
  }
}

async function updateQR(id, fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva, id_control) {
  try {
    const query = `
      UPDATE QR_RESERVA
      SET fecha_generado = COALESCE($1, fecha_generado),
          fecha_expira = COALESCE($2, fecha_expira),
          qr_url_imagen = COALESCE($3, qr_url_imagen),
          codigo_qr = COALESCE($4, codigo_qr),
          estado = COALESCE($5, estado),
          id_reserva = COALESCE($6, id_reserva),
          id_control = COALESCE($7, id_control)
      WHERE id_qr = $8
      RETURNING id_qr, fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva, id_control
    `;
    const values = [fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva, id_control, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar QR: ' + error.message);
  }
}

async function deleteQR(id) {
  try {
    const query = `
      DELETE FROM QR_RESERVA
      WHERE id_qr = $1
      RETURNING id_qr, fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva, id_control
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar QR: ' + error.message);
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

const listarQRs = async (req, res) => {
  try {
    const qrs = await getAllQRs();
    const qrsConImagenValidada = await Promise.all(
      qrs.map(async (qr) => {
        if (qr.qr_url_imagen) {
          try {
            const filePath = path.join(__dirname, '../Uploads/qr', qr.qr_url_imagen.replace(/^\/*[uU]ploads\/qr\//, ''));
            await fs.access(filePath);
          } catch (error) {
            console.warn(`Imagen QR no encontrada para id_qr ${qr.id_qr}: ${qr.qr_url_imagen}`);
            qr.qr_url_imagen = null;
          }
        }
        return qr;
      })
    );
    res.status(200).json(response(true, 'Lista de QRs obtenida', qrsConImagenValidada));
  } catch (error) {
    console.error('Error al listar QRs:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerQRPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const qr = await getQRById(id);
    if (!qr) {
      return res.status(404).json(response(false, 'QR no encontrado'));
    }
    if (qr.qr_url_imagen) {
      try {
        const filePath = path.join(__dirname, '../Uploads/qr', qr.qr_url_imagen.replace(/^\/*[uU]ploads\/qr\//, ''));
        await fs.access(filePath);
      } catch (error) {
        console.warn(`Imagen QR no encontrada para id_qr ${qr.id_qr}: ${qr.qr_url_imagen}`);
        qr.qr_url_imagen = null;
      }
    }
    res.status(200).json(response(true, 'QR obtenido', qr));
  } catch (error) {
    console.error('Error al obtener QR por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerReservaPorQRId = async (req, res) => {
  const { id } = req.params;

  try {
    const reserva = await getReservaByQRId(id);
    if (!reserva) {
      return res.status(404).json(response(false, 'Reserva no encontrada'));
    }
    res.status(200).json(response(true, 'Reserva obtenida', reserva));
  } catch (error) {
    console.error('Error al obtener reserva asociada al QR:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerControlPorQRId = async (req, res) => {
  const { id } = req.params;

  try {
    const control = await getControlByQRId(id);
    if (!control) {
      return res.status(404).json(response(false, 'Control no encontrado'));
    }
    res.status(200).json(response(true, 'Control obtenido', control));
  } catch (error) {
    console.error('Error al obtener control asociado al QR:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarQRsPorReservaId = async (req, res) => {
  const { id_reserva } = req.params;

  try {
    const qrs = await getQRsByReservaId(id_reserva);
    if (!qrs.length) {
      return res.status(404).json(response(false, 'No se encontraron QRs para esta reserva'));
    }
    const qrsConImagenValidada = await Promise.all(
      qrs.map(async (qr) => {
        if (qr.qr_url_imagen) {
          try {
            const filePath = path.join(__dirname, '../Uploads/qr', qr.qr_url_imagen.replace(/^\/*[uU]ploads\/qr\//, ''));
            await fs.access(filePath);
          } catch (error) {
            console.warn(`Imagen QR no encontrada para id_qr ${qr.id_qr}: ${qr.qr_url_imagen}`);
            qr.qr_url_imagen = null;
          }
        }
        return qr;
      })
    );
    res.status(200).json(response(true, 'QRs obtenidos por reserva', qrsConImagenValidada));
  } catch (error) {
    console.error('Error al listar QRs por reserva:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarQRsPorEstado = async (req, res) => {
  const { estado } = req.params;

  try {
    const qrs = await getQRsByEstado(estado);
    if (!qrs.length) {
      return res.status(404).json(response(false, 'No se encontraron QRs para este estado'));
    }
    const qrsConImagenValidada = await Promise.all(
      qrs.map(async (qr) => {
        if (qr.qr_url_imagen) {
          try {
            const filePath = path.join(__dirname, '../Uploads/qr', qr.qr_url_imagen.replace(/^\/*[uU]ploads\/qr\//, ''));
            await fs.access(filePath);
          } catch (error) {
            console.warn(`Imagen QR no encontrada para id_qr ${qr.id_qr}: ${qr.qr_url_imagen}`);
            qr.qr_url_imagen = null;
          }
        }
        return qr;
      })
    );
    res.status(200).json(response(true, 'QRs obtenidos por estado', qrsConImagenValidada));
  } catch (error) {
    console.error('Error al listar QRs por estado:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearQR = async (req, res) => {
  const { fecha_generado, fecha_expira, codigo_qr, estado, id_reserva, id_control } = req.body;

  if (!fecha_generado || !fecha_expira || !codigo_qr || !estado || !id_reserva) {
    return res.status(400).json(response(false, 'Los campos fecha_generado, fecha_expira, codigo_qr, estado e id_reserva son obligatorios'));
  }

  if (!req.file) {
    return res.status(400).json(response(false, 'La imagen QR es obligatoria'));
  }

  const qr_url_imagen = `/Uploads/qr/${req.file.filename}`;

  try {
    // Verificar que id_reserva existe en RESERVA
    const reservaExistente = await pool.query('SELECT id_reserva FROM RESERVA WHERE id_reserva = $1', [id_reserva]);
    if (!reservaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Reserva no encontrada'));
    }

    // Verificar que id_control existe en CONTROL si se proporciona
    if (id_control) {
      const controlExistente = await pool.query('SELECT id_control FROM CONTROL WHERE id_control = $1', [id_control]);
      if (!controlExistente.rows[0]) {
        return res.status(404).json(response(false, 'Control no encontrado'));
      }
    }

    // Validar estado
    const validEstados = ['activo', 'usado', 'expirado'];
    if (!validEstados.includes(estado)) {
      return res.status(400).json(response(false, 'Estado inválido. Debe ser: activo, usado o expirado'));
    }

    // Validar fecha_expira > fecha_generado
    if (new Date(fecha_expira) <= new Date(fecha_generado)) {
      return res.status(400).json(response(false, 'La fecha de expiración debe ser posterior a la fecha de generación'));
    }

    // Validar que el código QR no esté duplicado
    const qrExistente = await pool.query('SELECT id_qr FROM QR_RESERVA WHERE codigo_qr = $1', [codigo_qr]);
    if (qrExistente.rows[0]) {
      return res.status(400).json(response(false, 'El código QR ya está registrado'));
    }

    const nuevoQR = await createQR(fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva, id_control);
    res.status(201).json(response(true, 'QR creado exitosamente', nuevoQR));
  } catch (error) {
    console.error('Error al crear QR:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarQR = async (req, res) => {
  const { id } = req.params;
  const { fecha_generado, fecha_expira, codigo_qr, estado, id_reserva, id_control } = req.body;

  try {
    // Obtener el QR actual para manejar la imagen antigua
    const qrActual = await getQRById(id);
    if (!qrActual) {
      return res.status(404).json(response(false, 'QR no encontrado'));
    }

    // Verificar que id_reserva existe si se proporciona
    if (id_reserva) {
      const reservaExistente = await pool.query('SELECT id_reserva FROM RESERVA WHERE id_reserva = $1', [id_reserva]);
      if (!reservaExistente.rows[0]) {
        return res.status(404).json(response(false, 'Reserva no encontrada'));
      }
    }

    // Verificar que id_control existe si se proporciona
    if (id_control) {
      const controlExistente = await pool.query('SELECT id_control FROM CONTROL WHERE id_control = $1', [id_control]);
      if (!controlExistente.rows[0]) {
        return res.status(404).json(response(false, 'Control no encontrado'));
      }
    }

    // Validar estado si se proporciona
    if (estado) {
      const validEstados = ['activo', 'usado', 'expirado'];
      if (!validEstados.includes(estado)) {
        return res.status(400).json(response(false, 'Estado inválido. Debe ser: activo, usado o expirado'));
      }
    }

    // Validar fecha_expira > fecha_generado si ambas se proporcionan
    if (fecha_generado && fecha_expira && new Date(fecha_expira) <= new Date(fecha_generado)) {
      return res.status(400).json(response(false, 'La fecha de expiración debe ser posterior a la fecha de generación'));
    }

    // Validar que el código QR no esté duplicado si se proporciona
    if (codigo_qr) {
      const qrExistente = await pool.query('SELECT id_qr FROM QR_RESERVA WHERE codigo_qr = $1 AND id_qr != $2', [codigo_qr, id]);
      if (qrExistente.rows[0]) {
        return res.status(400).json(response(false, 'El código QR ya está registrado'));
      }
    }

    // Procesar nueva imagen QR si se proporciona
    let qr_url_imagen = qrActual.qr_url_imagen;
    if (req.file) {
      qr_url_imagen = `/Uploads/qr/${req.file.filename}`;
      // Eliminar la imagen antigua si existe
      if (qrActual.qr_url_imagen) {
        const oldPath = path.join(__dirname, '../Uploads/qr', qrActual.qr_url_imagen.replace(/^\/Uploads\/qr\//, ''));
        await fs.unlink(oldPath).catch(err => console.warn('No se pudo eliminar imagen antigua:', err));
      }
    }

    const qrActualizado = await updateQR(id, fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva, id_control);
    res.status(200).json(response(true, 'QR actualizado exitosamente', qrActualizado));
  } catch (error) {
    console.error('Error al actualizar QR:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarQR = async (req, res) => {
  const { id } = req.params;

  try {
    const qr = await getQRById(id);
    if (!qr) {
      return res.status(404).json(response(false, 'QR no encontrado'));
    }

    // Eliminar la imagen asociada si existe
    if (qr.qr_url_imagen) {
      const filePath = path.join(__dirname, '../Uploads/qr', qr.qr_url_imagen.replace(/^\/Uploads\/qr\//, ''));
      await fs.unlink(filePath).catch(err => console.warn('No se pudo eliminar imagen:', err));
    }

    const qrEliminado = await deleteQR(id);
    res.status(200).json(response(true, 'QR eliminado exitosamente'));
  } catch (error) {
    console.error('Error al eliminar QR:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

// --- Rutas ---
const router = express.Router();

// Aplicar middleware de upload a POST y PATCH
router.post('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), handleUpload('qr', 'qr_imagen'), crearQR);

router.get('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'ENCARGADO']), listarQRs);
router.get('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'ENCARGADO']), obtenerQRPorId);
router.get('/:id/reserva', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'ENCARGADO']), obtenerReservaPorQRId);
router.get('/reserva/:id_reserva', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'ENCARGADO']), listarQRsPorReservaId);
router.get('/estado/:estado', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'ENCARGADO']), listarQRsPorEstado);
router.get('/:id/control', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'ENCARGADO']), obtenerControlPorQRId);

router.patch('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), handleUpload('qr', 'qr_imagen'), actualizarQR);
router.delete('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), eliminarQR);

module.exports = router;