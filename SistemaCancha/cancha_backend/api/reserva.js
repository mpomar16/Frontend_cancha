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
 * Obtener datos específicos de reservas con información de cliente y cancha
 */
const obtenerDatosEspecificos = async (limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT r.id_reserva, r.fecha_reserva, r.cupo, r.monto_total, r.saldo_pendiente, r.estado,
             c.id_cliente, p.nombre AS cliente_nombre, p.apellido AS cliente_apellido,
             ca.id_cancha, ca.nombre AS cancha_nombre
      FROM reserva r
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario p ON c.id_cliente = p.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      ORDER BY r.id_reserva
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM reserva`;
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);
    return {
      reservas: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener reservas con filtros de ordenamiento
 */
const obtenerReservasFiltradas = async (tipoFiltro, limite = 10, offset = 0) => {
  try {
    const ordenesPermitidas = {
      fecha: 'r.fecha_reserva DESC',
      monto: 'r.monto_total ASC',
      estado: 'r.estado ASC',
      default: 'r.id_reserva ASC'
    };

    const orden = ordenesPermitidas[tipoFiltro] || ordenesPermitidas.default;

    const queryDatos = `
      SELECT r.id_reserva, r.fecha_reserva, r.cupo, r.monto_total, r.saldo_pendiente, r.estado,
             c.id_cliente, p.nombre AS cliente_nombre, p.apellido AS cliente_apellido,
             ca.id_cancha, ca.nombre AS cancha_nombre
      FROM reserva r
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario p ON c.id_cliente = p.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      ORDER BY ${orden}
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM reserva`;

    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);

    return {
      reservas: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw new Error(`Error al obtener reservas filtradas: ${error.message}`);
  }
};

/**
 * Buscar reservas por texto en múltiples campos
 */
const buscarReservas = async (texto, limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT r.id_reserva, r.fecha_reserva, r.cupo, r.monto_total, r.saldo_pendiente, r.estado,
             c.id_cliente, p.nombre AS cliente_nombre, p.apellido AS cliente_apellido,
             ca.id_cancha, ca.nombre AS cancha_nombre
      FROM reserva r
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario p ON c.id_cliente = p.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      WHERE 
        p.nombre ILIKE $1 OR 
        p.apellido ILIKE $1 OR 
        ca.nombre ILIKE $1 OR 
        r.estado ILIKE $1
      ORDER BY r.fecha_reserva DESC
      LIMIT $2 OFFSET $3
    `;

    const queryTotal = `
      SELECT COUNT(*) 
      FROM reserva r
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario p ON c.id_cliente = p.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      WHERE 
        p.nombre ILIKE $1 OR 
        p.apellido ILIKE $1 OR 
        ca.nombre ILIKE $1 OR 
        r.estado ILIKE $1
    `;
    
    const sanitizeInput = (input) => input.replace(/[%_\\]/g, '\\$&');
    const terminoBusqueda = `%${sanitizeInput(texto)}%`;
    
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [terminoBusqueda, limite, offset]),
      pool.query(queryTotal, [terminoBusqueda])
    ]);

    return {
      reservas: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener reserva por ID
 */
const obtenerReservaPorId = async (id) => {
  try {
    const query = `
      SELECT r.*, 
             c.id_cliente, p.nombre AS cliente_nombre, p.apellido AS cliente_apellido, p.correo AS cliente_correo,
             ca.id_cancha, ca.nombre AS cancha_nombre
      FROM reserva r
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario p ON c.id_cliente = p.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      WHERE r.id_reserva = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Crear nueva reserva
 */
const crearReserva = async (datosReserva) => {
  try {
    // Validaciones básicas
    if (!datosReserva.id_cliente || isNaN(datosReserva.id_cliente)) {
      throw new Error('El ID del cliente es obligatorio y debe ser un número');
    }
    if (!datosReserva.id_cancha || isNaN(datosReserva.id_cancha)) {
      throw new Error('El ID de la cancha es obligatorio y debe ser un número');
    }
    if (!datosReserva.fecha_reserva) {
      throw new Error('La fecha de reserva es obligatoria');
    }
    if (!datosReserva.estado) {
      throw new Error('El estado es obligatorio');
    }

    // Validar fecha_reserva
    const fechaReserva = new Date(datosReserva.fecha_reserva);
    if (isNaN(fechaReserva.getTime())) {
      throw new Error('La fecha de reserva no es válida');
    }

    // Validar cupo
    if (datosReserva.cupo && (isNaN(datosReserva.cupo) || datosReserva.cupo <= 0)) {
      throw new Error('El cupo debe ser un número positivo');
    }

    // Validar monto_total
    if (datosReserva.monto_total && (isNaN(datosReserva.monto_total) || datosReserva.monto_total < 0)) {
      throw new Error('El monto total debe ser un número no negativo');
    }

    // Validar saldo_pendiente
    if (datosReserva.saldo_pendiente && (isNaN(datosReserva.saldo_pendiente) || datosReserva.saldo_pendiente < 0)) {
      throw new Error('El saldo pendiente debe ser un número no negativo');
    }

    // Validar que saldo_pendiente no exceda monto_total
    if (datosReserva.monto_total && datosReserva.saldo_pendiente && datosReserva.saldo_pendiente > datosReserva.monto_total) {
      throw new Error('El saldo pendiente no puede ser mayor al monto total');
    }

    // Validar estado
    const estadosValidos = ['pendiente', 'pagada', 'en_cuotas', 'cancelada'];
    if (!estadosValidos.includes(datosReserva.estado)) {
      throw new Error(`El estado debe ser uno de: ${estadosValidos.join(', ')}`);
    }

    // Verificar si el cliente existe
    const clienteQuery = `
      SELECT id_cliente FROM cliente WHERE id_cliente = $1
    `;
    const clienteResult = await pool.query(clienteQuery, [datosReserva.id_cliente]);
    if (!clienteResult.rows[0]) {
      throw new Error('El cliente asociado no existe');
    }

    // Verificar si la cancha existe
    const canchaQuery = `
      SELECT id_cancha FROM cancha WHERE id_cancha = $1
    `;
    const canchaResult = await pool.query(canchaQuery, [datosReserva.id_cancha]);
    if (!canchaResult.rows[0]) {
      throw new Error('La cancha asociada no existe');
    }

    const query = `
      INSERT INTO reserva (
        fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      datosReserva.fecha_reserva,
      datosReserva.cupo || null,
      datosReserva.monto_total || null,
      datosReserva.saldo_pendiente || null,
      datosReserva.estado,
      datosReserva.id_cliente,
      datosReserva.id_cancha
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error al crear reserva:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Actualizar reserva parcialmente
 */
const actualizarReserva = async (id, camposActualizar) => {
  try {
    const camposPermitidos = ['fecha_reserva', 'cupo', 'monto_total', 'saldo_pendiente', 'estado', 'id_cliente', 'id_cancha'];

    const campos = Object.keys(camposActualizar).filter(key => 
      camposPermitidos.includes(key)
    );

    if (campos.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    // Validar fecha_reserva
    if (camposActualizar.fecha_reserva) {
      const fechaReserva = new Date(camposActualizar.fecha_reserva);
      if (isNaN(fechaReserva.getTime())) {
        throw new Error('La fecha de reserva no es válida');
      }
    }

    // Validar cupo
    if (camposActualizar.cupo && (isNaN(camposActualizar.cupo) || camposActualizar.cupo <= 0)) {
      throw new Error('El cupo debe ser un número positivo');
    }

    // Validar monto_total
    if (camposActualizar.monto_total && (isNaN(camposActualizar.monto_total) || camposActualizar.monto_total < 0)) {
      throw new Error('El monto total debe ser un número no negativo');
    }

    // Validar saldo_pendiente
    if (camposActualizar.saldo_pendiente && (isNaN(camposActualizar.saldo_pendiente) || camposActualizar.saldo_pendiente < 0)) {
      throw new Error('El saldo pendiente debe ser un número no negativo');
    }

    // Validar que saldo_pendiente no exceda monto_total
    const montoTotal = camposActualizar.monto_total || (await obtenerReservaPorId(id))?.monto_total;
    if (montoTotal && camposActualizar.saldo_pendiente && camposActualizar.saldo_pendiente > montoTotal) {
      throw new Error('El saldo pendiente no puede ser mayor al monto total');
    }

    // Validar estado
    const estadosValidos = ['pendiente', 'pagada', 'en_cuotas', 'cancelada'];
    if (camposActualizar.estado && !estadosValidos.includes(camposActualizar.estado)) {
      throw new Error(`El estado debe ser uno de: ${estadosValidos.join(', ')}`);
    }

    // Validar cliente si se proporciona
    if (camposActualizar.id_cliente) {
      const clienteQuery = `
        SELECT id_cliente FROM cliente WHERE id_cliente = $1
      `;
      const clienteResult = await pool.query(clienteQuery, [camposActualizar.id_cliente]);
      if (!clienteResult.rows[0]) {
        throw new Error('El cliente asociado no existe');
      }
    }

    // Validar cancha si se proporciona
    if (camposActualizar.id_cancha) {
      const canchaQuery = `
        SELECT id_cancha FROM cancha WHERE id_cancha = $1
      `;
      const canchaResult = await pool.query(canchaQuery, [camposActualizar.id_cancha]);
      if (!canchaResult.rows[0]) {
        throw new Error('La cancha asociada no existe');
      }
    }

    const setClause = campos.map((campo, index) => `${campo} = $${index + 2}`).join(', ');
    const values = campos.map(campo => camposActualizar[campo] || null);
    
    const query = `
      UPDATE reserva 
      SET ${setClause}
      WHERE id_reserva = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar reserva
 */
const eliminarReserva = async (id) => {
  try {
    const query = 'DELETE FROM reserva WHERE id_reserva = $1 RETURNING id_reserva';
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

    const { reservas, total } = await obtenerDatosEspecificos(limite, offset);
    
    res.json(respuesta(true, 'Reservas obtenidas correctamente', {
      reservas,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en obtenerDatosEspecificos:', error.message);
    res.status(500).json(respuesta(false, 'Error al obtener reservas'));
  }
};

/**
 * Controlador para GET /filtro
 */
const obtenerReservasFiltradasController = async (req, res) => {
  try {
    const { tipo } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const tiposValidos = ['fecha', 'monto', 'estado'];
    if (!tipo || !tiposValidos.includes(tipo)) {
      return res.status(400).json(respuesta(false, 'El parámetro "tipo" es inválido o no proporcionado'));
    }

    const { reservas, total } = await obtenerReservasFiltradas(tipo, limite, offset);

    res.json(respuesta(true, `Reservas filtradas por ${tipo} obtenidas correctamente`, {
      reservas,
      filtro: tipo,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en obtenerReservasFiltradas:', error);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /buscar
 */
const buscarReservasController = async (req, res) => {
  try {
    const { q } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    if (!q) {
      return res.status(400).json(respuesta(false, 'El parámetro de búsqueda "q" es requerido'));
    }

    const { reservas, total } = await buscarReservas(q, limite, offset);
    
    res.json(respuesta(true, 'Reservas obtenidas correctamente', {
      reservas,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en buscarReservas:', error);
    res.status(500).json(respuesta(false, 'Error en la búsqueda'));
  }
};

/**
 * Controlador para GET /dato-individual/:id
 */
const obtenerReservaPorIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de reserva no válido'));
    }

    const reserva = await obtenerReservaPorId(parseInt(id));

    if (!reserva) {
      return res.status(404).json(respuesta(false, 'Reserva no encontrada'));
    }

    res.json(respuesta(true, 'Reserva obtenida correctamente', { reserva }));
  } catch (error) {
    console.error('Error en obtenerReservaPorId:', error);
    res.status(500).json(respuesta(false, 'Error al obtener la reserva'));
  }
};

/**
 * Controlador para POST - Crear reserva
 */
const crearReservaController = async (req, res) => {
  try {
    const datos = req.body;

    // Validaciones básicas
    const camposObligatorios = ['fecha_reserva', 'estado', 'id_cliente', 'id_cancha'];
    const faltantes = camposObligatorios.filter(campo => !datos[campo] || datos[campo].toString().trim() === '');

    if (faltantes.length > 0) {
      return res.status(400).json(
        respuesta(false, `Faltan campos obligatorios: ${faltantes.join(', ')}`)
      );
    }

    const nuevaReserva = await crearReserva(datos);

    res.status(201).json(respuesta(true, 'Reserva creada correctamente', { reserva: nuevaReserva }));
  } catch (error) {
    console.error('Error en crearReserva:', error);
    
    if (error.code === '23505') { // Violación de unique constraint
      return res.status(400).json(respuesta(false, 'La reserva ya existe'));
    }
    
    res.status(500).json(respuesta(false, 'Error al crear la reserva'));
  }
};

/**
 * Controlador para PATCH - Actualizar reserva
 */
const actualizarReservaController = async (req, res) => {
  try {
    const { id } = req.params;
    const camposActualizar = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de reserva no válido'));
    }

    if (Object.keys(camposActualizar).length === 0) {
      return res.status(400).json(respuesta(false, 'No se proporcionaron campos para actualizar'));
    }

    const reservaActualizada = await actualizarReserva(parseInt(id), camposActualizar);

    if (!reservaActualizada) {
      return res.status(404).json(respuesta(false, 'Reserva no encontrada'));
    }

    res.json(respuesta(true, 'Reserva actualizada correctamente', { reserva: reservaActualizada }));
  } catch (error) {
    console.error('Error en actualizarReserva:', error);
    res.status(500).json(respuesta(false, 'Error al actualizar la reserva'));
  }
};

/**
 * Controlador para DELETE - Eliminar reserva
 */
const eliminarReservaController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de reserva no válido'));
    }

    const reservaEliminada = await eliminarReserva(parseInt(id));

    if (!reservaEliminada) {
      return res.status(404).json(respuesta(false, 'Reserva no encontrada'));
    }

    res.json(respuesta(true, 'Reserva eliminada correctamente'));
  } catch (error) {
    console.error('Error en eliminarReserva:', error);
    res.status(500).json(respuesta(false, 'Error al eliminar la reserva'));
  }
};

// RUTAS

// GET endpoints
router.get('/datos-especificos', obtenerDatosEspecificosController);
router.get('/filtro', obtenerReservasFiltradasController);
router.get('/buscar', buscarReservasController);
router.get('/dato-individual/:id', obtenerReservaPorIdController);

// POST, PATCH, DELETE endpoints
router.post('/', crearReservaController);
router.patch('/:id', actualizarReservaController);
router.delete('/:id', eliminarReservaController);

module.exports = router;