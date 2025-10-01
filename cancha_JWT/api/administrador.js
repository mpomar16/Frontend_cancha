const express = require('express');
const pool = require('../config/database');
const bcrypt = require('bcrypt');
const { verifyToken, checkRole } = require('../middleware/auth');
const { handleUpload } = require('../middleware/multer');
const path = require('path');
const fs = require('fs').promises;

// --- Modelos ---
async function getAllAdministradores() {
  try {
    const query = `
      SELECT a.id_administrador, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil, p.usuario,
             a.direccion, a.estado, a.ultimo_login, a.fecha_creacion
      FROM ADMINISTRADOR a
      JOIN PERSONA p ON a.id_administrador = p.id_persona
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar administradores: ' + error.message);
  }
}

async function getAdministradorById(id) {
  try {
    const query = `
      SELECT a.id_administrador, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil, p.usuario,
             a.direccion, a.estado, a.ultimo_login, a.fecha_creacion
      FROM ADMINISTRADOR a
      JOIN PERSONA p ON a.id_administrador = p.id_persona
      WHERE a.id_administrador = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener administrador por ID: ' + error.message);
  }
}

async function getAdministradorByCorreo(correo) {
  try {
    const query = `
      SELECT a.id_administrador, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil, p.usuario,
             a.direccion, a.estado, a.ultimo_login, a.fecha_creacion
      FROM ADMINISTRADOR a
      JOIN PERSONA p ON a.id_administrador = p.id_persona
      WHERE p.correo = $1
    `;
    const result = await pool.query(query, [correo]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener administrador por correo: ' + error.message);
  }
}

async function getAdministradoresByNombre(nombre) {
  try {
    const query = `
      SELECT a.id_administrador, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil, p.usuario,
             a.direccion, a.estado, a.ultimo_login, a.fecha_creacion
      FROM ADMINISTRADOR a
      JOIN PERSONA p ON a.id_administrador = p.id_persona
      WHERE p.nombre ILIKE $1
      ORDER BY p.nombre ASC
      LIMIT 10
    `;
    const values = [`%${nombre}%`];
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    throw new Error('Error al buscar administradores por nombre: ' + error.message);
  }
}

async function createAdministrador(nombre, apellido, contraseña, telefono, correo, sexo, usuario, direccion, imagen_perfil = null) {
  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Generar latitud y longitud aleatorias dentro de La Paz
    const latMin = -16.55, latMax = -16.49;
    const lonMin = -68.20, lonMax = -68.12;
    const latitud = Math.floor((Math.random() * (latMax - latMin) + latMin) * 1e6) / 1e6;
    const longitud = Math.floor((Math.random() * (lonMax - lonMin) + lonMin) * 1e6) / 1e6;

    // Insertar en PERSONA
    const personaQuery = `
      INSERT INTO PERSONA (nombre, apellido, contraseña, telefono, correo, sexo, imagen_perfil, usuario, latitud, longitud)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id_persona
    `;
    const personaValues = [nombre, apellido, hashedPassword, telefono, correo, sexo, imagen_perfil, usuario, latitud, longitud];
    const personaResult = await pool.query(personaQuery, personaValues);
    const id = personaResult.rows[0].id_persona;

    // Insertar en ADMINISTRADOR
    const adminQuery = `
      INSERT INTO ADMINISTRADOR (id_administrador, direccion)
      VALUES ($1, $2)
      RETURNING id_administrador, direccion, estado, ultimo_login, fecha_creacion
    `;
    const adminResult = await pool.query(adminQuery, [id, direccion]);

    // Combinar resultados
    return {
      ...adminResult.rows[0],
      nombre, apellido, telefono, correo, sexo, imagen_perfil, usuario
    };
  } catch (error) {
    throw new Error('Error al crear administrador: ' + error.message);
  }
}

