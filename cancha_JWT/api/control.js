const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');
const path = require('path');
const fs = require('fs').promises;

// --- Modelos ---

/**
 * Obtiene todos los controles de la base de datos.
 * @returns {Promise<Array>} Lista de controles.
 * @throws {Error} Si ocurre un error al consultar la base de datos.
 */
async function getAllControles() {
  try {
    const query = `
      SELECT 
        c.id_control, 
        c.fecha_asignacion, 
        c.estado, 
        p.nombre,
        p.apellido,
        p.telefono,
        p.correo,
        p.sexo,
        p.imagen_perfil
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

/**
 * Obtiene un control por su ID.
 * @param {number} id - ID del control.
 * @returns {Promise<Object>} Datos del control.
 * @throws {Error} Si ocurre un error al consultar la base de datos.
 */
async function getControlById(id) {
  try {
    const query = `
      SELECT 
        c.id_control, 
        c.fecha_asignacion, 
        c.estado, 
        p.nombre,
        p.apellido,
        p.telefono,
        p.correo,
        p.sexo,
        p.imagen_perfil
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

/**
 * Obtiene un control por el ID de la persona asociada.
 * @param {number} id_persona - ID de la persona.
 * @returns {Promise<Object>} Datos del control.
 * @throws {Error} Si ocurre un error al consultar la base de datos.
 */
async function getControlByPersonaId(id_persona) {
  try {
    const query = `
      SELECT 
        c.id_control, 
        c.fecha_asignacion, 
        c.estado, 
        p.nombre,
        p.apellido,
        p.telefono,
        p.correo,
        p.sexo,
        p.imagen_perfil
      FROM CONTROL c
      JOIN PERSONA p ON c.id_control = p.id_persona
      WHERE c.id_control = $1
    `;
    const result = await pool.query(query, [id_persona]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener control por id_persona: ' + error.message);
  }
}

/**
 * Obtiene la persona asociada a un control por su ID.
 * @param {number} id - ID del control.
 * @returns {Promise<Object>} Datos de la persona.
 * @throws {Error} Si ocurre un error al consultar la base de datos.
 */
async function getPersonaByControlId(id) {
  try {
    const query = `
      SELECT 
        p.id_persona,
        p.nombre,
        p.apellido,
        p.telefono,
        p.correo,
        p.sexo,
        p.imagen_perfil
      FROM PERSONA p
      JOIN CONTROL c ON p.id_persona = c.id_control
      WHERE c.id_control = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener persona asociada al control: ' + error.message);
  }
}

/**
 * Obtiene los QR asociados a un control por su ID.
 * @param {number} id - ID del control.
 * @returns {Promise<Array>} Lista de QRs.
 * @throws {Error} Si ocurre un error al consultar la base de datos.
 */
async function getQRsByControlId(id) {
  try {
    const query = `
      SELECT 
        q.id_qr, 
        q.fecha_generado, 
        q.fecha_expira, 
        q.qr_url_imagen, 
        q.codigo_qr, 
        q.estado, 
        q.id_reserva,
        q.id_control
      FROM QR_RESERVA q
      WHERE q.id_control = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al obtener QRs asociados al control: ' + error.message);
  }
}

/**
 * Obtiene los controles por su estado.
 * @param {string} estado - Estado del control (activo, inactivo).
 * @returns {Promise<Array>} Lista de controles.
 * @throws {Error} Si ocurre un error al consultar la base de datos.
 */
async function getControlesByEstado(estado) {
  try {
    const query = `
      SELECT 
        c.id_control, 
        c.fecha_asignacion, 
        c.estado, 
        p.nombre,
        p.apellido,
        p.telefono,
        p.correo,
        p.sexo,
        p.imagen_perfil
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

/**
 * Verifica si una persona existe en la base de datos.
 * @param {number} id_persona - ID de la persona.
 * @returns {Promise<boolean>} True si la persona existe, false en caso contrario.
 * @throws {Error} Si ocurre un error al consultar la base de datos.
 */
async function checkPersonaExists(id_persona) {
  try {
    const query = 'SELECT id_persona FROM PERSONA WHERE id_persona = $1';
    const result = await pool.query(query, [id_persona]);
    return result.rows.length > 0;
  } catch (error) {
    throw new Error('Error al verificar persona: ' + error.message);
  }
}

/**
 * Verifica si ya existe un control para una persona.
 * @param {number} id_persona - ID de la persona.
 * @returns {Promise<boolean>} True si ya existe un control, false en caso contrario.
 * @throws {Error} Si ocurre un error al consultar la base de datos.
 */
async function checkControlExists(id_persona) {
  try {
    const query = 'SELECT id_control FROM CONTROL WHERE id_control = $1';
    const result = await pool.query(query, [id_persona]);
    return result.rows.length > 0;
  } catch (error) {
    throw new Error('Error al verificar control existente: ' + error.message);
  }
}

/**
 * Verifica si un control existe por su ID.
 * @param {number} id - ID del control.
 * @returns {Promise<boolean>} True si el control existe, false en caso contrario.
 * @throws {Error} Si ocurre un error al consultar la base de datos.
 */
async function checkControlById(id) {
  try {
    const query = 'SELECT id_control FROM CONTROL WHERE id_control = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  } catch (error) {
    throw new Error('Error al verificar control por ID: ' + error.message);
  }
}

/**
 * Crea un nuevo control en la base de datos.
 * @param {number} id_control - ID del control (referencia a PERSONA.id_persona).
 * @param {string} fecha_asignacion - Fecha de asignación (YYYY-MM-DD).
 * @param {string} estado - Estado del control (activo, inactivo).
 * @returns {Promise<Object>} Datos del control creado.
 * @throws {Error} Si ocurre un error al crear el control.
 */
async function createControl(id_control, fecha_asignacion, estado) {
  try {
    const query = `
      INSERT INTO CONTROL (id_control, fecha_asignacion, estado)
      VALUES ($1, $2, $3)
      RETURNING id_control, fecha_asignacion, estado
    `;
    const values = [id_control, fecha_asignacion, estado];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear control: ' + error.message);
  }
}

/**
 * Actualiza un control existente en la base de datos.
 * @param {number} id - ID del control.
 * @param {string} [fecha_asignacion] - Nueva fecha de asignación (opcional).
 * @param {string} [estado] - Nuevo estado (opcional).
 * @returns {Promise<Object>} Datos del control actualizado.
 * @throws {Error} Si ocurre un error al actualizar el control.
 */
async function updateControl(id, fecha_asignacion, estado) {
  try {
    let query = 'UPDATE CONTROL SET ';
    const values = [];
    let paramIndex = 1;

    if (fecha_asignacion !== undefined) {
      query += `fecha_asignacion = $${paramIndex}, `;
      values.push(fecha_asignacion);
      paramIndex++;
    }
    if (estado !== undefined) {
      query += `estado = $${paramIndex}, `;
      values.push(estado);
      paramIndex++;
    }

    query = query.slice(0, -2); // Eliminar la última coma y espacio
    query += ` WHERE id_control = $${paramIndex} RETURNING id_control, fecha_asignacion, estado`;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar control: ' + error.message);
  }
}

/**
 * Elimina un control de la base de datos.
 * @param {number} id - ID del control.
 * @returns {Promise<Object>} Datos del control eliminado.
 * @throws {Error} Si ocurre un error al eliminar el control.
 */
async function deleteControl(id) {
  try {
    const query = `
      DELETE FROM CONTROL 
      WHERE id_control = $1 
      RETURNING id_control, fecha_asignacion, estado
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar control: ' + error.message);
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

/**
 * Respuesta estandarizada para las respuestas de la API.
 * @param {boolean} success - Indica si la operación fue exitosa.
 * @param {string} message - Mensaje descriptivo.
 * @param {any} [data] - Datos retornados (opcional).
 * @param {string} [errorCode] - Código de error (opcional).
 * @returns {Object} Objeto de respuesta.
 */
const response = (success, message, data = null, errorCode = null) => ({
  success,
  message,
  data,
  errorCode,
});

/**
 * Valida los datos de entrada para crear o actualizar un control.
 * @param {Object} data - Datos a validar.
 * @param {number} data.id_control - ID del control (referencia a PERSONA.id_persona).
 * @param {string} data.fecha_asignacion - Fecha de asignación.
 * @param {string} data.estado - Estado del control.
 * @throws {Error} Si los datos no son válidos.
 */
function validateControlData({ id_control, fecha_asignacion, estado }) {
  if (!id_control || !fecha_asignacion || !estado) {
    throw new Error('Todos los campos son obligatorios');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_asignacion)) {
    throw new Error('Formato de fecha inválido. Debe ser YYYY-MM-DD');
  }
  const validEstados = ['activo', 'inactivo']; // Asegúrate de que coincida con estado_control_enum
  if (!validEstados.includes(estado)) {
    throw new Error('Estado inválido. Debe ser: activo o inactivo');
  }
}

/**
 * Lista todos los controles.
 */
const listarControles = async (req, res) => {
  try {
    const controles = await getAllControles();
    const controlesConImagenValidada = await Promise.all(
      controles.map(async (control) => {
        if (control.imagen_perfil) {
          try {
            const filePath = path.join(__dirname, '../Uploads', control.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
            await fs.access(filePath);
            control.imagen_perfil = `http://localhost:3000${control.imagen_perfil}`;
          } catch (error) {
            console.warn(`Imagen no encontrada para id_control ${control.id_control}: ${control.imagen_perfil}`);
            control.imagen_perfil = null;
          }
        }
        return control;
      })
    );
    res.status(200).json(response(true, 'Lista de controles obtenida', controlesConImagenValidada));
  } catch (error) {
    console.error('Error al listar controles:', error);
    res.status(500).json(response(false, 'Error interno del servidor', null, error.code));
  }
};

/**
 * Obtiene un control por su ID.
 */
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
        control.imagen_perfil = `http://localhost:3000${control.imagen_perfil}`;
      } catch (error) {
        console.warn(`Imagen no encontrada para id_control ${control.id_control}: ${control.imagen_perfil}`);
        control.imagen_perfil = null;
      }
    }
    res.status(200).json(response(true, 'Control obtenido', control));
  } catch (error) {
    console.error('Error al obtener control por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor', null, error.code));
  }
};

