const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Función de respuesta estandarizada
const respuesta = (exito, mensaje, datos = null) => ({
  exito,
  mensaje,
  datos,
});

// MODELOS - Funciones puras para operaciones de base de datos

/**
 * Obtener datos específicos de QR de reservas con información de la reserva
 */
const obtenerDatosEspecificos = async (limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT qr.id_qr, qr.fecha_generado, qr.fecha_expira, qr.qr_url_imagen, qr.codigo_qr, qr.estado,
             r.id_reserva, c.id_cliente, p.nombre AS cliente_nombre, p.apellido AS cliente_apellido,
             ca.id_cancha, ca.nombre AS cancha_nombre
      FROM qr_reserva qr
      JOIN reserva r ON qr.id_reserva = r.id_reserva
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario p ON c.id_cliente = p.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      ORDER BY qr.id_qr
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM qr_reserva`;
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);
    return {
      qrs: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener QR de reservas con filtros de ordenamiento
 */
const obtenerQRsFiltrados = async (tipoFiltro, limite = 10, offset = 0) => {
  try {
    const ordenesPermitidas = {
      fecha_generado: 'qr.fecha_generado DESC',
      estado: 'qr.estado ASC',
      default: 'qr.id_qr ASC'
    };

    const orden = ordenesPermitidas[tipoFiltro] || ordenesPermitidas.default;

    const queryDatos = `
      SELECT qr.id_qr, qr.fecha_generado, qr.fecha_expira, qr.qr_url_imagen, qr.codigo_qr, qr.estado,
             r.id_reserva, c.id_cliente, p.nombre AS cliente_nombre, p.apellido AS cliente_apellido,
             ca.id_cancha, ca.nombre AS cancha_nombre
      FROM qr_reserva qr
      JOIN reserva r ON qr.id_reserva = r.id_reserva
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario p ON c.id_cliente = p.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      ORDER BY ${orden}
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM qr_reserva`;

    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);

    return {
      qrs: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw new Error(`Error al obtener QRs filtrados: ${error.message}`);
  }
};

/**
 * Buscar QR de reservas por texto en múltiples campos
 */
const buscarQRs = async (texto, limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT qr.id_qr, qr.fecha_generado, qr.fecha_expira, qr.qr_url_imagen, qr.codigo_qr, qr.estado,
             r.id_reserva, c.id_cliente, p.nombre AS cliente_nombre, p.apellido AS cliente_apellido,
             ca.id_cancha, ca.nombre AS cancha_nombre
      FROM qr_reserva qr
      JOIN reserva r ON qr.id_reserva = r.id_reserva
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario p ON c.id_cliente = p.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      WHERE 
        p.nombre ILIKE $1 OR 
        p.apellido ILIKE $1 OR 
        ca.nombre ILIKE $1 OR 
        qr.codigo_qr ILIKE $1
      ORDER BY qr.fecha_generado DESC
      LIMIT $2 OFFSET $3
    `;

    const queryTotal = `
      SELECT COUNT(*) 
      FROM qr_reserva qr
      JOIN reserva r ON qr.id_reserva = r.id_reserva
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario p ON c.id_cliente = p.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      WHERE 
        p.nombre ILIKE $1 OR 
        p.apellido ILIKE $1 OR 
        ca.nombre ILIKE $1 OR 
        qr.codigo_qr ILIKE $1
    `;
    
    const sanitizeInput = (input) => input.replace(/[%_\\]/g, '\\$&');
    const terminoBusqueda = `%${sanitizeInput(texto)}%`;
    
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [terminoBusqueda, limite, offset]),
      pool.query(queryTotal, [terminoBusqueda])
    ]);

    return {
      qrs: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener QR de reserva por ID
 */
const obtenerQRPorId = async (id) => {
  try {
    const query = `
      SELECT qr.*, 
             r.id_reserva, c.id_cliente, p.nombre AS cliente_nombre, p.apellido AS cliente_apellido, p.correo AS cliente_correo,
             ca.id_cancha, ca.nombre AS cancha_nombre
      FROM qr_reserva qr
      JOIN reserva r ON qr.id_reserva = r.id_reserva
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario p ON c.id_cliente = p.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      WHERE qr.id_qr = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Crear nuevo QR de reserva
 */
const crearQR = async (datosQR) => {
  try {
    // Validaciones básicas
    if (!datosQR.id_reserva || isNaN(datosQR.id_reserva)) {
      throw new Error('El ID de la reserva es obligatorio y debe ser un número');
    }
    if (!datosQR.fecha_generado) {
      throw new Error('La fecha de generación es obligatoria');
    }

    // Validar fechas
    const fechaGenerado = new Date(datosQR.fecha_generado);
    if (isNaN(fechaGenerado.getTime())) {
      throw new Error('La fecha de generación no es válida');
    }
    if (datosQR.fecha_expira) {
      const fechaExpira = new Date(datosQR.fecha_expira);
      if (isNaN(fechaExpira.getTime())) {
        throw new Error('La fecha de expiración no es válida');
      }
      if (fechaExpira <= fechaGenerado) {
        throw new Error('La fecha de expiración debe ser posterior a la fecha de generación');
      }
    }

    // Validar longitud de campos
    if (datosQR.qr_url_imagen && datosQR.qr_url_imagen.length > 255) {
      throw new Error('La URL de la imagen del QR no debe exceder los 255 caracteres');
    }
    if (datosQR.codigo_qr && datosQR.codigo_qr.length > 255) {
      throw new Error('El código QR no debe exceder los 255 caracteres');
    }

    // Validar estado
    const estadosValidos = ['activo', 'expirado', 'usado'];
    if (datosQR.estado && !estadosValidos.includes(datosQR.estado)) {
      throw new Error(`El estado debe ser uno de: ${estadosValidos.join(', ')}`);
    }

    // Verificar si la reserva existe
    const reservaQuery = `
      SELECT id_reserva FROM reserva WHERE id_reserva = $1
    `;
    const reservaResult = await pool.query(reservaQuery, [datosQR.id_reserva]);
    if (!reservaResult.rows[0]) {
      throw new Error('La reserva asociada no existe');
    }

    // Verificar si ya existe un QR para esta reserva (por la restricción UNIQUE)
    const qrExistenteQuery = `
      SELECT id_qr FROM qr_reserva WHERE id_reserva = $1
    `;
    const qrExistenteResult = await pool.query(qrExistenteQuery, [datosQR.id_reserva]);
    if (qrExistenteResult.rows[0]) {
      throw new Error('Ya existe un QR asociado a esta reserva');
    }

    // Validar control si se proporciona
    if (datosQR.id_control) {
      const controlQuery = `
        SELECT id_control FROM control WHERE id_control = $1
      `;
      const controlResult = await pool.query(controlQuery, [datosQR.id_control]);
      if (!controlResult.rows[0]) {
        throw new Error('El control asociado no existe');
      }
    }

    const query = `
      INSERT INTO qr_reserva (
        fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva, id_control
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      datosQR.fecha_generado,
      datosQR.fecha_expira || null,
      datosQR.qr_url_imagen || null,
      datosQR.codigo_qr || null,
      datosQR.estado || 'activo',
      datosQR.id_reserva,
      datosQR.id_control || null
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error al crear QR de reserva:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Actualizar QR de reserva parcialmente
 */
const actualizarQR = async (id, camposActualizar) => {
  try {
    const camposPermitidos = ['fecha_generado', 'fecha_expira', 'qr_url_imagen', 'codigo_qr', 'estado', 'id_reserva', 'id_control'];

    const campos = Object.keys(camposActualizar).filter(key => 
      camposPermitidos.includes(key)
    );

    if (campos.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    // Validar fechas
    if (camposActualizar.fecha_generado) {
      const fechaGenerado = new Date(camposActualizar.fecha_generado);
      if (isNaN(fechaGenerado.getTime())) {
        throw new Error('La fecha de generación no es válida');
      }
      if (camposActualizar.fecha_expira) {
        const fechaExpira = new Date(camposActualizar.fecha_expira);
        if (isNaN(fechaExpira.getTime())) {
          throw new Error('La fecha de expiración no es válida');
        }
        if (fechaExpira <= fechaGenerado) {
          throw new Error('La fecha de expiración debe ser posterior a la fecha de generación');
        }
      }
    }

    // Validar longitud de campos
    if (camposActualizar.qr_url_imagen && camposActualizar.qr_url_imagen.length > 255) {
      throw new Error('La URL de la imagen del QR no debe exceder los 255 caracteres');
    }
    if (camposActualizar.codigo_qr && camposActualizar.codigo_qr.length > 255) {
      throw new Error('El código QR no debe exceder los 255 caracteres');
    }

    // Validar estado
    const estadosValidos = ['activo', 'expirado', 'usado'];
    if (camposActualizar.estado && !estadosValidos.includes(camposActualizar.estado)) {
      throw new Error(`El estado debe ser uno de: ${estadosValidos.join(', ')}`);
    }

    // Validar reserva si se proporciona
    if (camposActualizar.id_reserva) {
      const reservaQuery = `
        SELECT id_reserva FROM reserva WHERE id_reserva = $1
      `;
      const reservaResult = await pool.query(reservaQuery, [camposActualizar.id_reserva]);
      if (!reservaResult.rows[0]) {
        throw new Error('La reserva asociada no existe');
      }
      // Verificar unicidad de id_reserva
      const qrExistenteQuery = `
        SELECT id_qr FROM qr_reserva WHERE id_reserva = $1 AND id_qr != $2
      `;
      const qrExistenteResult = await pool.query(qrExistenteQuery, [camposActualizar.id_reserva, id]);
      if (qrExistenteResult.rows[0]) {
        throw new Error('Ya existe otro QR asociado a esta reserva');
      }
    }

    // Validar control si se proporciona
    if (camposActualizar.id_control) {
      const controlQuery = `
        SELECT id_control FROM control WHERE id_control = $1
      `;
      const controlResult = await pool.query(controlQuery, [camposActualizar.id_control]);
      if (!controlResult.rows[0]) {
        throw new Error('El control asociado no existe');
      }
    }

    const setClause = campos.map((campo, index) => `${campo} = $${index + 2}`).join(', ');
    const values = campos.map(campo => camposActualizar[campo] || null);
    
    const query = `
      UPDATE qr_reserva 
      SET ${setClause}
      WHERE id_qr = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar QR de reserva
 */
const eliminarQR = async (id) => {
  try {
    const query = 'DELETE FROM qr_reserva WHERE id_qr = $1 RETURNING id_qr';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

// CONTROLADORES - Manejan las request y response

/**
 * Controlador para GET /datos-especificos
 */
const obtenerDatosEspecificosController = async (req, res) => {
  try {
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const { qrs, total } = await obtenerDatosEspecificos(limite, offset);
    
    res.json(respuesta(true, 'QRs de reserva obtenidos correctamente', {
      qrs,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en obtenerDatosEspecificos:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /filtro
 */
const obtenerQRsFiltradosController = async (req, res) => {
  try {
    const { tipo } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const tiposValidos = ['fecha_generado', 'estado'];
    if (!tipo || !tiposValidos.includes(tipo)) {
      return res.status(400).json(respuesta(false, 'El parámetro "tipo" es inválido o no proporcionado'));
    }

    const { qrs, total } = await obtenerQRsFiltrados(tipo, limite, offset);

    res.json(respuesta(true, `QRs de reserva filtrados por ${tipo} obtenidos correctamente`, {
      qrs,
      filtro: tipo,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en obtenerQRsFiltrados:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /buscar
 */
const buscarQRsController = async (req, res) => {
  try {
    const { q } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    if (!q) {
      return res.status(400).json(respuesta(false, 'El parámetro de búsqueda "q" es requerido'));
    }

    const { qrs, total } = await buscarQRs(q, limite, offset);
    
    res.json(respuesta(true, 'QRs de reserva obtenidos correctamente', {
      qrs,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en buscarQRs:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /dato-individual/:id
 */
const obtenerQRPorIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de QR no válido'));
    }

    const qr = await obtenerQRPorId(parseInt(id));

    if (!qr) {
      return res.status(404).json(respuesta(false, 'QR de reserva no encontrado'));
    }

    res.json(respuesta(true, 'QR de reserva obtenido correctamente', { qr }));
  } catch (error) {
    console.error('Error en obtenerQRPorId:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para POST - Crear QR de reserva
 */
const crearQRController = async (req, res) => {
  try {
    const datos = req.body;

    // Validaciones básicas
    const camposObligatorios = ['id_reserva', 'fecha_generado'];
    const faltantes = camposObligatorios.filter(campo => !datos[campo] || datos[campo].toString().trim() === '');

    if (faltantes.length > 0) {
      return res.status(400).json(
        respuesta(false, `Faltan campos obligatorios: ${faltantes.join(', ')}`)
      );
    }

    const nuevoQR = await crearQR(datos);

    res.status(201).json(respuesta(true, 'QR de reserva creado correctamente', { qr: nuevoQR }));
  } catch (error) {
    console.error('Error en crearQR:', error.message);
    
    if (error.code === '23505') { // Violación de unique constraint
      return res.status(400).json(respuesta(false, 'Ya existe un QR asociado a esta reserva'));
    }

    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para PATCH - Actualizar QR de reserva
 */
const actualizarQRController = async (req, res) => {
  try {
    const { id } = req.params;
    const camposActualizar = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de QR no válido'));
    }

    if (Object.keys(camposActualizar).length === 0) {
      return res.status(400).json(respuesta(false, 'No se proporcionaron campos para actualizar'));
    }

    const qrActualizado = await actualizarQR(parseInt(id), camposActualizar);

    if (!qrActualizado) {
      return res.status(404).json(respuesta(false, 'QR de reserva no encontrado'));
    }

    res.json(respuesta(true, 'QR de reserva actualizado correctamente', { qr: qrActualizado }));
  } catch (error) {
    console.error('Error en actualizarQR:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para DELETE - Eliminar QR de reserva
 */
const eliminarQRController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de QR no válido'));
    }

    const qrEliminado = await eliminarQR(parseInt(id));

    if (!qrEliminado) {
      return res.status(404).json(respuesta(false, 'QR de reserva no encontrado'));
    }

    res.json(respuesta(true, 'QR de reserva eliminado correctamente'));
  } catch (error) {
    console.error('Error en eliminarQR:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

// RUTAS

// GET endpoints
router.get('/datos-especificos', obtenerDatosEspecificosController);
router.get('/filtro', obtenerQRsFiltradosController);
router.get('/buscar', buscarQRsController);
router.get('/dato-individual/:id', obtenerQRPorIdController);

// POST, PATCH, DELETE endpoints
router.post('/', crearQRController);
router.patch('/:id', actualizarQRController);
router.delete('/:id', eliminarQRController);

module.exports = router;