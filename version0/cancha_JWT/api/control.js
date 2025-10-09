const express = require('express');
const pool = require('../config/database');
const bcrypt = require('bcrypt');
const { verifyToken, checkRole } = require('../middleware/auth');
const { handleUpload } = require('../middleware/multer');
const path = require('path');
const fs = require('fs').promises;

// --- Modelos ---
async function getAllControles() {
  try {
    const query = `
      SELECT c.id_control, c.fecha_asignacion, c.estado,
             p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil, p.usuario
      FROM CONTROL c
      JOIN PERSONA p ON c.id_control = p.id_persona
      ORDER BY c.id_control
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar controles: ' + error.message);
  }
}

async function getControlById(id) {
  try {
    const query = `
      SELECT c.id_control, c.fecha_asignacion, c.estado,
             p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil, p.usuario
      FROM CONTROL c
      JOIN PERSONA p ON c.id_control = p.id_persona
      WHERE c.id_control = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener control por ID: ' + error.message);
  }
}

async function getControlByCorreo(correo) {
  try {
    const query = `
      SELECT c.id_control, c.fecha_asignacion, c.estado,
             p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil, p.usuario
      FROM CONTROL c
      JOIN PERSONA p ON c.id_control = p.id_persona
      WHERE p.correo = $1
    `;
    const result = await pool.query(query, [correo]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener control por correo: ' + error.message);
  }
}

async function getControlesByNombre(nombre) {
  try {
    const query = `
      SELECT c.id_control, c.fecha_asignacion, c.estado,
             p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil, p.usuario
      FROM CONTROL c
      JOIN PERSONA p ON c.id_control = p.id_persona
      WHERE p.nombre ILIKE $1
      ORDER BY p.nombre ASC
      LIMIT 10
    `;
    const values = [`%${nombre}%`];
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    throw new Error('Error al buscar controles por nombre: ' + error.message);
  }
}

async function getControlesByEstado(estado) {
  try {
    const query = `
      SELECT c.id_control, c.fecha_asignacion, c.estado,
             p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil, p.usuario
      FROM CONTROL c
      JOIN PERSONA p ON c.id_control = p.id_persona
      WHERE c.estado = $1
      ORDER BY c.fecha_asignacion DESC
    `;
    const result = await pool.query(query, [estado]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar controles por estado: ' + error.message);
  }
}

async function createControl(nombre, apellido, contraseña, telefono, correo, sexo, usuario, fecha_asignacion, estado, imagen_perfil = null) {
  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Generar latitud y longitud aleatorias dentro de La Paz (consistent with administrador.js and cliente.js)
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

    // Insertar en CONTROL
    const controlQuery = `
      INSERT INTO CONTROL (id_control, fecha_asignacion, estado)
      VALUES ($1, $2, $3)
      RETURNING id_control, fecha_asignacion, estado
    `;
    const controlValues = [id, fecha_asignacion || new Date().toISOString().split('T')[0], estado];
    const controlResult = await pool.query(controlQuery, controlValues);

    // Combinar resultados
    return {
      ...controlResult.rows[0],
      nombre, apellido, telefono, correo, sexo, imagen_perfil, usuario
    };
  } catch (error) {
    throw new Error('Error al crear control: ' + error.message);
  }
}

async function updateControl(id, nombre, apellido, contraseña, telefono, correo, sexo, usuario, fecha_asignacion, estado, imagen_perfil) {
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

    // Actualizar CONTROL
    let controlQuery = `
      UPDATE CONTROL
      SET fecha_asignacion = COALESCE($1, fecha_asignacion),
          estado = COALESCE($2, estado)
    `;
    const controlValues = [fecha_asignacion, estado];
    paramIndex = 3;

    controlQuery += ` WHERE id_control = $${paramIndex}`;
    controlValues.push(id);

    await pool.query(controlQuery, controlValues);

    // Obtener el registro actualizado
    return await getControlById(id);
  } catch (error) {
    throw new Error('Error al actualizar control: ' + error.message);
  }
}