/**
 * Obtiene un control por el ID de la persona asociada.
 */
const obtenerControlPorPersonaId = async (req, res) => {
  const { id_persona } = req.params;

  try {
    const control = await getControlByPersonaId(id_persona);
    if (!control) {
      return res.status(404).json(response(false, 'Control no encontrado'));
    }
    if (control.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', control.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
        control.imagen_perfil = `http://localhost:3000${control.imagen_perfil}`;
      } catch (error) {
        console.warn(`Imagen no encontrada para id_control ${control.id_control}: ${control.imagen_perfil}`);
        control.imagen_perfil = null;
      }
    }
    res.status(200).json(response(true, 'Control obtenido', control));
  } catch (error) {
    console.error('Error al obtener control por id_persona:', error);
    res.status(500).json(response(false, 'Error interno del servidor', null, error.code));
  }
};

/**
 * Obtiene la persona asociada a un control.
 */
const obtenerPersonaPorControlId = async (req, res) => {
  const { id } = req.params;

  try {
    const persona = await getPersonaByControlId(id);
    if (!persona) {
      return res.status(404).json(response(false, 'Persona no encontrada'));
    }
    if (persona.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', persona.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
        persona.imagen_perfil = `http://localhost:3000${persona.imagen_perfil}`;
      } catch (error) {
        console.warn(`Imagen no encontrada para id_persona ${persona.id_persona}: ${persona.imagen_perfil}`);
        persona.imagen_perfil = null;
      }
    }
    res.status(200).json(response(true, 'Persona obtenida', persona));
  } catch (error) {
    console.error('Error al obtener persona por control:', error);
    res.status(500).json(response(false, 'Error interno del servidor', null, error.code));
  }
};

