const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');
const path = require('path');
const fs = require('fs').promises;

// --- Modelos ---
async function getAllEncargados(limit = 12, offset = 0) {
  try {
    const query = `
      SELECT 
        e.id_encargado, e.responsabilidad, e.fecha_inicio, e.hora_ingreso, e.hora_salida, e.estado,
        p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
      FROM ENCARGADO e
      JOIN PERSONA p ON e.id_encargado = p.id_persona
      ORDER BY e.id_encargado
      LIMIT $1 + 1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    const rows = result.rows || [];
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    return { items, hasMore };
  } catch (error) {
    throw new Error('Error al listar encargados (paginado): ' + error.message);
  }
}

async function getEncargadoById(id) {
  try {
    const query = `
      SELECT e.id_encargado, e.responsabilidad, e.fecha_inicio, e.hora_ingreso, e.hora_salida, e.estado, 
             p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
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
      SELECT e.id_encargado, e.responsabilidad, e.fecha_inicio, e.hora_ingreso, e.hora_salida, e.estado, 
             p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
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
      SELECT e.id_encargado, e.responsabilidad, e.fecha_inicio, e.hora_ingreso, e.hora_salida, e.estado, 
             p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
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

async function getEncargadosByNombre(nombre) {
  try {
    const query = `
      SELECT e.id_encargado, e.responsabilidad, e.fecha_inicio, e.hora_ingreso, e.hora_salida, e.estado,
             p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
      FROM ENCARGADO e
      JOIN PERSONA p ON e.id_encargado = p.id_persona
      WHERE p.nombre ILIKE $1 OR p.apellido ILIKE $1
      ORDER BY p.nombre ASC
      LIMIT 15
    `;
    const result = await pool.query(query, [`%${nombre}%`]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al buscar encargados por nombre: ' + error.message);
  }
}

async function getEncargadosByResponsabilidad(responsabilidad) {
  try {
    const query = `
      SELECT e.id_encargado, e.responsabilidad, e.fecha_inicio, e.hora_ingreso, e.hora_salida, e.estado,
             p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
      FROM ENCARGADO e
      JOIN PERSONA p ON e.id_encargado = p.id_persona
      WHERE e.responsabilidad ILIKE $1
      ORDER BY e.responsabilidad ASC
      LIMIT 15
    `;
    const result = await pool.query(query, [`%${responsabilidad}%`]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al buscar encargados por responsabilidad: ' + error.message);
  }
}

async function getEncargadosByCorreo(correo) {
  try {
    const query = `
      SELECT e.id_encargado, e.responsabilidad, e.fecha_inicio, e.hora_ingreso, e.hora_salida, e.estado,
             p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
      FROM ENCARGADO e
      JOIN PERSONA p ON e.id_encargado = p.id_persona
      WHERE p.correo ILIKE $1
      ORDER BY p.correo ASC
      LIMIT 15
    `;
    const result = await pool.query(query, [`%${correo}%`]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al buscar encargados por correo: ' + error.message);
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

// --- Controladores ---
const response = (success, message, data = null) => ({
  success,
  message,
  data,
});

const listarEncargados = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const offset = parseInt(req.query.offset) || 0;

    const { items, hasMore } = await getAllEncargados(limit, offset);

    const encargadosConImagenValidada = await Promise.all(
      items.map(async (encargado) => {
        if (encargado.imagen_perfil) {
          try {
            const filePath = path.join(
              __dirname,
              '../Uploads',
              encargado.imagen_perfil.replace(/^\/*[uU]ploads\//, '')
            );
            await fs.access(filePath);
            return encargado;
          } catch {
            return { ...encargado, imagen_perfil: null };
          }
        }
        return encargado;
      })
    );

    const dataResponse = {
      encargados: encargadosConImagenValidada,
      limit,
      offset,
      hasMore,
    };

    let message = 'Lista de encargados obtenida';
    if (encargadosConImagenValidada.length === 0) {
      message = offset === 0 ? 'No hay encargados registrados' : 'No hay más encargados para mostrarse';
    }

    console.log(`Returning ${encargadosConImagenValidada.length} encargados, hasMore=${hasMore}`);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, 'url solicitada:', req.originalUrl);
    res.status(200).json(response(true, message, dataResponse));
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
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
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
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
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
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
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
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
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
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Encargados obtenidos por estado', encargadosConImagenValidada));
  } catch (error) {
    console.error('Error al listar encargados por estado:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const buscarEncargadoPorNombre = async (req, res) => {
  const { nombre } = req.params;
  try {
    const encargados = await getEncargadosByNombre(nombre);
    if (!encargados.length)
      return res.status(404).json(response(false, "No se encontraron encargados con ese nombre."));

    const encargadosConImagen = await Promise.all(
      encargados.map(async (encargado) => {
        if (encargado.imagen_perfil) {
          try {
            const filePath = path.join(__dirname, "../Uploads", encargado.imagen_perfil.replace(/^\/*[uU]ploads\//, ""));
            await fs.access(filePath);
          } catch {
            encargado.imagen_perfil = null;
          }
        }
        return encargado;
      })
    );

    res.status(200).json(response(true, "Encargados encontrados por nombre", encargadosConImagen));
  } catch (error) {
    console.error("Error al buscar encargados por nombre:", error);
    res.status(500).json(response(false, "Error interno del servidor"));
  }
};

const buscarEncargadoPorResponsabilidad = async (req, res) => {
  const { responsabilidad } = req.params;
  try {
    const encargados = await getEncargadosByResponsabilidad(responsabilidad);
    if (!encargados.length)
      return res.status(404).json(response(false, "No se encontraron encargados con esa responsabilidad."));

    const encargadosConImagen = await Promise.all(
      encargados.map(async (encargado) => {
        if (encargado.imagen_perfil) {
          try {
            const filePath = path.join(__dirname, "../Uploads", encargado.imagen_perfil.replace(/^\/*[uU]ploads\//, ""));
            await fs.access(filePath);
          } catch {
            encargado.imagen_perfil = null;
          }
        }
        return encargado;
      })
    );

    res.status(200).json(response(true, "Encargados encontrados por responsabilidad", encargadosConImagen));
  } catch (error) {
    console.error("Error al buscar encargados por responsabilidad:", error);
    res.status(500).json(response(false, "Error interno del servidor"));
  }
};

const buscarEncargadoPorCorreo = async (req, res) => {
  const { correo } = req.params;
  try {
    const encargados = await getEncargadosByCorreo(correo);
    if (!encargados.length)
      return res.status(404).json(response(false, "No se encontraron encargados con ese correo."));

    const encargadosConImagen = await Promise.all(
      encargados.map(async (encargado) => {
        if (encargado.imagen_perfil) {
          try {
            const filePath = path.join(__dirname, "../Uploads", encargado.imagen_perfil.replace(/^\/*[uU]ploads\//, ""));
            await fs.access(filePath);
          } catch {
            encargado.imagen_perfil = null;
          }
        }
        return encargado;
      })
    );

    res.status(200).json(response(true, "Encargados encontrados por correo", encargadosConImagen));
  } catch (error) {
    console.error("Error al buscar encargados por correo:", error);
    res.status(500).json(response(false, "Error interno del servidor"));
  }
};

const crearEncargado = async (req, res) => {
  const { responsabilidad, fecha_inicio, hora_ingreso, hora_salida, estado, id_persona } = req.body;

  if (!responsabilidad || !fecha_inicio || !hora_ingreso || !hora_salida || estado === undefined || !id_persona) {
    return res.status(400).json(response(false, 'Todos los campos son obligatorios'));
  }

  try {
    // Verificar que id_persona existe en PERSONA
    const personaExistente = await pool.query('SELECT id_persona FROM PERSONA WHERE id_persona = $1', [id_persona]);
    if (!personaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Persona no encontrada'));
    }

    // Normalizar estado a boolean para la BD
    let estadoBool;
    if (typeof estado === 'boolean') {
      estadoBool = estado;
    } else if (typeof estado === 'string') {
      const v = estado.toLowerCase();
      if (v === 'activo') estadoBool = true;
      else if (v === 'inactivo') estadoBool = false;
      else return res.status(400).json(response(false, 'Estado inválido. Use true/false o "activo"/"inactivo"'));
    } else {
      return res.status(400).json(response(false, 'Estado inválido'));
    }

    const nuevoEncargado = await createEncargado(
      responsabilidad,
      fecha_inicio,
      hora_ingreso,
      hora_salida,
      estadoBool, // boolean a la BD
      id_persona
    );

    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
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
    // Normalizar estado si vino en el body
    let estadoBoolOrNull = null;
    if (estado !== undefined) {
      if (typeof estado === 'boolean') {
        estadoBoolOrNull = estado;
      } else if (typeof estado === 'string') {
        const v = estado.toLowerCase();
        if (v === 'activo') estadoBoolOrNull = true;
        else if (v === 'inactivo') estadoBoolOrNull = false;
        else return res.status(400).json(response(false, 'Estado inválido. Use true/false o "activo"/"inactivo"'));
      } else {
        return res.status(400).json(response(false, 'Estado inválido'));
      }
    }

    const encargadoActualizado = await updateEncargado(
      id,
      responsabilidad,
      fecha_inicio,
      hora_ingreso,
      hora_salida,
      estadoBoolOrNull // boolean o null (no actualizar)
    );

    if (!encargadoActualizado) {
      return res.status(404).json(response(false, 'Encargado no encontrado'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
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
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Encargado eliminado exitosamente'));
  } catch (error) {
    console.error('Error al eliminar encargado:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

//-------- Rutas ---------
const router = express.Router();

router.post('/', verifyToken, checkRole(['ADMINISTRADOR']), crearEncargado);

router.get('/datos-total', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), listarEncargados);
router.get('/buscar-nombre/:nombre', verifyToken, checkRole(['ADMINISTRADOR']), buscarEncargadoPorNombre);
router.get('/buscar-responsabilidad/:responsabilidad', verifyToken, checkRole(['ADMINISTRADOR']), buscarEncargadoPorResponsabilidad);
router.get('/buscar-correo/:correo', verifyToken, checkRole(['ADMINISTRADOR']), buscarEncargadoPorCorreo);
router.get('/id/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), obtenerEncargadoPorId);
router.get('/persona/:id_persona', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), obtenerEncargadoPorIdPersona);
router.get('/:id/persona', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), obtenerPersonaPorEncargadoId);
router.get('/estado/:estado', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), listarEncargadosPorEstado);
router.get('/:id/reportes', verifyToken, checkRole(['ADMINISTRADOR', 'ENCARGADO']), obtenerReportesPorEncargadoId);

router.patch('/:id', verifyToken, checkRole(['ADMINISTRADOR']), actualizarEncargado);
router.delete('/:id', verifyToken, checkRole(['ADMINISTRADOR']), eliminarEncargado);

module.exports = router;
