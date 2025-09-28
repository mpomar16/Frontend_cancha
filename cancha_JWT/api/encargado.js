const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');
const path = require('path');
const fs = require('fs').promises;

// --- Modelos ---
async function getAllEncargados() {
  try {
    const query = `
      SELECT e.id_encargado, e.responsabilidad, e.fecha_inicio, e.hora_ingreso, e.hora_salida, e.estado, p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
      FROM ENCARGADO e
      JOIN PERSONA p ON e.id_encargado = p.id_persona
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar encargados: ' + error.message);
  }
}

async function getEncargadoById(id) {
  try {
    const query = `
      SELECT e.id_encargado, e.responsabilidad, e.fecha_inicio, e.hora_ingreso, e.hora_salida, e.estado, p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
      FROM ENCARGADO e
      JOIN PERSONA p ON e.id_encargado = p.id_persona
      WHERE e.id_encargado = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener encargado por ID: ' + error.message);
  }
}

async function getEncargadoByIdPersona(id_persona) {
  try {
    const query = `
      SELECT e.id_encargado, e.responsabilidad, e.fecha_inicio, e.hora_ingreso, e.hora_salida, e.estado, p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
      FROM ENCARGADO e
      JOIN PERSONA p ON e.id_encargado = p.id_persona
      WHERE p.id_persona = $1
    `;
    const result = await pool.query(query, [id_persona]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener encargado por id_persona: ' + error.message);
  }
}

async function getPersonaByEncargadoId(id) {
  try {
    const query = `
      SELECT p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
      FROM PERSONA p
      JOIN ENCARGADO e ON p.id_persona = e.id_encargado
      WHERE e.id_encargado = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener persona asociada al encargado: ' + error.message);
  }
}

async function getReportesByEncargadoId(id) {
  try {
    const query = `
      SELECT r.id_reporte, r.detalle, r.sugerencia, r.id_encargado, r.id_reserva
      FROM REPORTE_INCIDENCIA r
      WHERE r.id_encargado = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar reportes del encargado: ' + error.message);
  }
}

async function getEncargadosByEstado(estado) {
  try {
    const query = `
      SELECT e.id_encargado, e.responsabilidad, e.fecha_inicio, e.hora_ingreso, e.hora_salida, e.estado, p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
      FROM ENCARGADO e
      JOIN PERSONA p ON e.id_encargado = p.id_persona
      WHERE e.estado = $1
    `;
    const result = await pool.query(query, [estado]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar encargados por estado: ' + error.message);
  }
}

async function createEncargado(responsabilidad, fecha_inicio, hora_ingreso, hora_salida, estado, id_persona) {
  try {
    const query = `
      INSERT INTO ENCARGADO (id_encargado, responsabilidad, fecha_inicio, hora_ingreso, hora_salida, estado)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id_encargado, responsabilidad, fecha_inicio, hora_ingreso, hora_salida, estado
    `;
    const values = [id_persona, responsabilidad, fecha_inicio, hora_ingreso, hora_salida, estado];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear encargado: ' + error.message);
  }
}

async function updateEncargado(id, responsabilidad, fecha_inicio, hora_ingreso, hora_salida, estado) {
  try {
    const query = `
      UPDATE ENCARGADO
      SET responsabilidad = COALESCE($1, responsabilidad),
          fecha_inicio = COALESCE($2, fecha_inicio),
          hora_ingreso = COALESCE($3, hora_ingreso),
          hora_salida = COALESCE($4, hora_salida),
          estado = COALESCE($5, estado)
      WHERE id_encargado = $6
      RETURNING id_encargado, responsabilidad, fecha_inicio, hora_ingreso, hora_salida, estado
    `;
    const values = [responsabilidad, fecha_inicio, hora_ingreso, hora_salida, estado, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar encargado: ' + error.message);
  }
}

async function deleteEncargado(id) {
  try {
    const query = `
      DELETE FROM ENCARGADO
      WHERE id_encargado = $1
      RETURNING id_encargado, responsabilidad, fecha_inicio, hora_ingreso, hora_salida, estado
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar encargado: ' + error.message);
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

const listarEncargados = async (req, res) => {
  try {
    const encargados = await getAllEncargados();
    const encargadosConImagenValidada = await Promise.all(
      encargados.map(async (encargado) => {
        if (encargado.imagen_perfil) {
          try {
            const filePath = path.join(__dirname, '../Uploads', encargado.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
            await fs.access(filePath);
            return encargado;
          } catch (error) {
            console.warn(`Imagen no encontrada para encargado ${encargado.id_encargado}: ${encargado.imagen_perfil}`);
            return { ...encargado, imagen_perfil: null };
          }
        }
        return encargado;
      })
    );
    res.status(200).json(response(true, 'Lista de encargados obtenida', encargadosConImagenValidada));
  } catch (error) {
    console.error('Error al listar encargados:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerEncargadoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const encargado = await getEncargadoById(id);
    if (!encargado) {
      return res.status(404).json(response(false, 'Encargado no encontrado'));
    }
    if (encargado.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', encargado.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
      } catch (error) {
        console.warn(`Imagen no encontrada para encargado ${encargado.id_encargado}: ${encargado.imagen_perfil}`);
        encargado.imagen_perfil = null;
      }
    }
    res.status(200).json(response(true, 'Encargado obtenido', encargado));
  } catch (error) {
    console.error('Error al obtener encargado por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerEncargadoPorIdPersona = async (req, res) => {
  const { id_persona } = req.params;

  try {
    const encargado = await getEncargadoByIdPersona(id_persona);
    if (!encargado) {
      return res.status(404).json(response(false, 'Encargado no encontrado'));
    }
    if (encargado.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', encargado.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
      } catch (error) {
        console.warn(`Imagen no encontrada para encargado ${encargado.id_encargado}: ${encargado.imagen_perfil}`);
        encargado.imagen_perfil = null;
      }
    }
    res.status(200).json(response(true, 'Encargado obtenido', encargado));
  } catch (error) {
    console.error('Error al obtener encargado por id_persona:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerPersonaPorEncargadoId = async (req, res) => {
  const { id } = req.params;

  try {
    const persona = await getPersonaByEncargadoId(id);
    if (!persona) {
      return res.status(404).json(response(false, 'Persona no encontrada'));
    }
    if (persona.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', persona.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
      } catch (error) {
        console.warn(`Imagen no encontrada para persona ${persona.id_persona}: ${persona.imagen_perfil}`);
        persona.imagen_perfil = null;
      }
    }
    res.status(200).json(response(true, 'Persona obtenida', persona));
  } catch (error) {
    console.error('Error al obtener persona asociada al encargado:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerReportesPorEncargadoId = async (req, res) => {
  const { id } = req.params;

  try {
    const reportes = await getReportesByEncargadoId(id);
    if (!reportes.length) {
      return res.status(404).json(response(false, 'No se encontraron reportes para este encargado'));
    }
    res.status(200).json(response(true, 'Reportes obtenidos', reportes));
  } catch (error) {
    console.error('Error al listar reportes del encargado:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarEncargadosPorEstado = async (req, res) => {
  const { estado } = req.params;

  try {
    const encargados = await getEncargadosByEstado(estado);
    if (!encargados.length) {
      return res.status(404).json(response(false, 'No se encontraron encargados para este estado'));
    }
    const encargadosConImagenValidada = await Promise.all(
      encargados.map(async (encargado) => {
        if (encargado.imagen_perfil) {
          try {
            const filePath = path.join(__dirname, '../Uploads', encargado.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
            await fs.access(filePath);
            return encargado;
          } catch (error) {
            console.warn(`Imagen no encontrada para encargado ${encargado.id_encargado}: ${encargado.imagen_perfil}`);
            return { ...encargado, imagen_perfil: null };
          }
        }
        return encargado;
      })
    );
    res.status(200).json(response(true, 'Encargados obtenidos por estado', encargadosConImagenValidada));
  } catch (error) {
    console.error('Error al listar encargados por estado:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearEncargado = async (req, res) => {
  const { responsabilidad, fecha_inicio, hora_ingreso, hora_salida, estado, id_persona } = req.body;

  if (!responsabilidad || !fecha_inicio || !hora_ingreso || !hora_salida || !estado || !id_persona) {
    return res.status(400).json(response(false, 'Todos los campos son obligatorios'));
  }

  try {
    // Verificar que id_persona existe en PERSONA
    const personaExistente = await pool.query('SELECT id_persona FROM PERSONA WHERE id_persona = $1', [id_persona]);
    if (!personaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Persona no encontrada'));
    }

    // Validar estado contra el tipo enumerado
    const validEstados = ['activo', 'inactivo'];
    if (!validEstados.includes(estado)) {
      return res.status(400).json(response(false, 'Estado inválido. Debe ser: activo o inactivo'));
    }

    const nuevoEncargado = await createEncargado(responsabilidad, fecha_inicio, hora_ingreso, hora_salida, estado, id_persona);
    res.status(201).json(response(true, 'Encargado creado exitosamente', nuevoEncargado));
  } catch (error) {
    console.error('Error al crear encargado:', error);
    if (error.message.includes('duplicate key')) {
      return res.status(400).json(response(false, 'El id_persona ya está registrado como encargado'));
    }
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarEncargado = async (req, res) => {
  const { id } = req.params;
  const { responsabilidad, fecha_inicio, hora_ingreso, hora_salida, estado } = req.body;

  try {
    // Validar estado si se proporciona
    if (estado) {
      const validEstados = ['activo', 'inactivo'];
      if (!validEstados.includes(estado)) {
        return res.status(400).json(response(false, 'Estado inválido. Debe ser: activo o inactivo'));
      }
    }

    const encargadoActualizado = await updateEncargado(id, responsabilidad, fecha_inicio, hora_ingreso, hora_salida, estado);
    if (!encargadoActualizado) {
      return res.status(404).json(response(false, 'Encargado no encontrado'));
    }
    res.status(200).json(response(true, 'Encargado actualizado exitosamente', encargadoActualizado));
  } catch (error) {
    console.error('Error al actualizar encargado:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarEncargado = async (req, res) => {
  const { id } = req.params;

  try {
    const encargadoEliminado = await deleteEncargado(id);
    if (!encargadoEliminado) {
      return res.status(404).json(response(false, 'Encargado no encontrado'));
    }
    res.status(200).json(response(true, 'Encargado eliminado exitosamente'));
  } catch (error) {
    console.error('Error al eliminar encargado:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

// --- Rutas ---
const router = express.Router();

router.post('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), crearEncargado);

router.get('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'ENCARGADO']), listarEncargados);
router.get('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'ENCARGADO']), obtenerEncargadoPorId);
router.get('/persona/:id_persona', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'ENCARGADO']), obtenerEncargadoPorIdPersona);
router.get('/:id/persona', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'ENCARGADO']), obtenerPersonaPorEncargadoId);
router.get('/estado/:estado', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'ENCARGADO']), listarEncargadosPorEstado);
router.get('/:id/reportes', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'ENCARGADO']), obtenerReportesPorEncargadoId);

router.patch('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), actualizarEncargado);
router.delete('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), eliminarEncargado);

module.exports = router;