async function deleteControl(id) {
  try {
    // Obtener control para eliminar imagen después
    const control = await getControlById(id);
    if (!control) {
      throw new Error('Control no encontrado');
    }

    // Eliminar de PERSONA (cascada eliminará CONTROL)
    const personaQuery = 'DELETE FROM PERSONA WHERE id_persona = $1 RETURNING *';
    const personaResult = await pool.query(personaQuery, [id]);

    return { ...control, deleted_from_persona: !!personaResult.rows[0] };
  } catch (error) {
    throw new Error('Error al eliminar control: ' + error.message);
  }
}

async function getQRsByControlId(id) {
  try {
    const query = `
      SELECT 
        id_qr, 
        fecha_generado, 
        fecha_expira, 
        qr_url_imagen, 
        codigo_qr, 
        estado, 
        id_reserva,
        id_control
      FROM QR_RESERVA 
      WHERE id_control = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al obtener QRs asociados al control: ' + error.message);
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
  data
});

const listarControles = async (req, res) => {
  try {
    const controles = await getAllControles();
    const controlesConImagenValidada = await Promise.all(
      controles.map(async (control) => {
        if (control.imagen_perfil) {
          try {
            const filePath = path.join(__dirname, '../Uploads', control.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
            await fs.access(filePath);
          } catch (error) {
            console.warn(`Imagen no encontrada para control ${control.id_control}: ${control.imagen_perfil}`);
            control.imagen_perfil = null;
          }
        }
        return control;
      })
    );
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Lista de controles obtenida', controlesConImagenValidada));
  } catch (error) {
    console.error('Error al listar controles:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerControlPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const control = await getControlById(id);
    if (!control) {
      return res.status(404).json(response(false, 'Control no encontrado'));
    }
    if (control.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', control.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
      } catch (error) {
        console.warn(`Imagen no encontrada para control ${control.id_control}: ${control.imagen_perfil}`);
        control.imagen_perfil = null;
      }
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Control obtenido', control));
  } catch (error) {
    console.error('Error al obtener control por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerControlPorCorreo = async (req, res) => {
  const { correo } = req.params;

  try {
    const control = await getControlByCorreo(correo);
    if (!control) {
      return res.status(404).json(response(false, 'Control no encontrado'));
    }
    if (control.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', control.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
      } catch (error) {
        console.warn(`Imagen no encontrada para control ${control.id_control}: ${control.imagen_perfil}`);
        control.imagen_perfil = null;
      }
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Control obtenido', control));
  } catch (error) {
    console.error('Error al obtener control por correo:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const buscarControlPorNombre = async (req, res) => {
  const { nombre } = req.params;

  try {
    const controles = await getControlesByNombre(nombre);
    if (!controles.length) {
      return res.status(404).json(response(false, 'No se encontraron controles'));
    }
    const controlesConImagenValidada = await Promise.all(
      controles.map(async (control) => {
        if (control.imagen_perfil) {
          try {
            const filePath = path.join(__dirname, '../Uploads', control.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
            await fs.access(filePath);
          } catch (error) {
            console.warn(`Imagen no encontrada para control ${control.id_control}: ${control.imagen_perfil}`);
            control.imagen_perfil = null;
          }
        }
        return control;
      })
    );
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Controles encontrados', controlesConImagenValidada));
  } catch (error) {
    console.error('Error al buscar controles por nombre:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarControlesPorEstado = async (req, res) => {
  const { estado } = req.params;

  try {
    const controles = await getControlesByEstado(estado);
    if (!controles.length) {
      return res.status(404).json(response(false, 'No se encontraron controles para este estado'));
    }
    const controlesConImagenValidada = await Promise.all(
      controles.map(async (control) => {
        if (control.imagen_perfil) {
          try {
            const filePath = path.join(__dirname, '../Uploads', control.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
            await fs.access(filePath);
          } catch (error) {
            console.warn(`Imagen no encontrada para control ${control.id_control}: ${control.imagen_perfil}`);
            control.imagen_perfil = null;
          }
        }
        return control;
      })
    );
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Controles obtenidos por estado', controlesConImagenValidada));
  } catch (error) {
    console.error('Error al listar controles por estado:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearControl = async (req, res) => {
  const { nombre, apellido, contraseña, telefono, correo, sexo, usuario, fecha_asignacion, estado } = req.body;

  if (!nombre || !apellido || !contraseña || !correo || !usuario) {
    return res.status(400).json(response(false, 'Campos obligatorios: nombre, apellido, contraseña, correo, usuario'));
  }

  let imagen_perfil = null;
  if (req.file) {
    imagen_perfil = `/Uploads/control/${req.file.filename}`;
  }

  try {
    const nuevoControl = await createControl(
      nombre,
      apellido,
      contraseña,
      telefono,
      correo,
      sexo,
      usuario,
      fecha_asignacion,
      estado ?? true,
      imagen_perfil
    );
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(201).json(response(true, 'Control creado exitosamente', nuevoControl));
  } catch (error) {
    console.error('Error al crear control:', error);
    if (error.message.includes('correo') || error.message.includes('usuario')) {
      return res.status(400).json(response(false, 'Correo o usuario ya registrado'));
    }
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarControl = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, contraseña, telefono, correo, sexo, usuario, fecha_asignacion, estado } = req.body;

  try {
    const controlExistente = await getControlById(id);
    if (!controlExistente) {
      return res.status(404).json(response(false, 'Control no encontrado'));
    }

    let imagen_perfil = controlExistente.imagen_perfil;
    let oldFilePath = null;

    if (req.file) {
      imagen_perfil = `/Uploads/control/${req.file.filename}`;
      if (controlExistente.imagen_perfil) {
        oldFilePath = path.join(__dirname, '../Uploads', controlExistente.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
      }
    }

    const controlActualizado = await updateControl(
      id,
      nombre,
      apellido,
      contraseña,
      telefono,
      correo,
      sexo,
      usuario,
      fecha_asignacion,
      estado,
      imagen_perfil
    );

    if (oldFilePath) {
      await fs.unlink(oldFilePath).catch(err => console.warn('No se pudo eliminar imagen antigua:', err));
    }

    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Control actualizado exitosamente', controlActualizado));
  } catch (error) {
    console.error('Error al actualizar control:', error);
    if (error.message.includes('correo') || error.message.includes('usuario')) {
      return res.status(400).json(response(false, 'Correo o usuario ya registrado'));
    }
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarControl = async (req, res) => {
  const { id } = req.params;

  try {
    const controlEliminado = await deleteControl(id);
    if (controlEliminado.imagen_perfil) {
      const filePath = path.join(__dirname, '../Uploads', controlEliminado.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
      await fs.unlink(filePath).catch(err => console.warn('No se pudo eliminar imagen:', err));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Control eliminado exitosamente'));
  } catch (error) {
    console.error('Error al eliminar control:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerQRsPorControl = async (req, res) => {
  const { id } = req.params;

  try {
    const qrs = await getQRsByControlId(id);
    if (!qrs.length) {
      return res.status(404).json(response(false, 'No se encontraron QRs para este control'));
    }
    const qrsConImagenValidada = await Promise.all(
      qrs.map(async (qr) => {
        if (qr.qr_url_imagen) {
          try {
            const filePath = path.join(__dirname, '../Uploads/qr', qr.qr_url_imagen.replace(/^\/*[uU]ploads\/qr\//, ''));
            await fs.access(filePath);
          } catch (error) {
            console.warn(`Imagen QR no encontrada para id_qr ${qr.id_qr}: ${qr.qr_url_imagen}`);
            qr.qr_url_imagen = null;
          }
        }
        return qr;
      })
    );
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'QRs obtenidos', qrsConImagenValidada));
  } catch (error) {
    console.error('Error al obtener QRs por control:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

// --- Rutas ---
const router = express.Router();

router.post('/', verifyToken, checkRole(['ADMINISTRADOR']), handleUpload('control', 'imagen_perfil'), crearControl);
router.get('/datos-total', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), listarControles);
router.get('/id/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), obtenerControlPorId);
router.get('/correo/:correo', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), obtenerControlPorCorreo);
router.get('/buscar-nombre/:nombre', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), buscarControlPorNombre);
router.get('/estado/:estado', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), listarControlesPorEstado);
router.get('/:id/qrs', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), obtenerQRsPorControl);
router.patch('/:id', verifyToken, checkRole(['ADMINISTRADOR']), handleUpload('control', 'imagen_perfil'), actualizarControl);
router.delete('/:id', verifyToken, checkRole(['ADMINISTRADOR']), eliminarControl);

module.exports = router;