async function updateAdministrador(id, nombre, apellido, contraseña, telefono, correo, sexo, usuario, direccion, estado, imagen_perfil) {
  try {
    // Actualizar PERSONA
    let personaQuery = `
      UPDATE PERSONA
      SET nombre = COALESCE($1, nombre),
          apellido = COALESCE($2, apellido),
          telefono = COALESCE($3, telefono),
          correo = COALESCE($4, correo),
          sexo = COALESCE($5, sexo),
          usuario = COALESCE($6, usuario),
          imagen_perfil = COALESCE($7, imagen_perfil)
    `;
    const personaValues = [nombre, apellido, telefono, correo, sexo, usuario, imagen_perfil];
    let paramIndex = 8;

    if (contraseña && contraseña.trim() !== "") {
      const hashedPassword = await bcrypt.hash(contraseña, 10);
      personaQuery += `, contraseña = $${paramIndex}`;
      personaValues.push(hashedPassword);
      paramIndex++;
    }

    personaQuery += ` WHERE id_persona = $${paramIndex}`;
    personaValues.push(id);

    await pool.query(personaQuery, personaValues);

    // Actualizar ADMINISTRADOR
    const adminQuery = `
      UPDATE ADMINISTRADOR
      SET direccion = COALESCE($1, direccion),
          estado = COALESCE($2, estado)
      WHERE id_administrador = $3
    `;
    await pool.query(adminQuery, [direccion, estado, id]);

    // Obtener el registro actualizado
    return await getAdministradorById(id);
  } catch (error) {
    throw new Error('Error al actualizar administrador: ' + error.message);
  }
}

