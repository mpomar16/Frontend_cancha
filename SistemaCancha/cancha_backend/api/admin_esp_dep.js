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
 * Obtener datos específicos de administradores especiales con información de la persona
 */
const obtenerDatosEspecificos = async (limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT a.id_admin_esp_dep, p.nombre, p.apellido, p.correo, a.fecha_ingreso, a.direccion, a.estado
      FROM admin_esp_dep a
      JOIN usuario p ON a.id_admin_esp_dep = p.id_persona
      ORDER BY a.id_admin_esp_dep
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM admin_esp_dep`;
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
 * Obtener administradores especiales con filtros de ordenamiento
 */
const obtenerAdministradoresFiltrados = async (tipoFiltro, limite = 10, offset = 0) => {
  try {
    const ordenesPermitidas = {
      nombre: 'p.nombre ASC, p.apellido ASC',
      fecha: 'a.fecha_ingreso DESC',
      correo: 'p.correo ASC',
      default: 'a.id_admin_esp_dep ASC'
    };

    const orden = ordenesPermitidas[tipoFiltro] || ordenesPermitidas.default;

    const queryDatos = `
      SELECT a.id_admin_esp_dep, p.nombre, p.apellido, p.correo, a.fecha_ingreso, a.direccion, a.estado
      FROM admin_esp_dep a
      JOIN usuario p ON a.id_admin_esp_dep = p.id_persona
      ORDER BY ${orden}
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM admin_esp_dep`;

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
 * Buscar administradores especiales por texto en múltiples campos
 */
const buscarAdministradores = async (texto, limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT a.id_admin_esp_dep, p.nombre, p.apellido, p.correo, a.fecha_ingreso, a.direccion, a.estado
      FROM admin_esp_dep a
      JOIN usuario p ON a.id_admin_esp_dep = p.id_persona
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
      FROM admin_esp_dep a
      JOIN usuario p ON a.id_admin_esp_dep = p.id_persona
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
 * Obtener administrador especial por ID
 */
const obtenerAdministradorPorId = async (id) => {
  try {
    const query = `
      SELECT a.id_admin_esp_dep, p.nombre, p.apellido, p.correo, p.usuario, a.fecha_ingreso, a.direccion, a.estado
      FROM admin_esp_dep a
      JOIN usuario p ON a.id_admin_esp_dep = p.id_persona
      WHERE a.id_admin_esp_dep = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Crear nuevo administrador especial
 */
const crearAdministrador = async (datosAdministrador) => {
  try {
    // Validaciones básicas
    if (!datosAdministrador.id_admin_esp_dep || isNaN(datosAdministrador.id_admin_esp_dep)) {
      throw new Error('El ID del administrador especial es obligatorio y debe ser un número');
    }

    // Verificar si la persona existe
    const personaQuery = `
      SELECT id_persona FROM persona WHERE id_persona = $1
    `;
    const personaResult = await pool.query(personaQuery, [datosAdministrador.id_admin_esp_dep]);
    if (!personaResult.rows[0]) {
      throw new Error('La persona asociada no existe');
    }

    // Validar fecha_ingreso
    if (!datosAdministrador.fecha_ingreso) {
      throw new Error('La fecha de ingreso es obligatoria');
    }
    const fechaIngreso = new Date(datosAdministrador.fecha_ingreso);
    if (isNaN(fechaIngreso.getTime()) || fechaIngreso > new Date()) {
      throw new Error('La fecha de ingreso no es válida o está en el futuro');
    }

    // Validar direccion
    if (datosAdministrador.direccion && datosAdministrador.direccion.length > 255) {
      throw new Error('La dirección no debe exceder los 255 caracteres');
    }

    const query = `
      INSERT INTO admin_esp_dep (
        id_admin_esp_dep, fecha_ingreso, direccion, estado
      ) 
      VALUES ($1, $2, $3, $4)
      RETURNING id_admin_esp_dep, fecha_ingreso, direccion, estado
    `;

    const values = [
      datosAdministrador.id_admin_esp_dep,
      datosAdministrador.fecha_ingreso,
      datosAdministrador.direccion || null,
      datosAdministrador.estado !== undefined ? datosAdministrador.estado : true
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error al crear administrador especial:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Actualizar administrador especial parcialmente
 */
const actualizarAdministrador = async (id, camposActualizar) => {
  try {
    const camposPermitidos = ['fecha_ingreso', 'direccion', 'estado'];

    const campos = Object.keys(camposActualizar).filter(key => 
      camposPermitidos.includes(key)
    );

    if (campos.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    // Validar fecha_ingreso si se proporciona
    if (camposActualizar.fecha_ingreso) {
      const fechaIngreso = new Date(camposActualizar.fecha_ingreso);
      if (isNaN(fechaIngreso.getTime()) || fechaIngreso > new Date()) {
        throw new Error('La fecha de ingreso no es válida o está en el futuro');
      }
    }

    // Validar direccion si se proporciona
    if (camposActualizar.direccion && camposActualizar.direccion.length > 255) {
      throw new Error('La dirección no debe exceder los 255 caracteres');
    }

    const setClause = campos.map((campo, index) => `${campo} = $${index + 2}`).join(', ');
    const values = campos.map(campo => camposActualizar[campo] || null);
    
    const query = `
      UPDATE admin_esp_dep 
      SET ${setClause}
      WHERE id_admin_esp_dep = $1
      RETURNING id_admin_esp_dep, fecha_ingreso, direccion, estado
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar administrador especial
 */
const eliminarAdministrador = async (id) => {
  try {
    const query = 'DELETE FROM admin_esp_dep WHERE id_admin_esp_dep = $1 RETURNING id_admin_esp_dep';
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
    
    res.json(respuesta(true, 'Administradores especiales obtenidos correctamente', {
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

    res.json(respuesta(true, `Administradores especiales filtrados por ${tipo} obtenidos correctamente`, {
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
    
    res.json(respuesta(true, 'Administradores especiales obtenidos correctamente', {
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
      return res.status(400).json(respuesta(false, 'ID de administrador especial no válido'));
    }

    const administrador = await obtenerAdministradorPorId(parseInt(id));

    if (!administrador) {
      return res.status(404).json(respuesta(false, 'Administrador especial no encontrado'));
    }

    res.json(respuesta(true, 'Administrador especial obtenido correctamente', { administrador }));
  } catch (error) {
    console.error('Error en obtenerAdministradorPorId:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para POST - Crear administrador especial
 */
const crearAdministradorController = async (req, res) => {
  try {
    const datos = req.body;

    // Validaciones básicas
    const camposObligatorios = ['id_admin_esp_dep', 'fecha_ingreso'];
    const faltantes = camposObligatorios.filter(campo => !datos[campo] || datos[campo].toString().trim() === '');

    if (faltantes.length > 0) {
      return res.status(400).json(
        respuesta(false, `Faltan campos obligatorios: ${faltantes.join(', ')}`)
      );
    }

    const nuevoAdministrador = await crearAdministrador(datos);

    res.status(201).json(respuesta(true, 'Administrador especial creado correctamente', { administrador: nuevoAdministrador }));
  } catch (error) {
    console.error('Error en crearAdministrador:', error.message);
    
    if (error.code === '23505') { // Violación de unique constraint
      return res.status(400).json(respuesta(false, 'El ID del administrador especial ya existe'));
    }
    
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para PATCH - Actualizar administrador especial
 */
const actualizarAdministradorController = async (req, res) => {
  try {
    const { id } = req.params;
    const camposActualizar = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de administrador especial no válido'));
    }

    if (Object.keys(camposActualizar).length === 0) {
      return res.status(400).json(respuesta(false, 'No se proporcionaron campos para actualizar'));
    }

    const administradorActualizado = await actualizarAdministrador(parseInt(id), camposActualizar);

    if (!administradorActualizado) {
      return res.status(404).json(respuesta(false, 'Administrador especial no encontrado'));
    }

    res.json(respuesta(true, 'Administrador especial actualizado correctamente', { administrador: administradorActualizado }));
  } catch (error) {
    console.error('Error en actualizarAdministrador:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para DELETE - Eliminar administrador especial
 */
const eliminarAdministradorController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de administrador especial no válido'));
    }

    const administradorEliminado = await eliminarAdministrador(parseInt(id));

    if (!administradorEliminado) {
      return res.status(404).json(respuesta(false, 'Administrador especial no encontrado'));
    }

    res.json(respuesta(true, 'Administrador especial eliminado correctamente'));
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