/**
 * Obtiene los QRs asociados a un control.
 */
const obtenerQRsPorControlId = async (req, res) => {
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
            qr.qr_url_imagen = `http://localhost:3000${qr.qr_url_imagen}`;
          } catch (error) {
            console.warn(`Imagen QR no encontrada para id_qr ${qr.id_qr}: ${qr.qr_url_imagen}`);
            qr.qr_url_imagen = null;
          }
        }
        return qr;
      })
    );
    res.status(200).json(response(true, 'QRs obtenidos', qrsConImagenValidada));
  } catch (error) {
    console.error('Error al obtener QRs por control:', error);
    res.status(500).json(response(false, 'Error interno del servidor', null, error.code));
  }
};

/**
 * Obtiene los controles por su estado.
 */
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
            control.imagen_perfil = `http://localhost:3000${control.imagen_perfil}`;
          } catch (error) {
            console.warn(`Imagen no encontrada para id_control ${control.id_control}: ${control.imagen_perfil}`);
            control.imagen_perfil = null;
          }
        }
        return control;
      })
    );
    res.status(200).json(response(true, 'Controles obtenidos por estado', controlesConImagenValidada));
  } catch (error) {
    console.error('Error al listar controles por estado:', error);
    res.status(500).json(response(false, 'Error interno del servidor', null, error.code));
  }
};