async function deleteAdministrador(id) {
  try {
    // Obtener imagen para eliminarla después
    const admin = await getAdministradorById(id);
    if (!admin) {
      throw new Error('Administrador no encontrado');
    }

    // Eliminar de ADMINISTRADOR (no cascada a PERSONA)
    await pool.query('DELETE FROM ADMINISTRADOR WHERE id_administrador = $1', [id]);

    // Eliminar de PERSONA (cascada eliminará referencias si hay)
    const personaQuery = 'DELETE FROM PERSONA WHERE id_persona = $1 RETURNING *';
    const personaResult = await pool.query(personaQuery, [id]);

    return { ...admin, deleted_from_persona: !!personaResult.rows[0] };
  } catch (error) {
    throw new Error('Error al eliminar administrador: ' + error.message);
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

const listarAdministradores = async (req, res) => {
  try {
    const administradores = await getAllAdministradores();
    const administradoresConImagenValidada = await Promise.all(
      administradores.map(async (admin) => {
        if (admin.imagen_perfil) {
          try {
            const filePath = path.join(__dirname, '../Uploads', admin.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
            await fs.access(filePath);
          } catch (error) {
            console.warn(`Imagen no encontrada para administrador ${admin.id_administrador}: ${admin.imagen_perfil}`);
            admin.imagen_perfil = null;
          }
        }
        return admin;
      })
    );
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Lista de administradores obtenida', administradoresConImagenValidada));
  } catch (error) {
    console.error('Error al listar administradores:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerAdministradorPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await getAdministradorById(id);
    if (!admin) {
      return res.status(404).json(response(false, 'Administrador no encontrado'));
    }
    if (admin.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', admin.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
      } catch (error) {
        console.warn(`Imagen no encontrada para administrador ${admin.id_administrador}: ${admin.imagen_perfil}`);
        admin.imagen_perfil = null;
      }
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Administrador obtenido', admin));
  } catch (error) {
    console.error('Error al obtener administrador por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerAdministradorPorCorreo = async (req, res) => {
  const { correo } = req.params;

  try {
    const admin = await getAdministradorByCorreo(correo);
    if (!admin) {
      return res.status(404).json(response(false, 'Administrador no encontrado'));
    }
    if (admin.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', admin.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
      } catch (error) {
        console.warn(`Imagen no encontrada para administrador ${admin.id_administrador}: ${admin.imagen_perfil}`);
        admin.imagen_perfil = null;
      }
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Administrador obtenido', admin));
  } catch (error) {
    console.error('Error al obtener administrador por correo:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const buscarAdministradorPorNombre = async (req, res) => {
  const { nombre } = req.params;

  try {
    const administradores = await getAdministradoresByNombre(nombre);
    if (!administradores.length) {
      return res.status(404).json(response(false, 'No se encontraron administradores'));
    }
    const administradoresConImagenValidada = await Promise.all(
      administradores.map(async (admin) => {
        if (admin.imagen_perfil) {
          try {
            const filePath = path.join(__dirname, '../Uploads', admin.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
            await fs.access(filePath);
          } catch (error) {
            console.warn(`Imagen no encontrada para administrador ${admin.id_administrador}: ${admin.imagen_perfil}`);
            admin.imagen_perfil = null;
          }
        }
        return admin;
      })
    );
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Administradores encontrados', administradoresConImagenValidada));
  } catch (error) {
    console.error('Error al buscar administradores por nombre:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearAdministrador = async (req, res) => {
  const { nombre, apellido, contraseña, telefono, correo, sexo, usuario, direccion } = req.body;

  if (!nombre || !apellido || !contraseña || !correo || !usuario || !direccion) {
    return res.status(400).json(response(false, 'Campos obligatorios: nombre, apellido, contraseña, correo, usuario, direccion'));
  }

  let imagen_perfil = null;
  if (req.file) {
    imagen_perfil = `/Uploads/persona/${req.file.filename}`;
  }

  try {
    const nuevoAdmin = await createAdministrador(nombre, apellido, contraseña, telefono, correo, sexo, usuario, direccion, imagen_perfil);

    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(201).json(response(true, 'Administrador creado exitosamente', nuevoAdmin));
  } catch (error) {
    console.error('Error al crear administrador:', error);
    if (error.message.includes('correo') || error.message.includes('usuario')) {
      return res.status(400).json(response(false, 'Correo o usuario ya registrado'));
    }
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarAdministrador = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, contraseña, telefono, correo, sexo, usuario, direccion, estado } = req.body;

  try {
    const adminExistente = await getAdministradorById(id);
    if (!adminExistente) {
      return res.status(404).json(response(false, 'Administrador no encontrado'));
    }

    let imagen_perfil = adminExistente.imagen_perfil;
    let oldFilePath = null;

    if (req.file) {
      imagen_perfil = `/Uploads/persona/${req.file.filename}`;
      if (adminExistente.imagen_perfil) {
        oldFilePath = path.join(__dirname, '../Uploads', adminExistente.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
      }
    }

    const adminActualizado = await updateAdministrador(
      id,
      nombre,
      apellido,
      contraseña,
      telefono,
      correo,
      sexo,
      usuario,
      direccion,
      estado,
      imagen_perfil
    );

    if (oldFilePath) {
      await fs.unlink(oldFilePath).catch(err => console.warn('No se pudo eliminar imagen antigua:', err));
    }

    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Administrador actualizado exitosamente', adminActualizado));
  } catch (error) {
    console.error('Error al actualizar administrador:', error);
    if (error.message.includes('correo') || error.message.includes('usuario')) {
      return res.status(400).json(response(false, 'Correo o usuario ya registrado'));
    }
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarAdministrador = async (req, res) => {
  const { id } = req.params;

  try {
    const adminEliminado = await deleteAdministrador(id);
    if (adminEliminado.imagen_perfil) {
      const filePath = path.join(__dirname, '../Uploads', adminEliminado.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
      await fs.unlink(filePath).catch(err => console.warn('No se pudo eliminar imagen:', err));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Administrador eliminado exitosamente'));
  } catch (error) {
    console.error('Error al eliminar administrador:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

//-------- Rutas --------- 
//------------------------
//------------------------

const router = express.Router();

router.post('/', verifyToken, checkRole(['ADMINISTRADOR']), handleUpload('persona', 'imagen_perfil'), crearAdministrador);

router.get('/datos-total', verifyToken, checkRole(['ADMINISTRADOR']), listarAdministradores);
router.get('/id/:id', verifyToken, checkRole(['ADMINISTRADOR']), obtenerAdministradorPorId);
router.get('/correo/:correo', verifyToken, checkRole(['ADMINISTRADOR']), obtenerAdministradorPorCorreo);
router.get('/buscar-nombre/:nombre', verifyToken, checkRole(['ADMINISTRADOR']), buscarAdministradorPorNombre);

router.patch('/:id', verifyToken, checkRole(['ADMINISTRADOR']), handleUpload('persona', 'imagen_perfil'), actualizarAdministrador);
router.delete('/:id', verifyToken, checkRole(['ADMINISTRADOR']), eliminarAdministrador);

module.exports = router;