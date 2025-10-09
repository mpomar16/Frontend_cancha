const express = require('express');
const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken, checkRole } = require('../middleware/auth');
const { createUpload, processImage } = require('../middleware/multer'); // Updated import
const { validateUsuarioFields } = require('../middleware/validate');
const path = require('path');
const fs = require('fs').promises;

// Clave secreta para JWT (en producción, usar variable de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// --- Modelos ---

async function getUsuarioById(id) {
  try {
    const query = `
    SELECT id_persona, nombre, usuario, apellido, telefono, correo, sexo, imagen_perfil 
    FROM USUARIO WHERE id_persona = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener usuario por ID: ' + error.message);
  }
}

async function createUsuarioCasual(nombre, usuario, contrasena, correo) {
  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Generar latitud y longitud aleatorias dentro de La Paz
    const latMin = -16.55, latMax = -16.49;
    const lonMin = -68.20, lonMax = -68.12;

    const latitud = Math.floor((Math.random() * (latMax - latMin) + latMin) * 1e6) / 1e6;
    const longitud = Math.floor((Math.random() * (lonMax - lonMin) + lonMin) * 1e6) / 1e6;

    const query = `
      INSERT INTO USUARIO (nombre, usuario, contrasena, correo, latitud, longitud)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id_persona, nombre, usuario, apellido, telefono, correo, sexo, imagen_perfil, latitud, longitud
    `;
    
    const values = [nombre || null, usuario || null, hashedPassword, correo, latitud, longitud];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear usuario casual: ' + error.message);
  }
}

async function updateUsuario(id, nombre, usuario, apellido, contrasena, telefono, correo, sexo, imagen_perfil) {
  try {
    let query = `
      UPDATE USUARIO
      SET nombre = $1, usuario = $2, apellido = $3, telefono = $4, correo = $5, sexo = $6, imagen_perfil = $7`;
    const values = [nombre, usuario, apellido, telefono, correo, sexo, imagen_perfil];
    let paramIndex = 8;

    if (contrasena && contrasena.trim() !== "") {
      const hashedPassword = await bcrypt.hash(contrasena, 10);
      query += `, contrasena = $${paramIndex}`;
      values.push(hashedPassword);
      paramIndex++;
    }

    query += ` WHERE id_persona = $${paramIndex} RETURNING id_persona, nombre, usuario, apellido, telefono, correo, sexo, imagen_perfil`;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar usuario: ' + error.message);
  }
}

async function deleteUsuario(id) {
  try {
    const query = 'DELETE FROM USUARIO WHERE id_persona = $1 RETURNING id_persona, nombre, usuario, apellido, telefono, correo, sexo, imagen_perfil';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar usuario: ' + error.message);
  }
}

async function loginUsuario(correo, contrasena) { 
  const query = 'SELECT * FROM USUARIO WHERE correo = $1'; 
  const result = await pool.query(query, [correo]); 
  const usuario = result.rows[0]; 
    
  if (!usuario) throw new Error('Correo no encontrado'); 

  const isMatch = await bcrypt.compare(contrasena, usuario.contrasena); 
  if (!isMatch) throw new Error('contrasena incorrecta'); 

  // Determinar el rol según las tablas relacionadas
  let role = 'X'; // por defecto

  const resAdmin = await pool.query('SELECT 1 FROM ADMINISTRADOR WHERE id_administrador=$1', [usuario.id_persona]);
  if (resAdmin.rowCount > 0) role = 'ADMINISTRADOR';
  const resAdminEsp = await pool.query('SELECT 1 FROM ADMIN_ESP_DEP WHERE id_admin_esp_dep=$1', [usuario.id_persona]);
  if (resAdminEsp.rowCount > 0) role = 'ADMIN_ESP_DEP';
  const resDeportista = await pool.query('SELECT 1 FROM DEPORTISTA WHERE id_deportista=$1', [usuario.id_persona]);
  if (resDeportista.rowCount > 0) role = 'DEPORTISTA';
  const resControl = await pool.query('SELECT 1 FROM CONTROL WHERE id_control=$1', [usuario.id_persona]);
  if (resControl.rowCount > 0) role = 'CONTROL';
  const resEncargado = await pool.query('SELECT 1 FROM ENCARGADO WHERE id_encargado=$1', [usuario.id_persona]);
  if (resEncargado.rowCount > 0) role = 'ENCARGADO';

  console.log(role);

  return { 
    id_persona: usuario.id_persona,
    nombre: usuario.nombre,
    usuario: usuario.usuario,
    apellido: usuario.apellido,
    correo: usuario.correo,
    sexo: usuario.sexo,
    imagen_perfil: usuario.imagen_perfil,
    role
  };
}

// --- Controladores ---

const response = (success, message, data = null) => ({
  success,
  message,
  data,
});

const obtenerUsuarioPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await getUsuarioById(id);
    if (!usuario) {
      return res.status(404).json(response(false, 'Usuario no encontrado'));
    }
    if (usuario.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', usuario.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
      } catch (error) {
        console.warn(`Imagen no encontrada para usuario ${usuario.id_persona}: ${usuario.imagen_perfil}`);
        usuario.imagen_perfil = null;
      }
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Usuario obtenido', usuario));
    console.log("Usuario obtenido segun id ", id)
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearUsuarioCasual = async (req, res) => {
  const { nombre, usuario, contrasena, correo } = req.body;

  if (!contrasena || !correo || !usuario) {
    return res.status(400).json(response(false, 'Usuario, contrasena y correo son obligatorios'));
  }

  try {
    const nuevoUsuario = await createUsuarioCasual(nombre, usuario, contrasena, correo);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(201).json(response(true, 'Usuario creado exitosamente', nuevoUsuario));
    console.log("Usuario creado exitosamente", new Date())
  } catch (error) {
    console.error('Error al crear usuario casual:', error.message);
    if (error.message.includes('correo')) {
      return res.status(400).json(response(false, 'El correo ya está registrado'));
    }
    if (error.message.includes('usuario')) {
      return res.status(400).json(response(false, 'El usuario ya está registrado'));
    }
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const idUsuarioToken = req.user.id_persona;

  const { nombre, usuario, apellido, contrasena, telefono, correo, sexo } = req.body;

  if (correo !== undefined && !correo.trim()) {
    return res.status(400).json(response(false, 'Correo no puede estar vacío'));
  }
  if (sexo !== undefined && !['masculino', 'femenino'].includes(sexo)) {
    return res.status(400).json(response(false, 'Sexo debe ser "masculino" o "femenino"'));
  }

  try {
    const usuarioExistente = await pool.query(
      'SELECT * FROM USUARIO WHERE id_persona = $1',
      [id]
    );
    if (!usuarioExistente.rows[0]) {
      return res.status(404).json(response(false, 'Usuario no encontrado'));
    }

    let imagen_perfil = usuarioExistente.rows[0].imagen_perfil;
    let oldFilePath = null;

    if (req.file) {
      imagen_perfil = `/Uploads/usuario/${req.file.filename}`;
      if (usuarioExistente.rows[0].imagen_perfil) {
        oldFilePath = path.join(
          __dirname,
          '../Uploads',
          usuarioExistente.rows[0].imagen_perfil.replace(/^\/*[uU]ploads\//, '')
        );
      }
    }

    const usuarioActualizado = await updateUsuario(
      id,
      nombre !== undefined ? nombre : usuarioExistente.rows[0].nombre,
      usuario !== undefined ? usuario : usuarioExistente.rows[0].usuario,
      apellido !== undefined ? apellido : usuarioExistente.rows[0].apellido,
      contrasena,
      telefono !== undefined ? telefono : usuarioExistente.rows[0].telefono,
      correo !== undefined ? correo : usuarioExistente.rows[0].correo,
      sexo !== undefined ? sexo : usuarioExistente.rows[0].sexo,
      imagen_perfil
    );

    if (oldFilePath) {
      try {
        await fs.unlink(oldFilePath);
      } catch (error) {
        console.warn(`No se pudo eliminar la imagen antigua: ${oldFilePath}`);
      }
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Usuario actualizado exitosamente', usuarioActualizado));
    console.log(`Usuario ${id} actualizado exitosamente`);
  } catch (error) {
    console.error('Error al actualizar usuario:', error.message);

    if (error.message.includes('correo')) {
      return res.status(400).json(response(false, 'El correo ya está registrado'));
    }
    if (error.message.includes('usuario')) {
      return res.status(400).json(response(false, 'El usuario ya está registrado'));
    }

    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const usuarioEliminado = await deleteUsuario(id);
    if (!usuarioEliminado) {
      return res.status(404).json(response(false, 'Usuario no encontrado'));
    }
    if (usuarioEliminado.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', usuarioEliminado.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.unlink(filePath);
      } catch (error) {
        console.warn(`No se pudo eliminar la imagen: ${usuarioEliminado.imagen_perfil}`);
      }
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Usuario eliminado exitosamente'));
    console.log("Usuario eliminado exitosamente ", usuarioEliminado.nombre)
  } catch (error) {
    console.error('Error al eliminar usuario:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json(response(false, 'Correo y contrasena son obligatorios'));
  }

  try {
    const usuario = await loginUsuario(correo, contrasena);
    console.log("=======")
    console.log(usuario)
    const token = jwt.sign(
      { id_persona: usuario.id_persona, role: usuario.role }, 
      JWT_SECRET, 
      { expiresIn: '5h' }
    );
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Login exitoso', { token, usuario }));
  } catch (error) {
    console.error('Error en login:', error.message);
    
    if (error.message.includes('Correo no encontrado') || error.message.includes('contrasena incorrecta')) {
      return res.status(401).json(response(false, 'Credenciales inválidas'));
    }
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

// --- Controlador: obtener mi perfil ---
const obtenerMiPerfil = async (req, res) => {
  const id = req.user.id_persona // viene del token

  try {
    const usuario = await getUsuarioById(id)
    if (!usuario) {
      return res.status(404).json(response(false, 'Usuario no encontrado'))
    }

    if (usuario.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', usuario.imagen_perfil.replace(/^\/*[uU]ploads\//, ''))
        await fs.access(filePath)
      } catch (error) {
        console.warn(`Imagen no encontrada para usuario ${usuario.id_persona}: ${usuario.imagen_perfil}`)
        usuario.imagen_perfil = null
      }
    }

    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl)
    res.status(200).json(response(true, 'Perfil obtenido', usuario))
  } catch (error) {
    console.error('Error al obtener mi perfil:', error.message)
    res.status(500).json(response(false, 'Error interno del servidor'))
  }
}

// --- Controlador: actualizar mi perfil ---
const actualizarMiPerfil = async (req, res) => {
  const id = req.user.id_persona // viene del token
  const { nombre, usuario, apellido, contrasena, telefono, correo, sexo } = req.body

  if (correo !== undefined && !correo.trim()) {
    return res.status(400).json(response(false, 'Correo no puede estar vacío'))
  }
  if (sexo !== undefined && !['masculino', 'femenino'].includes(sexo)) {
    return res.status(400).json(response(false, 'Sexo debe ser "masculino" o "femenino"'))
  }

  try {
    const usuarioExistente = await pool.query(
      'SELECT * FROM USUARIO WHERE id_persona = $1',
      [id]
    )
    if (!usuarioExistente.rows[0]) {
      return res.status(404).json(response(false, 'Usuario no encontrado'))
    }

    let imagen_perfil = usuarioExistente.rows[0].imagen_perfil
    let oldFilePath = null

    if (req.file) {
      imagen_perfil = `/Uploads/usuario/${req.file.filename}`
      if (usuarioExistente.rows[0].imagen_perfil) {
        oldFilePath = path.join(
          __dirname,
          '../Uploads',
          usuarioExistente.rows[0].imagen_perfil.replace(/^\/*[uU]ploads\//, '')
        )
      }
    }

    const usuarioActualizado = await updateUsuario(
      id,
      nombre !== undefined ? nombre : usuarioExistente.rows[0].nombre,
      usuario !== undefined ? usuario : usuarioExistente.rows[0].usuario,
      apellido !== undefined ? apellido : usuarioExistente.rows[0].apellido,
      contrasena,
      telefono !== undefined ? telefono : usuarioExistente.rows[0].telefono,
      correo !== undefined ? correo : usuarioExistente.rows[0].correo,
      sexo !== undefined ? sexo : usuarioExistente.rows[0].sexo,
      imagen_perfil
    )

    if (oldFilePath) {
      try {
        await fs.unlink(oldFilePath)
      } catch (error) {
        console.warn(`No se pudo eliminar la imagen antigua: ${oldFilePath}`)
      }
    }

    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl)
    res.status(200).json(response(true, 'Perfil actualizado exitosamente', usuarioActualizado))
  } catch (error) {
    console.error('Error al actualizar mi perfil:', error.message)

    if (error.message.includes('correo')) {
      return res.status(400).json(response(false, 'El correo ya está registrado'))
    }
    if (error.message.includes('usuario')) {
      return res.status(400).json(response(false, 'El usuario ya está registrado'))
    }

    res.status(500).json(response(false, 'Error interno del servidor'))
  }
}

// --- Rutas ---
const router = express.Router();

router.post('/sign-in', login);
router.post('/sign-up', validateUsuarioFields, crearUsuarioCasual);

router.get('/mi-perfil', verifyToken, checkRole(['ADMINISTRADOR']), obtenerMiPerfil)
//router.patch('/mi-perfil', verifyToken, checkRole(['ADMINISTRADOR']), handleUpload('usuario', 'imagen_perfil'), actualizarMiPerfil)

router.get('/id/:id', verifyToken, checkRole(['ADMINISTRADOR']), obtenerUsuarioPorId);

// router.patch('/:id', verifyToken, checkRole(['ADMINISTRADOR']), handleUpload('usuario', 'imagen_perfil'), actualizarUsuario);
router.delete('/:id', verifyToken, checkRole(['ADMINISTRADOR']), eliminarUsuario);

module.exports = router;