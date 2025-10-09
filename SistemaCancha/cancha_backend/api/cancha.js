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
 * Obtener datos específicos de canchas con información del espacio deportivo
 */
const obtenerDatosEspecificos = async (limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT c.id_cancha, c.nombre, c.ubicacion, c.capacidad, c.estado, c.monto_por_hora, 
             e.id_espacio, e.nombre AS espacio_nombre
      FROM cancha c
      JOIN espacio_deportivo e ON c.id_espacio = e.id_espacio
      ORDER BY c.id_cancha
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM cancha`;
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);
    return {
      canchas: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener canchas con filtros de ordenamiento
 */
const obtenerCanchasFiltradas = async (tipoFiltro, limite = 10, offset = 0) => {
  try {
    const ordenesPermitidas = {
      nombre: 'c.nombre ASC',
      estado: 'c.estado ASC',
      monto: 'c.monto_por_hora ASC',
      default: 'c.id_cancha ASC'
    };

    const orden = ordenesPermitidas[tipoFiltro] || ordenesPermitidas.default;

    const queryDatos = `
      SELECT c.id_cancha, c.nombre, c.ubicacion, c.capacidad, c.estado, c.monto_por_hora, 
             e.id_espacio, e.nombre AS espacio_nombre
      FROM cancha c
      JOIN espacio_deportivo e ON c.id_espacio = e.id_espacio
      ORDER BY ${orden}
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM cancha`;

    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);

    return {
      canchas: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw new Error(`Error al obtener canchas filtradas: ${error.message}`);
  }
};

/**
 * Buscar canchas por texto en múltiples campos
 */
const buscarCanchas = async (texto, limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT c.id_cancha, c.nombre, c.ubicacion, c.capacidad, c.estado, c.monto_por_hora, 
             e.id_espacio, e.nombre AS espacio_nombre
      FROM cancha c
      JOIN espacio_deportivo e ON c.id_espacio = e.id_espacio
      WHERE 
        c.nombre ILIKE $1 OR 
        c.ubicacion ILIKE $1 OR 
        e.nombre ILIKE $1
      ORDER BY c.nombre
      LIMIT $2 OFFSET $3
    `;

    const queryTotal = `
      SELECT COUNT(*) 
      FROM cancha c
      JOIN espacio_deportivo e ON c.id_espacio = e.id_espacio
      WHERE 
        c.nombre ILIKE $1 OR 
        c.ubicacion ILIKE $1 OR 
        e.nombre ILIKE $1
    `;
    
    const sanitizeInput = (input) => input.replace(/[%_\\]/g, '\\$&');
    const terminoBusqueda = `%${sanitizeInput(texto)}%`;
    
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [terminoBusqueda, limite, offset]),
      pool.query(queryTotal, [terminoBusqueda])
    ]);

    return {
      canchas: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener cancha por ID
 */
const obtenerCanchaPorId = async (id) => {
  try {
    const query = `
      SELECT c.*, e.id_espacio, e.nombre AS espacio_nombre, e.direccion AS espacio_direccion
      FROM cancha c
      JOIN espacio_deportivo e ON c.id_espacio = e.id_espacio
      WHERE c.id_cancha = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Crear nueva cancha
 */
const crearCancha = async (datosCancha) => {
  try {
    // Validaciones básicas
    if (!datosCancha.nombre || datosCancha.nombre.trim() === '') {
      throw new Error('El nombre es obligatorio');
    }
    if (!datosCancha.id_espacio || isNaN(datosCancha.id_espacio)) {
      throw new Error('El ID del espacio deportivo es obligatorio y debe ser un número');
    }

    // Validar longitud de campos
    if (datosCancha.nombre.length > 100) {
      throw new Error('El nombre no debe exceder los 100 caracteres');
    }
    if (datosCancha.ubicacion && datosCancha.ubicacion.length > 255) {
      throw new Error('La ubicación no debe exceder los 255 caracteres');
    }
    if (datosCancha.imagen_cancha && datosCancha.imagen_cancha.length > 255) {
      throw new Error('La URL de la imagen no debe exceder los 255 caracteres');
    }

    // Validar capacidad
    if (datosCancha.capacidad && (isNaN(datosCancha.capacidad) || datosCancha.capacidad < 0)) {
      throw new Error('La capacidad debe ser un número positivo');
    }

    // Validar estado
    const estadosValidos = ['disponible', 'ocupada', 'mantenimiento'];
    if (datosCancha.estado && !estadosValidos.includes(datosCancha.estado)) {
      throw new Error(`El estado debe ser uno de: ${estadosValidos.join(', ')}`);
    }

    // Validar monto_por_hora
    if (datosCancha.monto_por_hora && (isNaN(datosCancha.monto_por_hora) || datosCancha.monto_por_hora < 0)) {
      throw new Error('El monto por hora debe ser un número positivo');
    }

    // Verificar si el espacio deportivo existe
    const espacioQuery = `
      SELECT id_espacio FROM espacio_deportivo WHERE id_espacio = $1
    `;
    const espacioResult = await pool.query(espacioQuery, [datosCancha.id_espacio]);
    if (!espacioResult.rows[0]) {
      throw new Error('El espacio deportivo asociado no existe');
    }

    const query = `
      INSERT INTO cancha (
        nombre, ubicacion, capacidad, estado, monto_por_hora, imagen_cancha, id_espacio
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      datosCancha.nombre,
      datosCancha.ubicacion || null,
      datosCancha.capacidad || null,
      datosCancha.estado || null,
      datosCancha.monto_por_hora || null,
      datosCancha.imagen_cancha || null,
      datosCancha.id_espacio
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error al crear cancha:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Actualizar cancha parcialmente
 */
const actualizarCancha = async (id, camposActualizar) => {
  try {
    const camposPermitidos = [
      'nombre', 'ubicacion', 'capacidad', 'estado', 'monto_por_hora', 'imagen_cancha', 'id_espacio'
    ];

    const campos = Object.keys(camposActualizar).filter(key => 
      camposPermitidos.includes(key)
    );

    if (campos.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    // Validar longitud de campos
    if (camposActualizar.nombre && camposActualizar.nombre.length > 100) {
      throw new Error('El nombre no debe exceder los 100 caracteres');
    }
    if (camposActualizar.ubicacion && camposActualizar.ubicacion.length > 255) {
      throw new Error('La ubicación no debe exceder los 255 caracteres');
    }
    if (camposActualizar.imagen_cancha && camposActualizar.imagen_cancha.length > 255) {
      throw new Error('La URL de la imagen no debe exceder los 255 caracteres');
    }

    // Validar capacidad
    if (camposActualizar.capacidad && (isNaN(camposActualizar.capacidad) || camposActualizar.capacidad < 0)) {
      throw new Error('La capacidad debe ser un número positivo');
    }

    // Validar estado
    const estadosValidos = ['disponible', 'ocupada', 'mantenimiento'];
    if (camposActualizar.estado && !estadosValidos.includes(camposActualizar.estado)) {
      throw new Error(`El estado debe ser uno de: ${estadosValidos.join(', ')}`);
    }

    // Validar monto_por_hora
    if (camposActualizar.monto_por_hora && (isNaN(camposActualizar.monto_por_hora) || camposActualizar.monto_por_hora < 0)) {
      throw new Error('El monto por hora debe ser un número positivo');
    }

    // Validar espacio deportivo si se proporciona
    if (camposActualizar.id_espacio) {
      const espacioQuery = `
        SELECT id_espacio FROM espacio_deportivo WHERE id_espacio = $1
      `;
      const espacioResult = await pool.query(espacioQuery, [camposActualizar.id_espacio]);
      if (!espacioResult.rows[0]) {
        throw new Error('El espacio deportivo asociado no existe');
      }
    }

    const setClause = campos.map((campo, index) => `${campo} = $${index + 2}`).join(', ');
    const values = campos.map(campo => camposActualizar[campo] || null);
    
    const query = `
      UPDATE cancha 
      SET ${setClause}
      WHERE id_cancha = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar cancha
 */
const eliminarCancha = async (id) => {
  try {
    const query = 'DELETE FROM cancha WHERE id_cancha = $1 RETURNING id_cancha';
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

    const { canchas, total } = await obtenerDatosEspecificos(limite, offset);
    
    res.json(respuesta(true, 'Canchas obtenidas correctamente', {
      canchas,
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
const obtenerCanchasFiltradasController = async (req, res) => {
  try {
    const { tipo } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const tiposValidos = ['nombre', 'estado', 'monto'];
    if (!tipo || !tiposValidos.includes(tipo)) {
      return res.status(400).json(respuesta(false, 'El parámetro "tipo" es inválido o no proporcionado'));
    }

    const { canchas, total } = await obtenerCanchasFiltradas(tipo, limite, offset);

    res.json(respuesta(true, `Canchas filtradas por ${tipo} obtenidas correctamente`, {
      canchas,
      filtro: tipo,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en obtenerCanchasFiltradas:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /buscar
 */
const buscarCanchasController = async (req, res) => {
  try {
    const { q } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    if (!q) {
      return res.status(400).json(respuesta(false, 'El parámetro de búsqueda "q" es requerido'));
    }

    const { canchas, total } = await buscarCanchas(q, limite, offset);
    
    res.json(respuesta(true, 'Canchas obtenidas correctamente', {
      canchas,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en buscarCanchas:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /dato-individual/:id
 */
const obtenerCanchaPorIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de cancha no válido'));
    }

    const cancha = await obtenerCanchaPorId(parseInt(id));

    if (!cancha) {
      return res.status(404).json(respuesta(false, 'Cancha no encontrada'));
    }

    res.json(respuesta(true, 'Cancha obtenida correctamente', { cancha }));
  } catch (error) {
    console.error('Error en obtenerCanchaPorId:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para POST - Crear cancha
 */
const crearCanchaController = async (req, res) => {
  try {
    const datos = req.body;

    // Validaciones básicas
    const camposObligatorios = ['nombre', 'id_espacio'];
    const faltantes = camposObligatorios.filter(campo => !datos[campo] || datos[campo].toString().trim() === '');

    if (faltantes.length > 0) {
      return res.status(400).json(
        respuesta(false, `Faltan campos obligatorios: ${faltantes.join(', ')}`)
      );
    }

    const nuevaCancha = await crearCancha(datos);

    res.status(201).json(respuesta(true, 'Cancha creada correctamente', { cancha: nuevaCancha }));
  } catch (error) {
    console.error('Error en crearCancha:', error.message);
    
    if (error.code === '23505') { // Violación de unique constraint
      return res.status(400).json(respuesta(false, 'La cancha ya existe'));
    }

    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para PATCH - Actualizar cancha
 */
const actualizarCanchaController = async (req, res) => {
  try {
    const { id } = req.params;
    const camposActualizar = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de cancha no válido'));
    }

    if (Object.keys(camposActualizar).length === 0) {
      return res.status(400).json(respuesta(false, 'No se proporcionaron campos para actualizar'));
    }

    const canchaActualizada = await actualizarCancha(parseInt(id), camposActualizar);

    if (!canchaActualizada) {
      return res.status(404).json(respuesta(false, 'Cancha no encontrada'));
    }

    res.json(respuesta(true, 'Cancha actualizada correctamente', { cancha: canchaActualizada }));
  } catch (error) {
    console.error('Error en actualizarCancha:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para DELETE - Eliminar cancha
 */
const eliminarCanchaController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de cancha no válido'));
    }

    const canchaEliminada = await eliminarCancha(parseInt(id));

    if (!canchaEliminada) {
      return res.status(404).json(respuesta(false, 'Cancha no encontrada'));
    }

    res.json(respuesta(true, 'Cancha eliminada correctamente'));
  } catch (error) {
    console.error('Error en eliminarCancha:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

// RUTAS

// GET endpoints
router.get('/datos-especificos', obtenerDatosEspecificosController);
router.get('/filtro', obtenerCanchasFiltradasController);
router.get('/buscar', buscarCanchasController);
router.get('/dato-individual/:id', obtenerCanchaPorIdController);

// POST, PATCH, DELETE endpoints
router.post('/', crearCanchaController);
router.patch('/:id', actualizarCanchaController);
router.delete('/:id', eliminarCanchaController);

module.exports = router;