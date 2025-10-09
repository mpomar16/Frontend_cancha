const express = require('express');
const pool = require('../config/database');
const bcrypt = require('bcrypt');

const router = express.Router();

// Función de respuesta estandarizada
const respuesta = (exito, mensaje, datos = null) => ({
  exito,
  mensaje,
  datos,
});


// En tu archivo de modelo (usuario.js)
const obtenerValoresEnum = async (tipoEnum) => {
  try {
    const query = `
      SELECT unnest(enum_range(NULL::${tipoEnum})) as valor;
    `;
    const result = await pool.query(query);
    return result.rows.map(row => row.valor);
  } catch (error) {
    console.error('Error al obtener valores del enum:', error.message);
    throw error;
  }
};

// MODELOS - Funciones puras para operaciones de base de datos

/**
 * Obtener 3 atributos importantes de cada usuario
 */
const obtenerDatosEspecificos = async (limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT id_persona, nombre, apellido, correo, usuario
      FROM usuario 
      ORDER BY id_persona 
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM usuario`;
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);
    return {
      usuarios: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener usuarios con filtros de ordenamiento
 */
const obtenerUsuariosFiltrados = async (tipoFiltro, limite = 10, offset = 0) => {
  try {
    const ordenesPermitidas = {
      nombre: 'nombre ASC, apellido ASC',
      fecha: 'fecha_creacion DESC',
      correo: 'correo ASC',
      default: 'id_persona ASC'
    };

    const orden = ordenesPermitidas[tipoFiltro] || ordenesPermitidas.default;

    const queryDatos = `
      SELECT id_persona, nombre, apellido, correo, usuario
      FROM usuario 
      ORDER BY ${orden}
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM usuario`;

    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);

    return {
      usuarios: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw new Error(`Error al obtener usuarios filtrados: ${error.message}`);
  }
};

/**
 * Buscar usuarios por texto en múltiples campos
 */
const buscarUsuarios = async (texto, limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT id_persona, nombre, apellido, correo, usuario
      FROM usuario 
      WHERE 
        nombre ILIKE $1 OR 
        apellido ILIKE $1 OR 
        correo ILIKE $1 OR 
        usuario ILIKE $1 OR
        telefono ILIKE $1
      ORDER BY nombre, apellido
      LIMIT $2 OFFSET $3
    `;

    const queryTotal = `
      SELECT COUNT(*) 
      FROM usuario 
      WHERE 
        nombre ILIKE $1 OR 
        apellido ILIKE $1 OR 
        correo ILIKE $1 OR 
        usuario ILIKE $1 OR
        telefono ILIKE $1
    `;
    
    const sanitizeInput = (input) => input.replace(/[%_\\]/g, '\\$&');
    const terminoBusqueda = `%${sanitizeInput(texto)}%`;
    
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [terminoBusqueda, limite, offset]),
      pool.query(queryTotal, [terminoBusqueda])
    ]);

    return {
      usuarios: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener usuario por ID
 */
const obtenerUsuarioPorId = async (id) => {
  try {
    const query = `
      SELECT id_persona, nombre, apellido, correo, usuario, telefono, 
             sexo, imagen_perfil, latitud, longitud, fecha_creacion
      FROM usuario 
      WHERE id_persona = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Crear nuevo usuario
 */
const crearUsuario = async (datosUsuario) => {
  try {
    // --- Rango aproximado de La Paz ---
    const LAT_MIN = -16.65;
    const LAT_MAX = -16.45;
    const LON_MIN = -68.25;
    const LON_MAX = -68.05;

    // --- Validación y asignación de coordenadas ---
    let { latitud, longitud } = datosUsuario;

    if (latitud !== undefined && longitud !== undefined) {
      const dentroDeLaPaz =
        latitud >= LAT_MIN && latitud <= LAT_MAX &&
        longitud >= LON_MIN && longitud <= LON_MAX;

      if (!dentroDeLaPaz) {
        throw new Error('Las coordenadas deben estar dentro del área de La Paz, Bolivia');
      }
    } else {
      // Coordenadas aleatorias dentro del rango
      const randomInRange = (min, max) => Math.random() * (max - min) + min;
      latitud = parseFloat(randomInRange(LAT_MIN, LAT_MAX).toFixed(6));
      longitud = parseFloat(randomInRange(LON_MIN, LON_MAX).toFixed(6));
    }

    // --- Validaciones adicionales ---
    const validarCorreo = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    const validarTelefono = (telefono) => /^\+?\d{8,15}$/.test(telefono);

    if (!validarCorreo(datosUsuario.correo)) {
      throw new Error('El correo electrónico no es válido');
    }

    if (datosUsuario.telefono && !validarTelefono(datosUsuario.telefono)) {
      throw new Error('El número de teléfono no es válido');
    }

    // --- Hash de la contraseña ---
    const contrasenaHash = await bcrypt.hash(datosUsuario.contrasena, 10);

    // --- Inserción SQL ---
    const query = `
      INSERT INTO usuario (
        nombre, apellido, contrasena, telefono, correo, 
        sexo, imagen_perfil, usuario, latitud, longitud
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING 
        id_persona, nombre, apellido, telefono, correo, 
        sexo, imagen_perfil, usuario, latitud, longitud, fecha_creacion
    `;

    const values = [
      datosUsuario.nombre,
      datosUsuario.apellido,
      contrasenaHash,
      datosUsuario.telefono || null,  // ✅ Manejar nulos
      datosUsuario.correo,
      datosUsuario.sexo || null,      // ✅ Manejar nulos  
      datosUsuario.imagen_perfil || null, // ✅ Manejar nulos
      datosUsuario.usuario,
      latitud,
      longitud
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];

  } catch (error) {
    console.error('Error al crear usuario:', error.message);
    throw new Error(error.message);
  }
};


/**
 * Actualizar usuario parcialmente
 */
const actualizarUsuario = async (id, camposActualizar) => {
  try {
    const camposPermitidos = [
      'nombre', 'apellido', 'telefono', 'sexo', 'correo',
      'imagen_perfil', 'latitud', 'longitud'
    ];

    const campos = Object.keys(camposActualizar).filter(key => 
      camposPermitidos.includes(key)
    );

    if (campos.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    const setClause = campos.map((campo, index) => `${campo} = $${index + 2}`).join(', ');
    const values = campos.map(campo => camposActualizar[campo]);
    
    const query = `
      UPDATE usuario 
      SET ${setClause}
      WHERE id_persona = $1
      RETURNING id_persona, nombre, apellido, correo, usuario, telefono, sexo, fecha_creacion, imagen_perfil, latitud, longitud    
      `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar usuario
 */
const eliminarUsuario = async (id) => {
  try {
    const query = 'DELETE FROM usuario WHERE id_persona = $1 RETURNING id_persona';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

// CONTROLADORES - Manejan las request y response

/**
 * Controlador para GET /datos-específicos
 */

const obtenerDatosEspecificosController = async (req, res) => {
  try {
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const { usuarios, total } = await obtenerDatosEspecificos(limite, offset);
    
    res.json(respuesta(true, 'Datos específicos obtenidos correctamente', {
      usuarios,
      paginacion: {limite, offset, total}
    }));
  } catch (error) {
    console.error('Error en obtenerDatosEspecificos:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /filtro-x
 */
const obtenerUsuariosFiltradosController = async (req, res) => {
  try {
    const { tipo } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const tiposValidos = ['nombre', 'fecha', 'correo'];
    if (!tipo || !tiposValidos.includes(tipo)) {
      return res.status(400).json(respuesta(false, 'El parámetro "tipo" es inválido o no proporcionado'));
    }

    const { usuarios, total } = await obtenerUsuariosFiltrados(tipo, limite, offset);

    res.json(respuesta(true, `Usuarios filtrados por ${tipo} obtenidos correctamente`, {
      usuarios,
      filtro: tipo,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en obtenerUsuariosFiltrados:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /search
 */

/**
 * Controlador para GET /search
 */
const buscarUsuariosController = async (req, res) => {
  try {
    const { q } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    if (!q) {
      return res.status(400).json(respuesta(false, 'El parámetro de búsqueda "q" es requerido'));
    }

    const { usuarios, total } = await buscarUsuarios(q, limite, offset);
    
    res.json(respuesta(true, 'Datos específicos obtenidos correctamente', {
      usuarios,
      paginacion: {limite, offset, total}
    }));
  } catch (error) {
    console.error('Error en buscarUsuarios:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /obtener-usuario-id/:id
 */
const obtenerUsuarioPorIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de usuario no válido'));
    }

    const usuario = await obtenerUsuarioPorId(parseInt(id));

    if (!usuario) {
      return res.status(404).json(respuesta(false, 'Usuario no encontrado'));
    }

    res.json(respuesta(true, 'Usuario obtenido correctamente', { usuario }));
  } catch (error) {
    console.error('Error en obtenerUsuarioPorId:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para POST - Crear usuario
 */
const crearUsuarioController = async (req, res) => {
  try {
    const datos = req.body;

    // Validaciones básicas
    const camposObligatorios = ['nombre', 'apellido', 'contrasena', 'correo', 'usuario'];
    const faltantes = camposObligatorios.filter(campo => !datos[campo] || datos[campo].toString().trim() === '');

    if (faltantes.length > 0) {
      return res.status(400).json(
        respuesta(false, `Faltan campos obligatorios: ${faltantes.join(', ')}`)
      );
    }

    // ✅ VALIDACIÓN DINÁMICA: Obtener valores del ENUM desde la BD
    if (datos.sexo) {
      const sexosPermitidos = await obtenerValoresEnum('sexo_enum');
      
      if (!sexosPermitidos.includes(datos.sexo)) {
        return res.status(400).json(
          respuesta(false, `El valor para sexo no es válido. Valores permitidos: ${sexosPermitidos.join(', ')}`)
        );
      }
    }

    const nuevoUsuario = await crearUsuario(datos);

    res.status(201).json(respuesta(true, 'Usuario creado correctamente', { usuario: nuevoUsuario }));
  } catch (error) {
    console.error('Error en crearUsuario:', error.message);
    
    if (error.code === '23505') { // Violación de unique constraint
      return res.status(400).json(respuesta(false, 'El correo o usuario ya existe'));
    }
    
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para PATCH - Actualizar usuario
 */
const actualizarUsuarioController = async (req, res) => {
  try {
    const { id } = req.params;
    const camposActualizar = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de usuario no válido'));
    }

    if (Object.keys(camposActualizar).length === 0) {
      return res.status(400).json(respuesta(false, 'No se proporcionaron campos para actualizar'));
    }

    const usuarioActualizado = await actualizarUsuario(parseInt(id), camposActualizar);

    if (!usuarioActualizado) {
      return res.status(404).json(respuesta(false, 'Usuario no encontrado'));
    }

    res.json(respuesta(true, 'Usuario actualizado correctamente', { usuario: usuarioActualizado }));
  } catch (error) {
    console.error('Error en actualizarUsuario:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para DELETE - Eliminar usuario
 */
const eliminarUsuarioController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de usuario no válido'));
    }

    const usuarioEliminado = await eliminarUsuario(parseInt(id));

    if (!usuarioEliminado) {
      return res.status(404).json(respuesta(false, 'Usuario no encontrado'));
    }

    res.json(respuesta(true, 'Usuario eliminado correctamente'));
  } catch (error) {
    console.error('Error en eliminarUsuario:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

// RUTAS

// GET endpoints
router.get('/datos-especificos', obtenerDatosEspecificosController);
router.get('/filtro', obtenerUsuariosFiltradosController);
router.get('/buscar', buscarUsuariosController);
router.get('/dato-individual/:id', obtenerUsuarioPorIdController);

// POST, PATCH, DELETE endpoints
router.post('/', crearUsuarioController);
router.patch('/:id', actualizarUsuarioController);
router.delete('/:id', eliminarUsuarioController);

module.exports = router;