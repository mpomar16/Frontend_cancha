const express = require('express');
const QRCode = require('qrcode'); // Import the qrcode library
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');
const path = require('path');
const fs = require('fs').promises;

// --- Modelos ---
async function getAllQRs() {
  try {
    const query = `
      SELECT 
        q.id_qr, 
        q.fecha_generado, 
        q.fecha_expira, 
        q.qr_url_imagen, 
        q.codigo_qr, 
        q.estado, 
        q.id_reserva, 
        q.id_control,
        p.nombre || ' ' || p.apellido AS nombre_cliente
      FROM QR_RESERVA q
      JOIN RESERVA r ON q.id_reserva = r.id_reserva
      JOIN CLIENTE c ON r.id_cliente = c.id_cliente
      JOIN PERSONA p ON c.id_cliente = p.id_persona
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
      SELECT 
        q.id_qr, 
        q.fecha_generado, 
        q.fecha_expira, 
        q.qr_url_imagen, 
        q.codigo_qr, 
        q.estado, 
        q.id_reserva, 
        q.id_control,
        p.nombre || ' ' || p.apellido AS nombre_cliente
      FROM QR_RESERVA q
      JOIN RESERVA r ON q.id_reserva = r.id_reserva
      JOIN CLIENTE c ON r.id_cliente = c.id_cliente
      JOIN PERSONA p ON c.id_cliente = p.id_persona
      WHERE q.id_qr = $1
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
        p.nombre || ' ' || p.apellido AS nombre_cliente
      FROM RESERVA r
      JOIN QR_RESERVA q ON r.id_reserva = q.id_reserva
      JOIN CLIENTE c ON r.id_cliente = c.id_cliente
      JOIN PERSONA p ON c.id_cliente = p.id_persona
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
      SELECT 
        q.id_qr, 
        q.fecha_generado, 
        q.fecha_expira, 
        q.qr_url_imagen, 
        q.codigo_qr, 
        q.estado, 
        q.id_reserva, 
        q.id_control,
        p.nombre || ' ' || p.apellido AS nombre_cliente
      FROM QR_RESERVA q
      JOIN RESERVA r ON q.id_reserva = r.id_reserva
      JOIN CLIENTE c ON r.id_cliente = c.id_cliente
      JOIN PERSONA p ON c.id_cliente = p.id_persona
      WHERE q.id_reserva = $1
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
      SELECT 
        q.id_qr, 
        q.fecha_generado, 
        q.fecha_expira, 
        q.qr_url_imagen, 
        q.codigo_qr, 
        q.estado, 
        q.id_reserva, 
        q.id_control,
        p.nombre || ' ' || p.apellido AS nombre_cliente
      FROM QR_RESERVA q
      JOIN RESERVA r ON q.id_reserva = r.id_reserva
      JOIN CLIENTE c ON r.id_cliente = c.id_cliente
      JOIN PERSONA p ON c.id_cliente = p.id_persona
      WHERE q.estado = $1
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

async function getEstadoQrEnumValues() {
  try {
    const query = `
      SELECT e.enumlabel AS value
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'estado_qr_enum'
      ORDER BY e.enumsortorder
    `;
    const result = await pool.query(query);
    return result.rows.map(row => row.value);
  } catch (error) {
    throw new Error('Error al obtener valores de estado_qr_enum: ' + error.message);
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
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
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
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
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
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
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
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
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
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
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
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'QRs obtenidos por estado', qrsConImagenValidada));
  } catch (error) {
    console.error('Error al listar QRs por estado:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearQR = async (req, res) => {
  const { fecha_generado, fecha_expira, codigo_qr, estado, id_reserva, id_control } = req.body;

  // Validar campos requeridos
  if (!fecha_generado || !fecha_expira || !codigo_qr || !estado || !id_reserva) {
    return res.status(400).json(response(false, 'Los campos fecha_generado, fecha_expira, codigo_qr, estado e id_reserva son obligatorios'));
  }

  try {
    // Verificar que id_reserva existe en RESERVA
    const reservaExistente = await pool.query('SELECT id_reserva FROM RESERVA WHERE id_reserva = $1', [id_reserva]);
    if (!reservaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Reserva no encontrada'));
    }

    // Verificar si la reserva ya tiene un QR asignado
    const existingQR = await getQRsByReservaId(id_reserva);
    if (existingQR.length > 0) {
      return res.status(400).json(response(false, 'La reserva ya tiene un QR asignado'));
    }

    // Verificar que id_control existe en CONTROL si se proporciona
    if (id_control) {
      const controlExistente = await pool.query('SELECT id_control FROM CONTROL WHERE id_control = $1', [id_control]);
      if (!controlExistente.rows[0]) {
        return res.status(404).json(response(false, 'Control no encontrado'));
      }
    }

    // Validar estado
    const validEstados = await getEstadoQrEnumValues();
    if (!validEstados.includes(estado)) {
      return res.status(400).json(response(false, `Estado inválido. Debe ser uno de: ${validEstados.join(', ')}`));
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

    // Fetch detalles de la reserva, cliente, cancha y disciplina, incluyendo saldo_pendiente
    const detailsQuery = `
      SELECT 
        r.id_reserva,
        r.fecha_reserva,
        r.cupo,
        r.saldo_pendiente,
        p.nombre || COALESCE(' ' || p.apellido, '') AS nombre_cliente,
        ca.nombre AS nombre_cancha,
        d.nombre AS nombre_disciplina
      FROM RESERVA r
      JOIN CLIENTE cl ON r.id_cliente = cl.id_cliente
      JOIN PERSONA p ON cl.id_cliente = p.id_persona
      JOIN CANCHA ca ON r.id_cancha = ca.id_cancha
      JOIN DISCIPLINA d ON r.id_disciplina = d.id_disciplina
      WHERE r.id_reserva = $1
    `;

    const detailsResult = await pool.query(detailsQuery, [id_reserva]);
    if (!detailsResult.rows[0]) {
      return res.status(404).json(response(false, 'Detalles de la reserva no encontrados'));
    }
    const details = detailsResult.rows[0];

    // Verificar si el saldo pendiente es cero
    if (details.saldo_pendiente !== 0) {
      return res.status(400).json(response(false, 'No se puede generar QR hasta que el saldo pendiente sea cero'));
    }

    // Construir el contenido del QR como JSON (sin incluir saldo_pendiente)
    const qrContent = JSON.stringify({
      id_reserva: details.id_reserva,
      nombre_cliente: details.nombre_cliente,
      fecha_reserva: details.fecha_reserva,
      cupo: details.cupo,
      cancha: details.nombre_cancha,
      disciplina: details.nombre_disciplina,
      codigo_qr: codigo_qr,
      fecha_generado: fecha_generado,
      fecha_expira: fecha_expira
    });

    console.log(qrContent);

    // Generar nombre único para el archivo QR
    const qrFileName = `${id_reserva}_${Date.now()}.png`;
    const qrFilePath = path.join(__dirname, '../Uploads/qr', qrFileName);
    const qr_url_imagen = `/Uploads/qr/${qrFileName}`;

    // Asegurar que el directorio /Uploads/qr existe
    const qrDir = path.join(__dirname, '../Uploads/qr');
    await fs.mkdir(qrDir, { recursive: true });

    // Generar el QR code y guardarlo como PNG
    await QRCode.toFile(qrFilePath, qrContent, {
      errorCorrectionLevel: 'H', // Alto nivel de corrección para más datos
      type: 'png',
      width: 400, // Aumentado para manejar más contenido
    });

    // Guardar en la DB
    const nuevoQR = await createQR(fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva, id_control);
    // Obtener el QR completo con nombre_cliente para la respuesta
    const qrConCliente = await getQRById(nuevoQR.id_qr);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(201).json(response(true, 'QR creado exitosamente', qrConCliente));
  } catch (error) {
    console.error('Error al crear QR:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarQR = async (req, res) => {
  const { id } = req.params;
  const { fecha_generado, fecha_expira, codigo_qr, estado, id_control } = req.body;

  try {
    // Obtener el QR actual
    const qrActual = await getQRById(id);
    if (!qrActual) return res.status(404).json(response(false, 'QR no encontrado'));

    // Verificar id_control si se proporciona
    if (id_control) {
      const controlExistente = await pool.query('SELECT id_control FROM CONTROL WHERE id_control = $1', [id_control]);
      if (!controlExistente.rows[0]) return res.status(404).json(response(false, 'Control no encontrado'));
    }

    // Validar estado si se proporciona
    if (estado) {
      const validEstados = await getEstadoQrEnumValues();
      if (!validEstados.includes(estado)) return res.status(400).json(response(false, `Estado inválido. Debe ser uno de: ${validEstados.join(', ')}`));
    }

    // Validar fecha_expira > fecha_generado si ambas se proporcionan
    if (fecha_generado && fecha_expira && new Date(fecha_expira) <= new Date(fecha_generado)) {
      return res.status(400).json(response(false, 'La fecha de expiración debe ser posterior a la fecha de generación'));
    }

    // Validar código QR único si se proporciona
    if (codigo_qr) {
      const qrExistente = await pool.query('SELECT id_qr FROM QR_RESERVA WHERE codigo_qr = $1 AND id_qr != $2', [codigo_qr, id]);
      if (qrExistente.rows[0]) return res.status(400).json(response(false, 'El código QR ya está registrado'));
    }

    // Actualizar QR en la DB sin tocar la imagen aún
    const qrActualizado = await updateQR(id, fecha_generado, fecha_expira, null, codigo_qr, estado, qrActual.id_reserva, id_control);

    // Traer detalles de la reserva para generar el contenido del QR
    const detailsQuery = `
      SELECT r.id_reserva, r.fecha_reserva, r.cupo, r.saldo_pendiente,
             p.nombre || ' ' || p.apellido AS nombre_cliente,
             ca.nombre AS nombre_cancha, d.nombre AS nombre_disciplina
      FROM RESERVA r
      JOIN CLIENTE cl ON r.id_cliente = cl.id_cliente
      JOIN PERSONA p ON cl.id_cliente = p.id_persona
      JOIN CANCHA ca ON r.id_cancha = ca.id_cancha
      JOIN DISCIPLINA d ON r.id_disciplina = d.id_disciplina
      WHERE r.id_reserva = $1
    `;
    const detailsResult = await pool.query(detailsQuery, [qrActualizado.id_reserva]);
    if (!detailsResult.rows[0]) return res.status(404).json(response(false, 'Detalles de la reserva no encontrados'));
    const details = detailsResult.rows[0];

    const qrContent = JSON.stringify({
      id_reserva: details.id_reserva,
      nombre_cliente: details.nombre_cliente,
      fecha_reserva: details.fecha_reserva,
      cupo: details.cupo,
      cancha: details.nombre_cancha,
      disciplina: details.nombre_disciplina,
      codigo_qr: qrActualizado.codigo_qr,
      fecha_generado: qrActualizado.fecha_generado,
      fecha_expira: qrActualizado.fecha_expira
    });

    // Directorio y nombre de archivo
    const qrDir = path.join(__dirname, '../Uploads/qr');
    await fs.mkdir(qrDir, { recursive: true });
    let qrFilePath;
    let qr_url_imagen = qrActualizado.qr_url_imagen;

    if (details.saldo_pendiente !== 0) {
      // Si no está pagado, no generar QR y mantener la imagen existente
      qr_url_imagen = qrActualizado.qr_url_imagen || null;
    } else {
      // Si está pagado
      if (!qr_url_imagen) {
        const qrFileName = `${qrActualizado.id_reserva}_${Date.now()}.png`;
        qrFilePath = path.join(qrDir, qrFileName);
        qr_url_imagen = `/Uploads/qr/${qrFileName}`;
      } else {
        qrFilePath = path.join(qrDir, qr_url_imagen.replace(/^\/*[uU]ploads\/qr\//, ''));
      }
      // Generar o sobrescribir el QR
      await QRCode.toFile(qrFilePath, qrContent, { errorCorrectionLevel: 'H', type: 'png', width: 400 });
      // Actualizar DB si antes no existía
      if (!qrActualizado.qr_url_imagen) {
        await pool.query('UPDATE QR_RESERVA SET qr_url_imagen = $1 WHERE id_qr = $2', [qr_url_imagen, id]);
      }
    }

    const qrConCliente = await getQRById(qrActualizado.id_qr);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'QR actualizado exitosamente', qrConCliente));
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
      const filePath = path.join(__dirname, '../Uploads/qr', qr.qr_url_imagen.replace(/^\/*[uU]ploads\/qr\//, ''));
      await fs.unlink(filePath).catch(err => console.warn('No se pudo eliminar imagen:', err));
    }

    const qrEliminado = await deleteQR(id);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'QR eliminado exitosamente'));
  } catch (error) {
    console.error('Error al eliminar QR:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarEstadoQrEnum = async (req, res) => {
  try {
    const valores = await getEstadoQrEnumValues();
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json({
      success: true,
      message: 'Valores de estado_qr_enum obtenidos correctamente',
      data: valores,
    });
  } catch (error) {
    console.error('Error al listar estado_qr_enum:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

//-------- Rutas --------- 

const router = express.Router();

router.post('/', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP']), crearQR);

router.get('/datos-total', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'ENCARGADO']), listarQRs);
router.get('/id/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'ENCARGADO']), obtenerQRPorId);
router.get('/:id/reserva', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'ENCARGADO']), obtenerReservaPorQRId);
router.get('/reserva/:id_reserva', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'ENCARGADO']), listarQRsPorReservaId);
router.get('/estado/:estado', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'ENCARGADO']), listarQRsPorEstado);
router.get('/estado-qr-enum', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE']), listarEstadoQrEnum);

router.get('/:id/control', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'ENCARGADO']), obtenerControlPorQRId);

router.patch('/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP']), actualizarQR);
router.delete('/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP']), eliminarQR);

module.exports = router;