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
 * Obtener datos específicos de administradores con información de la persona
 */
const obtenerDatosEspecificos = async (limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT a.id_administrador, p.nombre, p.apellido, p.correo, a.direccion, a.estado, a.ultimo_login, a.fecha_creacion
      FROM administrador a
      JOIN usuario p ON a.id_administrador = p.id_persona
      ORDER BY a.id_administrador
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM administrador`;
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);
    return {
      administradores: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener administradores con filtros de ordenamiento
 */
const obtenerAdministradoresFiltrados = async (tipoFiltro, limite = 10, offset = 0) => {
  try {
    const ordenesPermitidas = {
      nombre: 'p.nombre ASC, p.apellido ASC',
      fecha: 'a.fecha_creacion DESC',
      correo: 'p.correo ASC',
      default: 'a.id_administrador ASC'
    };

    const orden = ordenesPermitidas[tipoFiltro] || ordenesPermitidas.default;

    const queryDatos = `
      SELECT a.id_administrador, p.nombre, p.apellido, p.correo, a.direccion, a.estado, a.ultimo_login, a.fecha_creacion
      FROM administrador a
      JOIN usuario p ON a.id_administrador = p.id_persona
      ORDER BY ${orden}
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM administrador`;

    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);

    return {
      administradores: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw new Error(`Error al obtener administradores filtrados: ${error.message}`);
  }
};

/**
 * Buscar administradores por texto en múltiples campos
 */
const buscarAdministradores = async (texto, limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT a.id_administrador, p.nombre, p.apellido, p.correo, a.direccion, a.estado, a.ultimo_login, a.fecha_creacion
      FROM administrador a
      JOIN usuario p ON a.id_administrador = p.id_persona
      WHERE 
        p.nombre ILIKE $1 OR 
        p.apellido ILIKE $1 OR 
        p.correo ILIKE $1 OR 
        a.direccion ILIKE $1
      ORDER BY p.nombre, p.apellido
      LIMIT $2 OFFSET $3
    `;

    const queryTotal = `
      SELECT COUNT(*) 
      FROM administrador a
      JOIN usuario p ON a.id_administrador = p.id_persona
      WHERE 
        p.nombre ILIKE $1 OR 
        p.apellido ILIKE $1 OR 
        p.correo ILIKE $1 OR 
        a.direccion ILIKE $1
    `;
    
    const sanitizeInput = (input) => input.replace(/[%_\\]/g, '\\$&');
    const terminoBusqueda = `%${sanitizeInput(texto)}%`;
    
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [terminoBusqueda, limite, offset]),
      pool.query(queryTotal, [terminoBusqueda])
    ]);

    return {
      administradores: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener administrador por ID
 */
const obtenerAdministradorPorId = async (id) => {
  try {
    const query = `
      SELECT a.id_administrador, p.nombre, p.apellido, p.correo, p.usuario, a.direccion, a.estado, a.ultimo_login, a.fecha_creacion
      FROM administrador a
      JOIN usuario p ON a.id_administrador = p.id_persona
      WHERE a.id_administrador = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Crear nuevo administrador
 */
const crearAdministrador = async (datosAdministrador) => {
  try {
    // Validaciones básicas
    if (!datosAdministrador.id_administrador || isNaN(datosAdministrador.id_administrador)) {
      throw new Error('El ID del administrador es obligatorio y debe ser un número');
    }

    // Verificar si la persona existe
    const personaQuery = `
      SELECT id_persona FROM usuario WHERE id_persona = $1
    `;
    const personaResult = await pool.query(personaQuery, [datosAdministrador.id_administrador]);
    if (!personaResult.rows[0]) {
      throw new Error('La persona asociada no existe');
    }

    const query = `
      INSERT INTO administrador (
        id_administrador, direccion, estado, ultimo_login
      ) 
      VALUES ($1, $2, $3, $4)
      RETURNING id_administrador, direccion, estado, ultimo_login, fecha_creacion
    `;

    const values = [
      datosAdministrador.id_administrador,
      datosAdministrador.direccion || null,
      datosAdministrador.estado !== undefined ? datosAdministrador.estado : true,
      datosAdministrador.ultimo_login || null
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error al crear administrador:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Actualizar administrador parcialmente
 */
const actualizarAdministrador = async (id, camposActualizar) => {
  try {
    const camposPermitidos = ['direccion', 'estado', 'ultimo_login'];

    const campos = Object.keys(camposActualizar).filter(key => 
      camposPermitidos.includes(key)
    );

    if (campos.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    const setClause = campos.map((campo, index) => `${campo} = $${index + 2}`).join(', ');
    const values = campos.map(campo => camposActualizar[campo] || null);
    
    const query = `
      UPDATE administrador 
      SET ${setClause}
      WHERE id_administrador = $1
      RETURNING id_administrador, direccion, estado, ultimo_login, fecha_creacion
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar administrador
 */
const eliminarAdministrador = async (id) => {
  try {
    const query = 'DELETE FROM administrador WHERE id_administrador = $1 RETURNING id_administrador';
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

    const { administradores, total } = await obtenerDatosEspecificos(limite, offset);
    
    res.json(respuesta(true, 'Administradores obtenidos correctamente', {
      administradores,
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
const obtenerAdministradoresFiltradosController = async (req, res) => {
  try {
    const { tipo } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const tiposValidos = ['nombre', 'fecha', 'correo'];
    if (!tipo || !tiposValidos.includes(tipo)) {
      return res.status(400).json(respuesta(false, 'El parámetro "tipo" es inválido o no proporcionado'));
    }

    const { administradores, total } = await obtenerAdministradoresFiltrados(tipo, limite, offset);

    res.json(respuesta(true, `Administradores filtrados por ${tipo} obtenidos correctamente`, {
      administradores,
      filtro: tipo,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en obtenerAdministradoresFiltrados:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /buscar
 */
const buscarAdministradoresController = async (req, res) => {
  try {
    const { q } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    if (!q) {
      return res.status(400).json(respuesta(false, 'El parámetro de búsqueda "q" es requerido'));
    }

    const { administradores, total } = await buscarAdministradores(q, limite, offset);
    
    res.json(respuesta(true, 'Administradores obtenidos correctamente', {
      administradores,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en buscarAdministradores:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /dato-individual/:id
 */
const obtenerAdministradorPorIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de administrador no válido'));
    }

    const administrador = await obtenerAdministradorPorId(parseInt(id));

    if (!administrador) {
      return res.status(404).json(respuesta(false, 'Administrador no encontrado'));
    }

    res.json(respuesta(true, 'Administrador obtenido correctamente', { administrador }));
  } catch (error) {
    console.error('Error en obtenerAdministradorPorId:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para POST - Crear administrador
 */
const crearAdministradorController = async (req, res) => {
  try {
    const datos = req.body;

    // Validaciones básicas
    const camposObligatorios = ['id_administrador'];
    const faltantes = camposObligatorios.filter(campo => !datos[campo] || datos[campo].toString().trim() === '');

    if (faltantes.length > 0) {
      return res.status(400).json(
        respuesta(false, `Faltan campos obligatorios: ${faltantes.join(', ')}`)
      );
    }

    const nuevoAdministrador = await crearAdministrador(datos);

    res.status(201).json(respuesta(true, 'Administrador creado correctamente', { administrador: nuevoAdministrador }));
  } catch (error) {
    console.error('Error en crearAdministrador:', error.message);
    
    if (error.code === '23505') { // Violación de unique constraint
      return res.status(400).json(respuesta(false, 'El ID del administrador ya existe'));
    }
    
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para PATCH - Actualizar administrador
 */
const actualizarAdministradorController = async (req, res) => {
  try {
    const { id } = req.params;
    const camposActualizar = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de administrador no válido'));
    }

    if (Object.keys(camposActualizar).length === 0) {
      return res.status(400).json(respuesta(false, 'No se proporcionaron campos para actualizar'));
    }

    const administradorActualizado = await actualizarAdministrador(parseInt(id), camposActualizar);

    if (!administradorActualizado) {
      return res.status(404).json(respuesta(false, 'Administrador no encontrado'));
    }

    res.json(respuesta(true, 'Administrador actualizado correctamente', { administrador: administradorActualizado }));
  } catch (error) {
    console.error('Error en actualizarAdministrador:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para DELETE - Eliminar administrador
 */
const eliminarAdministradorController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de administrador no válido'));
    }

    const administradorEliminado = await eliminarAdministrador(parseInt(id));

    if (!administradorEliminado) {
      return res.status(404).json(respuesta(false, 'Administrador no encontrado'));
    }

    res.json(respuesta(true, 'Administrador eliminado correctamente'));
  } catch (error) {
    console.error('Error en eliminarAdministrador:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

// RUTAS

// GET endpoints
router.get('/datos-especificos', obtenerDatosEspecificosController);
router.get('/filtro', obtenerAdministradoresFiltradosController);
router.get('/buscar', buscarAdministradoresController);
router.get('/dato-individual/:id', obtenerAdministradorPorIdController);

// POST, PATCH, DELETE endpoints
router.post('/', crearAdministradorController);
router.patch('/:id', actualizarAdministradorController);
router.delete('/:id', eliminarAdministradorController);

module.exports = router;