/**
 * Crea un nuevo control.
 */
const crearControl = async (req, res) => {
  const { id_control, fecha_asignacion, estado } = req.body;

  try {
    // Validar datos de entrada
    validateControlData({ id_control, fecha_asignacion, estado });

    // Verificar si la persona existe
    const personaExists = await checkPersonaExists(id_control);
    if (!personaExists) {
      return res.status(400).json(response(false, 'Persona no encontrada'));
    }

    // Verificar si ya existe un control para esta persona
    const controlExists = await checkControlExists(id_control);
    if (controlExists) {
      return res.status(400).json(response(false, 'Ya existe un control para esta persona'));
    }

    const nuevoControl = await createControl(id_control, fecha_asignacion, estado);
    res.status(201).json(response(true, 'Control creado exitosamente', nuevoControl));
  } catch (error) {
    console.error('Error al crear control:', error);
    res.status(400).json(response(false, error.message, null, error.code));
  }
};

/**
 * Actualiza un control existente.
 */
const actualizarControl = async (req, res) => {
  const { id } = req.params;
  const { fecha_asignacion, estado } = req.body;

  try {
    // Verificar si el control existe
    const controlExists = await checkControlById(id);
    if (!controlExists) {
      return res.status(404).json(response(false, 'Control no encontrado'));
    }

    // Validar datos si se proporcionan
    if (fecha_asignacion && !/^\d{4}-\d{2}-\d{2}$/.test(fecha_asignacion)) {
      return res.status(400).json(response(false, 'Formato de fecha inválido. Debe ser YYYY-MM-DD'));
    }

    if (estado) {
      const validEstados = ['activo', 'inactivo'];
      if (!validEstados.includes(estado)) {
        return res.status(400).json(response(false, 'Estado inválido. Debe ser: activo o inactivo'));
      }
    }

    const controlActualizado = await updateControl(id, fecha_asignacion, estado);
    if (!controlActualizado) {
      return res.status(404).json(response(false, 'No se pudo actualizar el control'));
    }

    res.status(200).json(response(true, 'Control actualizado exitosamente', controlActualizado));
  } catch (error) {
    console.error('Error al actualizar control:', error);
    res.status(500).json(response(false, 'Error interno del servidor', null, error.code));
  }
};

/**
 * Elimina un control.
 */
const eliminarControl = async (req, res) => {
  const { id } = req.params;

  try {
    const controlEliminado = await deleteControl(id);
    if (!controlEliminado) {
      return res.status(404).json(response(false, 'Control no encontrado'));
    }
    res.status(200).json(response(true, 'Control eliminado exitosamente'));
  } catch (error) {
    console.error('Error al eliminar control:', error);
    res.status(500).json(response(false, 'Error interno del servidor', null, error.code));
  }
};

// --- Rutas ---
const router = express.Router();

router.post('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), crearControl);

router.get('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'ENCARGADO']), listarControles);
router.get('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'ENCARGADO']), obtenerControlPorId);
router.get('/persona/:id_persona', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'ENCARGADO']), obtenerControlPorPersonaId);
router.get('/:id/persona', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'ENCARGADO']), obtenerPersonaPorControlId);
router.get('/estado/:estado', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'ENCARGADO']), listarControlesPorEstado);
router.get('/:id/qrs', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'ENCARGADO']), obtenerQRsPorControlId);

router.patch('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), actualizarControl);
router.delete('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), eliminarControl);

module.exports = router;