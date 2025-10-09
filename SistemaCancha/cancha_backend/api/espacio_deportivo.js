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
 * Obtener datos específicos de espacios deportivos con información del administrador
 */
const obtenerDatosEspecificos = async (limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT e.id_espacio, e.nombre, e.direccion, e.latitud, e.longitud, e.horario_apertura, e.horario_cierre, 
             a.id_admin_esp_dep, p.nombre AS admin_nombre, p.apellido AS admin_apellido
      FROM espacio_deportivo e
      JOIN admin_esp_dep a ON e.id_admin_esp_dep = a.id_admin_esp_dep
      JOIN usuario p ON a.id_admin_esp_dep = p.id_persona
      ORDER BY e.id_espacio
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM espacio_deportivo`;
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);
    return {
      espacios: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener espacios deportivos con filtros de ordenamiento
 */
const obtenerEspaciosFiltrados = async (tipoFiltro, limite = 10, offset = 0) => {
  try {
    const ordenesPermitidas = {
      nombre: 'e.nombre ASC',
      default: 'e.id_espacio ASC'
    };

    const orden = ordenesPermitidas[tipoFiltro] || ordenesPermitidas.default;

    const queryDatos = `
      SELECT e.id_espacio, e.nombre, e.direccion, e.latitud, e.longitud, e.horario_apertura, e.horario_cierre, 
             a.id_admin_esp_dep, p.nombre AS admin_nombre, p.apellido AS admin_apellido
      FROM espacio_deportivo e
      JOIN admin_esp_dep a ON e.id_admin_esp_dep = a.id_admin_esp_dep
      JOIN usuario p ON a.id_admin_esp_dep = p.id_persona
      ORDER BY ${orden}
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM espacio_deportivo`;

    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);

    return {
      espacios: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw new Error(`Error al obtener espacios filtrados: ${error.message}`);
  }
};

/**
 * Buscar espacios deportivos por texto en múltiples campos
 */
const buscarEspacios = async (texto, limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT e.id_espacio, e.nombre, e.direccion, e.latitud, e.longitud, e.horario_apertura, e.horario_cierre, 
             a.id_admin_esp_dep, p.nombre AS admin_nombre, p.apellido AS admin_apellido
      FROM espacio_deportivo e
      JOIN admin_esp_dep a ON e.id_admin_esp_dep = a.id_admin_esp_dep
      JOIN usuario p ON a.id_admin_esp_dep = p.id_persona
      WHERE 
        e.nombre ILIKE $1 OR 
        e.direccion ILIKE $1 OR 
        e.descripcion ILIKE $1 OR 
        p.nombre ILIKE $1 OR 
        p.apellido ILIKE $1
      ORDER BY e.nombre
      LIMIT $2 OFFSET $3
    `;

    const queryTotal = `
      SELECT COUNT(*) 
      FROM espacio_deportivo e
      JOIN admin_esp_dep a ON e.id_admin_esp_dep = a.id_admin_esp_dep
      JOIN usuario p ON a.id_admin_esp_dep = p.id_persona
      WHERE 
        e.nombre ILIKE $1 OR 
        e.direccion ILIKE $1 OR 
        e.descripcion ILIKE $1 OR 
        p.nombre ILIKE $1 OR 
        p.apellido ILIKE $1
    `;
    
    const sanitizeInput = (input) => input.replace(/[%_\\]/g, '\\$&');
    const terminoBusqueda = `%${sanitizeInput(texto)}%`;
    
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [terminoBusqueda, limite, offset]),
      pool.query(queryTotal, [terminoBusqueda])
    ]);

    return {
      espacios: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener espacio deportivo por ID
 */
const obtenerEspacioPorId = async (id) => {
  try {
    const query = `
      SELECT e.*, a.id_admin_esp_dep, p.nombre AS admin_nombre, p.apellido AS admin_apellido, p.correo AS admin_correo
      FROM espacio_deportivo e
      JOIN admin_esp_dep a ON e.id_admin_esp_dep = a.id_admin_esp_dep
      JOIN usuario p ON a.id_admin_esp_dep = p.id_persona
      WHERE e.id_espacio = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Crear nuevo espacio deportivo
 */
const crearEspacio = async (datosEspacio) => {
  try {
    // Validaciones básicas
    if (!datosEspacio.nombre || datosEspacio.nombre.trim() === '') {
      throw new Error('El nombre es obligatorio');
    }
    if (!datosEspacio.id_admin_esp_dep || isNaN(datosEspacio.id_admin_esp_dep)) {
      throw new Error('El ID del administrador es obligatorio y debe ser un número');
    }

    // Validar longitud de campos
    if (datosEspacio.nombre.length > 100) {
      throw new Error('El nombre no debe exceder los 100 caracteres');
    }
    if (datosEspacio.direccion && datosEspacio.direccion.length > 255) {
      throw new Error('La dirección no debe exceder los 255 caracteres');
    }
    if (datosEspacio.imagen_pricipal && datosEspacio.imagen_pricipal.length > 255) {
      throw new Error('La URL de la imagen principal no debe exceder los 255 caracteres');
    }
    if (datosEspacio.imagen_sec_1 && datosEspacio.imagen_sec_1.length > 255) {
      throw new Error('La URL de la imagen secundaria 1 no debe exceder los 255 caracteres');
    }
    if (datosEspacio.imagen_sec_2 && datosEspacio.imagen_sec_2.length > 255) {
      throw new Error('La URL de la imagen secundaria 2 no debe exceder los 255 caracteres');
    }
    if (datosEspacio.imagen_sec_3 && datosEspacio.imagen_sec_3.length > 255) {
      throw new Error('La URL de la imagen secundaria 3 no debe exceder los 255 caracteres');
    }
    if (datosEspacio.imagen_sec_4 && datosEspacio.imagen_sec_4.length > 255) {
      throw new Error('La URL de la imagen secundaria 4 no debe exceder los 255 caracteres');
    }

    // Validar coordenadas
    if (datosEspacio.latitud && (datosEspacio.latitud < -90 || datosEspacio.latitud > 90)) {
      throw new Error('La latitud debe estar entre -90 y 90');
    }
    if (datosEspacio.longitud && (datosEspacio.longitud < -180 || datosEspacio.longitud > 180)) {
      throw new Error('La longitud debe estar entre -180 y 180');
    }

    // Validar horarios
    const validarHora = (hora) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(hora);
    if (datosEspacio.horario_apertura && !validarHora(datosEspacio.horario_apertura)) {
      throw new Error('La hora de apertura no es válida (formato HH:MM:SS)');
    }
    if (datosEspacio.horario_cierre && !validarHora(datosEspacio.horario_cierre)) {
      throw new Error('La hora de cierre no es válida (formato HH:MM:SS)');
    }

    // Verificar si el administrador existe
    const adminQuery = `
      SELECT id_admin_esp_dep FROM admin_esp_dep WHERE id_admin_esp_dep = $1
    `;
    const adminResult = await pool.query(adminQuery, [datosEspacio.id_admin_esp_dep]);
    if (!adminResult.rows[0]) {
      throw new Error('El administrador asociado no existe');
    }

    const query = `
      INSERT INTO espacio_deportivo (
        nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre,
        imagen_pricipal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_admin_esp_dep
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      datosEspacio.nombre,
      datosEspacio.direccion || null,
      datosEspacio.descripcion || null,
      datosEspacio.latitud || null,
      datosEspacio.longitud || null,
      datosEspacio.horario_apertura || null,
      datosEspacio.horario_cierre || null,
      datosEspacio.imagen_pricipal || null,
      datosEspacio.imagen_sec_1 || null,
      datosEspacio.imagen_sec_2 || null,
      datosEspacio.imagen_sec_3 || null,
      datosEspacio.imagen_sec_4 || null,
      datosEspacio.id_admin_esp_dep
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error al crear espacio deportivo:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Actualizar espacio deportivo parcialmente
 */
const actualizarEspacio = async (id, camposActualizar) => {
  try {
    const camposPermitidos = [
      'nombre', 'direccion', 'descripcion', 'latitud', 'longitud', 'horario_apertura', 'horario_cierre',
      'imagen_pricipal', 'imagen_sec_1', 'imagen_sec_2', 'imagen_sec_3', 'imagen_sec_4', 'id_admin_esp_dep'
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
    if (camposActualizar.direccion && camposActualizar.direccion.length > 255) {
      throw new Error('La dirección no debe exceder los 255 caracteres');
    }
    if (camposActualizar.imagen_pricipal && camposActualizar.imagen_pricipal.length > 255) {
      throw new Error('La URL de la imagen principal no debe exceder los 255 caracteres');
    }
    if (camposActualizar.imagen_sec_1 && camposActualizar.imagen_sec_1.length > 255) {
      throw new Error('La URL de la imagen secundaria 1 no debe exceder los 255 caracteres');
    }
    if (camposActualizar.imagen_sec_2 && camposActualizar.imagen_sec_2.length > 255) {
      throw new Error('La URL de la imagen secundaria 2 no debe exceder los 255 caracteres');
    }
    if (camposActualizar.imagen_sec_3 && camposActualizar.imagen_sec_3.length > 255) {
      throw new Error('La URL de la imagen secundaria 3 no debe exceder los 255 caracteres');
    }
    if (camposActualizar.imagen_sec_4 && camposActualizar.imagen_sec_4.length > 255) {
      throw new Error('La URL de la imagen secundaria 4 no debe exceder los 255 caracteres');
    }

    // Validar coordenadas
    if (camposActualizar.latitud && (camposActualizar.latitud < -90 || camposActualizar.latitud > 90)) {
      throw new Error('La latitud debe estar entre -90 y 90');
    }
    if (camposActualizar.longitud && (camposActualizar.longitud < -180 || camposActualizar.longitud > 180)) {
      throw new Error('La longitud debe estar entre -180 y 180');
    }

    // Validar horarios
    const validarHora = (hora) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(hora);
    if (camposActualizar.horario_apertura && !validarHora(camposActualizar.horario_apertura)) {
      throw new Error('La hora de apertura no es válida (formato HH:MM:SS)');
    }
    if (camposActualizar.horario_cierre && !validarHora(camposActualizar.horario_cierre)) {
      throw new Error('La hora de cierre no es válida (formato HH:MM:SS)');
    }

    // Validar administrador si se proporciona
    if (camposActualizar.id_admin_esp_dep) {
      const adminQuery = `
        SELECT id_admin_esp_dep FROM admin_esp_dep WHERE id_admin_esp_dep = $1
      `;
      const adminResult = await pool.query(adminQuery, [camposActualizar.id_admin_esp_dep]);
      if (!adminResult.rows[0]) {
        throw new Error('El administrador asociado no existe');
      }
    }

    const setClause = campos.map((campo, index) => `${campo} = $${index + 2}`).join(', ');
    const values = campos.map(campo => camposActualizar[campo] || null);
    
    const query = `
      UPDATE espacio_deportivo 
      SET ${setClause}
      WHERE id_espacio = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar espacio deportivo
 */
const eliminarEspacio = async (id) => {
  try {
    const query = 'DELETE FROM espacio_deportivo WHERE id_espacio = $1 RETURNING id_espacio';
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

    const { espacios, total } = await obtenerDatosEspecificos(limite, offset);
    
    res.json(respuesta(true, 'Espacios deportivos obtenidos correctamente', {
      espacios,
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
const obtenerEspaciosFiltradosController = async (req, res) => {
  try {
    const { tipo } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const tiposValidos = ['nombre'];
    if (!tipo || !tiposValidos.includes(tipo)) {
      return res.status(400).json(respuesta(false, 'El parámetro "tipo" es inválido o no proporcionado'));
    }

    const { espacios, total } = await obtenerEspaciosFiltrados(tipo, limite, offset);

    res.json(respuesta(true, `Espacios deportivos filtrados por ${tipo} obtenidos correctamente`, {
      espacios,
      filtro: tipo,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en obtenerEspaciosFiltrados:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /buscar
 */
const buscarEspaciosController = async (req, res) => {
  try {
    const { q } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    if (!q) {
      return res.status(400).json(respuesta(false, 'El parámetro de búsqueda "q" es requerido'));
    }

    const { espacios, total } = await buscarEspacios(q, limite, offset);
    
    res.json(respuesta(true, 'Espacios deportivos obtenidos correctamente', {
      espacios,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en buscarEspacios:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /dato-individual/:id
 */
const obtenerEspacioPorIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de espacio deportivo no válido'));
    }

    const espacio = await obtenerEspacioPorId(parseInt(id));

    if (!espacio) {
      return res.status(404).json(respuesta(false, 'Espacio deportivo no encontrado'));
    }

    res.json(respuesta(true, 'Espacio deportivo obtenido correctamente', { espacio }));
  } catch (error) {
    console.error('Error en obtenerEspacioPorId:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para POST - Crear espacio deportivo
 */
const crearEspacioController = async (req, res) => {
  try {
    const datos = req.body;

    // Validaciones básicas
    const camposObligatorios = ['nombre', 'id_admin_esp_dep'];
    const faltantes = camposObligatorios.filter(campo => !datos[campo] || datos[campo].toString().trim() === '');

    if (faltantes.length > 0) {
      return res.status(400).json(
        respuesta(false, `Faltan campos obligatorios: ${faltantes.join(', ')}`)
      );
    }

    const nuevoEspacio = await crearEspacio(datos);

    res.status(201).json(respuesta(true, 'Espacio deportivo creado correctamente', { espacio: nuevoEspacio }));
  } catch (error) {
    console.error('Error en crearEspacio:', error.message);
    
    if (error.code === '23505') { // Violación de unique constraint
      return res.status(400).json(respuesta(false, 'El espacio deportivo ya existe'));
    }
    
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para PATCH - Actualizar espacio deportivo
 */
const actualizarEspacioController = async (req, res) => {
  try {
    const { id } = req.params;
    const camposActualizar = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de espacio deportivo no válido'));
    }

    if (Object.keys(camposActualizar).length === 0) {
      return res.status(400).json(respuesta(false, 'No se proporcionaron campos para actualizar'));
    }

    const espacioActualizado = await actualizarEspacio(parseInt(id), camposActualizar);

    if (!espacioActualizado) {
      return res.status(404).json(respuesta(false, 'Espacio deportivo no encontrado'));
    }

    res.json(respuesta(true, 'Espacio deportivo actualizado correctamente', { espacio: espacioActualizado }));
  } catch (error) {
    console.error('Error en actualizarEspacio:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para DELETE - Eliminar espacio deportivo
 */
const eliminarEspacioController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de espacio deportivo no válido'));
    }

    const espacioEliminado = await eliminarEspacio(parseInt(id));

    if (!espacioEliminado) {
      return res.status(404).json(respuesta(false, 'Espacio deportivo no encontrado'));
    }

    res.json(respuesta(true, 'Espacio deportivo eliminado correctamente'));
  } catch (error) {
    console.error('Error en eliminarEspacio:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

// RUTAS

// GET endpoints
router.get('/datos-especificos', obtenerDatosEspecificosController);
router.get('/filtro', obtenerEspaciosFiltradosController);
router.get('/buscar', buscarEspaciosController);
router.get('/dato-individual/:id', obtenerEspacioPorIdController);

// POST, PATCH, DELETE endpoints
router.post('/', crearEspacioController);
router.patch('/:id', actualizarEspacioController);
router.delete('/:id', eliminarEspacioController);

module.exports = router;