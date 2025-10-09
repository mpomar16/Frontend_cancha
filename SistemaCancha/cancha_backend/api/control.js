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
 * Obtener datos específicos de controles con información de la persona
 */
const obtenerDatosEspecificos = async (limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT c.id_control, p.nombre, p.apellido, p.correo, c.fecha_asignacion, c.estado
      FROM control c
      JOIN usuario p ON c.id_control = p.id_persona
      ORDER BY c.id_control
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM control`;
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);
    return {
      controles: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener controles con filtros de ordenamiento
 */
const obtenerControlesFiltrados = async (tipoFiltro, limite = 10, offset = 0) => {
  try {
    const ordenesPermitidas = {
      nombre: 'p.nombre ASC, p.apellido ASC',
      fecha: 'c.fecha_asignacion DESC',
      correo: 'p.correo ASC',
      default: 'c.id_control ASC'
    };

    const orden = ordenesPermitidas[tipoFiltro] || ordenesPermitidas.default;

    const queryDatos = `
      SELECT c.id_control, p.nombre, p.apellido, p.correo, c.fecha_asignacion, c.estado
      FROM control c
      JOIN usuario p ON c.id_control = p.id_persona
      ORDER BY ${orden}
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM control`;

    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);

    return {
      controles: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw new Error(`Error al obtener controles filtrados: ${error.message}`);
  }
};

/**
 * Buscar controles por texto en múltiples campos
 */
const buscarControles = async (texto, limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT c.id_control, p.nombre, p.apellido, p.correo, c.fecha_asignacion, c.estado
      FROM control c
      JOIN usuario p ON c.id_control = p.id_persona
      WHERE 
        p.nombre ILIKE $1 OR 
        p.apellido ILIKE $1 OR 
        p.correo ILIKE $1
      ORDER BY p.nombre, p.apellido
      LIMIT $2 OFFSET $3
    `;

    const queryTotal = `
      SELECT COUNT(*) 
      FROM control c
      JOIN usuario p ON c.id_control = p.id_persona
      WHERE 
        p.nombre ILIKE $1 OR 
        p.apellido ILIKE $1 OR 
        p.correo ILIKE $1
    `;
    
    const sanitizeInput = (input) => input.replace(/[%_\\]/g, '\\$&');
    const terminoBusqueda = `%${sanitizeInput(texto)}%`;
    
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [terminoBusqueda, limite, offset]),
      pool.query(queryTotal, [terminoBusqueda])
    ]);

    return {
      controles: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener control por ID
 */
const obtenerControlPorId = async (id) => {
  try {
    const query = `
      SELECT c.id_control, p.nombre, p.apellido, p.correo, p.usuario, c.fecha_asignacion, c.estado
      FROM control c
      JOIN usuario p ON c.id_control = p.id_persona
      WHERE c.id_control = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Crear nuevo control
 */
const crearControl = async (datosControl) => {
  try {
    // Validaciones básicas
    if (!datosControl.id_control || isNaN(datosControl.id_control)) {
      throw new Error('El ID del control es obligatorio y debe ser un número');
    }

    // Verificar si la persona existe
    const personaQuery = `
      SELECT id_persona FROM usuario WHERE id_persona = $1
    `;
    const personaResult = await pool.query(personaQuery, [datosControl.id_control]);
    if (!personaResult.rows[0]) {
      throw new Error('La persona asociada no existe');
    }

    // Validar fecha_asignacion si se proporciona
    if (datosControl.fecha_asignacion) {
      const fechaAsignacion = new Date(datosControl.fecha_asignacion);
      if (isNaN(fechaAsignacion.getTime()) || fechaAsignacion > new Date()) {
        throw new Error('La fecha de asignación no es válida o está en el futuro');
      }
    }

    const query = `
      INSERT INTO control (
        id_control, fecha_asignacion, estado
      ) 
      VALUES ($1, $2, $3)
      RETURNING id_control, fecha_asignacion, estado
    `;

    const values = [
      datosControl.id_control,
      datosControl.fecha_asignacion || new Date().toISOString().split('T')[0],
      datosControl.estado !== undefined ? datosControl.estado : true
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error al crear control:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Actualizar control parcialmente
 */
const actualizarControl = async (id, camposActualizar) => {
  try {
    const camposPermitidos = ['fecha_asignacion', 'estado'];

    const campos = Object.keys(camposActualizar).filter(key => 
      camposPermitidos.includes(key)
    );

    if (campos.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    // Validar fecha_asignacion si se proporciona
    if (camposActualizar.fecha_asignacion) {
      const fechaAsignacion = new Date(camposActualizar.fecha_asignacion);
      if (isNaN(fechaAsignacion.getTime()) || fechaAsignacion > new Date()) {
        throw new Error('La fecha de asignación no es válida o está en el futuro');
      }
    }

    const setClause = campos.map((campo, index) => `${campo} = $${index + 2}`).join(', ');
    const values = campos.map(campo => camposActualizar[campo] || null);
    
    const query = `
      UPDATE control 
      SET ${setClause}
      WHERE id_control = $1
      RETURNING id_control, fecha_asignacion, estado
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar control
 */
const eliminarControl = async (id) => {
  try {
    const query = 'DELETE FROM control WHERE id_control = $1 RETURNING id_control';
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

    const { controles, total } = await obtenerDatosEspecificos(limite, offset);
    
    res.json(respuesta(true, 'Controles obtenidos correctamente', {
      controles,
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
const obtenerControlesFiltradosController = async (req, res) => {
  try {
    const { tipo } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const tiposValidos = ['nombre', 'fecha', 'correo'];
    if (!tipo || !tiposValidos.includes(tipo)) {
      return res.status(400).json(respuesta(false, 'El parámetro "tipo" es inválido o no proporcionado'));
    }

    const { controles, total } = await obtenerControlesFiltrados(tipo, limite, offset);

    res.json(respuesta(true, `Controles filtrados por ${tipo} obtenidos correctamente`, {
      controles,
      filtro: tipo,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en obtenerControlesFiltrados:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /buscar
 */
const buscarControlesController = async (req, res) => {
  try {
    const { q } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    if (!q) {
      return res.status(400).json(respuesta(false, 'El parámetro de búsqueda "q" es requerido'));
    }

    const { controles, total } = await buscarControles(q, limite, offset);
    
    res.json(respuesta(true, 'Controles obtenidos correctamente', {
      controles,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en buscarControles:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /dato-individual/:id
 */
const obtenerControlPorIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de control no válido'));
    }

    const control = await obtenerControlPorId(parseInt(id));

    if (!control) {
      return res.status(404).json(respuesta(false, 'Control no encontrado'));
    }

    res.json(respuesta(true, 'Control obtenido correctamente', { control }));
  } catch (error) {
    console.error('Error en obtenerControlPorId:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para POST - Crear control
 */
const crearControlController = async (req, res) => {
  try {
    const datos = req.body;

    // Validaciones básicas
    const camposObligatorios = ['id_control'];
    const faltantes = camposObligatorios.filter(campo => !datos[campo] || datos[campo].toString().trim() === '');

    if (faltantes.length > 0) {
      return res.status(400).json(
        respuesta(false, `Faltan campos obligatorios: ${faltantes.join(', ')}`)
      );
    }

    const nuevoControl = await crearControl(datos);

    res.status(201).json(respuesta(true, 'Control creado correctamente', { control: nuevoControl }));
  } catch (error) {
    console.error('Error en crearControl:', error.message);
    
    if (error.code === '23505') { // Violación de unique constraint
      return res.status(400).json(respuesta(false, 'El ID del control ya existe'));
    }

    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para PATCH - Actualizar control
 */
const actualizarControlController = async (req, res) => {
  try {
    const { id } = req.params;
    const camposActualizar = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de control no válido'));
    }

    if (Object.keys(camposActualizar).length === 0) {
      return res.status(400).json(respuesta(false, 'No se proporcionaron campos para actualizar'));
    }

    const controlActualizado = await actualizarControl(parseInt(id), camposActualizar);

    if (!controlActualizado) {
      return res.status(404).json(respuesta(false, 'Control no encontrado'));
    }

    res.json(respuesta(true, 'Control actualizado correctamente', { control: controlActualizado }));
  } catch (error) {
    console.error('Error en actualizarControl:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para DELETE - Eliminar control
 */
const eliminarControlController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de control no válido'));
    }

    const controlEliminado = await eliminarControl(parseInt(id));

    if (!controlEliminado) {
      return res.status(404).json(respuesta(false, 'Control no encontrado'));
    }

    res.json(respuesta(true, 'Control eliminado correctamente'));
  } catch (error) {
    console.error('Error en eliminarControl:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

// RUTAS

// GET endpoints
router.get('/datos-especificos', obtenerDatosEspecificosController);
router.get('/filtro', obtenerControlesFiltradosController);
router.get('/buscar', buscarControlesController);
router.get('/dato-individual/:id', obtenerControlPorIdController);

// POST, PATCH, DELETE endpoints
router.post('/', crearControlController);
router.patch('/:id', actualizarControlController);
router.delete('/:id', eliminarControlController);

module.exports = router;