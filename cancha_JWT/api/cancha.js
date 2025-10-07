const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');

// --- Multer Configuration ---
async function getNombreParaArchivo(req, campo) {
  try {
    if (req.method === 'PATCH' && req.params.id) {
      // PATCH: tomamos el nombre de la cancha existente en la DB
      const result = await pool.query('SELECT nombre FROM CANCHA WHERE id_cancha = $1', [req.params.id]);
      if (result.rows[0]) return result.rows[0].nombre.replace(/\s+/g, '_').toLowerCase();
    } else if (req.method === 'POST' && req.body.nombre) {
      // POST: usamos el nombre enviado en body
      return req.body.nombre.replace(/\s+/g, '_').toLowerCase();
    }
    return 'imagen';
  } catch (error) {
    console.error('Error al obtener nombre para archivo:', error);
    return 'imagen';
  }
}

function handleUpload(folder, campo) {
  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        const uploadPath = path.join(__dirname, `../Uploads/${folder}`);
        await fs.mkdir(uploadPath, { recursive: true });
        cb(null, uploadPath);
      } catch (error) {
        cb(error);
      }
    },
    filename: async (req, file, cb) => {
      try {
        const now = new Date();
        const fecha = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const hora = now.toTimeString().split(' ')[0].replace(/:/g, '_'); // HH_MM_SS
        const random3 = Math.floor(100 + Math.random() * 900); // 3 dígitos aleatorios
        const nombreCancha = await getNombreParaArchivo(req, campo);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${nombreCancha}-${fecha}-${hora}-${random3}${ext}`);
      } catch (error) {
        console.error('Error generando nombre de archivo:', error);
        cb(error);
      }
    }
  });

  const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (.jpg, .jpeg, .png, .webp)'));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }).single(campo);
}

// --- Modelos ---
async function getAllCanchas() {
  try {
    const query = `
      SELECT id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio
      FROM CANCHA
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar canchas: ' + error.message);
  }
}

async function getCanchaById(id) {
  try {
    const query = `
      SELECT id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio
      FROM CANCHA
      WHERE id_cancha = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener cancha por ID: ' + error.message);
  }
}

async function createCancha(nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio) {
  try {
    const query = `
      INSERT INTO CANCHA (nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio
    `;
    const values = [nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear cancha: ' + error.message);
  }
}

async function updateCancha(id, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio) {
  try {
    const query = `
      UPDATE CANCHA
      SET nombre = COALESCE($1, nombre),
          capacidad = COALESCE($2, capacidad),
          estado = COALESCE($3, estado),
          ubicacion = COALESCE($4, ubicacion),
          monto_por_hora = COALESCE($5, monto_por_hora),
          imagen_cancha = COALESCE($6, imagen_cancha),
          id_espacio = COALESCE($7, id_espacio)
      WHERE id_cancha = $8
      RETURNING id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio
    `;
    const values = [nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar cancha: ' + error.message);
  }
}

async function deleteCancha(id) {
  try {
    const query = `
      DELETE FROM CANCHA
      WHERE id_cancha = $1
      RETURNING id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar cancha: ' + error.message);
  }
}

async function getEstadoCanchaEnumValues() {
  try {
    const query = `
      SELECT e.enumlabel AS value
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'estado_cancha_enum'
      ORDER BY e.enumsortorder
    `;
    const result = await pool.query(query);
    return result.rows.map(row => row.value);
  } catch (error) {
    throw new Error('Error al obtener valores de estado_cancha_enum: ' + error.message);
  }
}

async function getDisciplinasUnicas() {
  try {
    const query = `
      SELECT DISTINCT nombre
      FROM DISCIPLINA
      ORDER BY nombre
    `;
    const result = await pool.query(query);
    return result.rows.map(row => row.nombre);
  } catch (error) {
    throw new Error('Error al listar disciplinas únicas: ' + error.message);
  }
}

async function asignarDisciplinas(idCancha, disciplinas) {
  const query = `
    INSERT INTO se_practica (id_cancha, id_disciplina, frecuencia_practica)
    VALUES ($1, $2, $3)
    ON CONFLICT (id_cancha, id_disciplina) DO UPDATE
    SET frecuencia_practica = EXCLUDED.frecuencia_practica
    RETURNING *;
  `;

  const results = [];
  for (const disc of disciplinas) {
    const { id_disciplina, frecuencia_practica } = disc;
    const result = await pool.query(query, [
      idCancha,
      id_disciplina,
      frecuencia_practica || null
    ]);
    results.push(result.rows[0]);
  }
  return results;
}

async function getDisciplinasPorCancha(idCancha) {
  const query = `
    SELECT 
      d.id_disciplina,
      d.nombre,
      d.descripcion,
      sp.frecuencia_practica
    FROM se_practica sp
    JOIN DISCIPLINA d ON sp.id_disciplina = d.id_disciplina
    WHERE sp.id_cancha = $1
    ORDER BY d.nombre;
  `;
  const result = await pool.query(query, [idCancha]);
  return result.rows;
}


async function getDisciplinasPorCancha(id_cancha) {
  try {
    const query = `
      SELECT d.nombre
      FROM DISCIPLINA d
      JOIN se_practica sp ON d.id_disciplina = sp.id_disciplina
      WHERE sp.id_cancha = $1
      ORDER BY d.nombre
    `;
    const result = await pool.query(query, [id_cancha]);
    return result.rows.map(row => row.nombre);
  } catch (error) {
    throw new Error('Error al listar disciplinas por cancha: ' + error.message);
  }
}

async function getResenasPorCancha(id_cancha) {
  try {
    const query = `
      SELECT r.id_resena, r.estrellas, r.comentario, r.fecha_creacion, r.estado
      FROM RESENA r
      JOIN RESERVA res ON r.id_reserva = res.id_reserva
      WHERE res.id_cancha = $1
      ORDER BY r.fecha_creacion DESC
    `;
    const result = await pool.query(query, [id_cancha]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar reseñas por cancha: ' + error.message);
  }
}

async function getPromedioResenasPorCancha(id_cancha) {
  try {
    const query = `
      SELECT 
        COALESCE(AVG(r.estrellas), 0) as promedio_estrellas,
        COUNT(r.id_resena) as total_comentarios
      FROM RESENA r
      JOIN RESERVA res ON r.id_reserva = res.id_reserva
      WHERE res.id_cancha = $1
    `;
    const result = await pool.query(query, [id_cancha]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al calcular promedio de reseñas por cancha: ' + error.message);
  }
}

async function getResenasDetalladasPorCancha(id_cancha) {
  try {
    const query = `
      SELECT r.estrellas, r.comentario, r.fecha_creacion, p.nombre as nombre_cliente
      FROM RESENA r
      JOIN RESERVA res ON r.id_reserva = res.id_reserva
      JOIN CLIENTE c ON res.id_cliente = c.id_cliente
      JOIN PERSONA p ON c.id_cliente = p.id_persona
      WHERE res.id_cancha = $1
      ORDER BY r.fecha_creacion DESC
    `;
    const result = await pool.query(query, [id_cancha]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar reseñas detalladas por cancha: ' + error.message);
  }
}

async function crearResena(id_reserva, estrellas, comentario) {
  try {
    const query = `
      INSERT INTO RESENA (id_reserva, estrellas, comentario, fecha_creacion)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING id_resena, id_reserva, estrellas, comentario, fecha_creacion
    `;
    const values = [id_reserva, estrellas, comentario];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear reseña: ' + error.message);
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

const listarCanchas = async (req, res) => {
  try {
    const canchas = await getAllCanchas();
    const canchasConImagenValidada = await Promise.all(
      canchas.map(async (cancha) => {
        if (cancha.imagen_cancha) {
          try {
            const filePath = path.join(__dirname, '../Uploads/cancha', cancha.imagen_cancha.replace(/^\/*[uU]ploads\/cancha\//, ''));
            await fs.access(filePath);
          } catch (error) {
            console.warn(`Imagen no encontrada para cancha ${cancha.id_cancha}: ${cancha.imagen_cancha}`);
            cancha.imagen_cancha = null;
          }
        }
        return cancha;
      })
    );
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Lista de canchas obtenida', canchasConImagenValidada));
  } catch (error) {
    console.error('Error al listar canchas:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerCanchaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const cancha = await getCanchaById(id);
    if (!cancha) {
      return res.status(404).json(response(false, 'Cancha no encontrada'));
    }
    if (cancha.imagen_cancha) {
      try {
        const filePath = path.join(__dirname, '../Uploads/cancha', cancha.imagen_cancha.replace(/^\/*[uU]ploads\/cancha\//, ''));
        await fs.access(filePath);
      } catch (error) {
        console.warn(`Imagen no encontrada para cancha ${cancha.id_cancha}: ${cancha.imagen_cancha}`);
        cancha.imagen_cancha = null;
      }
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Cancha obtenida', cancha));
  } catch (error) {
    console.error('Error al obtener cancha por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearCancha = async (req, res) => {
  const { nombre, capacidad, estado, ubicacion, monto_por_hora, id_espacio, disciplinas } = req.body;

  // Validaciones básicas
  if (!nombre || !capacidad || !id_espacio) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
        console.log(`🗑️ Archivo eliminado por error de validación: ${req.file.path}`);
      } catch (unlinkError) {
        console.warn(`⚠️ No se pudo eliminar archivo temporal: ${req.file.path}`, unlinkError);
      }
    }
    return res.status(400).json({
      success: false,
      message: "Nombre, capacidad e id_espacio son obligatorios",
    });
  }

  const imagen_cancha = req.file ? `/uploads/cancha/${req.file.filename}` : null;
  const disciplinasArray = disciplinas ? JSON.parse(disciplinas) : [];

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Verificar que el espacio deportivo exista
    const espacioExistente = await client.query(
      "SELECT id_espacio FROM ESPACIO_DEPORTIVO WHERE id_espacio = $1",
      [id_espacio]
    );

    if (!espacioExistente.rows[0]) {
      await client.query("ROLLBACK");
      if (req.file) await fs.unlink(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Espacio deportivo no encontrado",
      });
    }

    // 2️⃣ Crear la cancha
    const insertCancha = await client.query(
      `
      INSERT INTO CANCHA (nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio
      `,
      [nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio]
    );

    const nuevaCancha = insertCancha.rows[0];

    // 3️⃣ Insertar disciplinas si se enviaron
    if (Array.isArray(disciplinasArray) && disciplinasArray.length > 0) {
      for (const id_disciplina of disciplinasArray) {
        await client.query(
          `
          INSERT INTO se_practica (id_cancha, id_disciplina)
          VALUES ($1, $2)
          ON CONFLICT (id_cancha, id_disciplina) DO NOTHING
          `,
          [nuevaCancha.id_cancha, id_disciplina]
        );
      }
    }

    await client.query("COMMIT");

    console.log(`✅ Cancha creada con éxito y ${disciplinasArray.length} disciplinas asignadas.`);

    res.status(201).json({
      success: true,
      message: "Cancha creada exitosamente",
      data: {
        ...nuevaCancha,
        disciplinas_asignadas: disciplinasArray,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error al crear cancha:", error.message);

    if (req.file) {
      try {
        await fs.unlink(req.file.path);
        console.log(`🗑️ Archivo eliminado por error: ${req.file.path}`);
      } catch (unlinkError) {
        console.warn(`⚠️ No se pudo eliminar archivo temporal: ${req.file.path}`, unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  } finally {
    client.release();
  }
};


const actualizarCancha = async (req, res) => {
  const { id } = req.params;
  const { nombre, capacidad, estado, ubicacion, monto_por_hora, id_espacio } = req.body;
  try {
    const canchaExistente = await pool.query('SELECT imagen_cancha FROM CANCHA WHERE id_cancha = $1', [id]);
    if (!canchaExistente.rows[0]) {
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
          console.log(`Archivo eliminado: ${req.file.path}`);
        } catch (unlinkError) {
          console.warn(`No se pudo eliminar el archivo: ${req.file.path}`, unlinkError);
        }
      }
      return res.status(404).json(response(false, 'Cancha no encontrada'));
    }
    if (capacidad && capacidad <= 0) {
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
          console.log(`Archivo eliminado: ${req.file.path}`);
        } catch (unlinkError) {
          console.warn(`No se pudo eliminar el archivo: ${req.file.path}`, unlinkError);
        }
      }
      return res.status(400).json(response(false, 'La capacidad debe ser mayor que 0'));
    }
    if (monto_por_hora && monto_por_hora < 0) {
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
          console.log(`Archivo eliminado: ${req.file.path}`);
        } catch (unlinkError) {
          console.warn(`No se pudo eliminar el archivo: ${req.file.path}`, unlinkError);
        }
      }
      return res.status(400).json(response(false, 'El monto por hora no puede ser negativo'));
    }
    if (id_espacio) {
      const espacioExistente = await pool.query('SELECT id_espacio FROM ESPACIO_DEPORTIVO WHERE id_espacio = $1', [id_espacio]);
      if (!espacioExistente.rows[0]) {
        if (req.file) {
          try {
            await fs.unlink(req.file.path);
            console.log(`Archivo eliminado: ${req.file.path}`);
          } catch (unlinkError) {
            console.warn(`No se pudo eliminar el archivo: ${req.file.path}`, unlinkError);
          }
        }
        return res.status(404).json(response(false, 'Espacio deportivo no encontrado'));
      }
    }
    const imagen_cancha = req.file ? `/uploads/cancha/${req.file.filename}` : null;
    if (imagen_cancha && canchaExistente.rows[0].imagen_cancha) {
      try {
        const oldPath = path.join(__dirname, '../Uploads/cancha', canchaExistente.rows[0].imagen_cancha.replace(/^\/*[uU]ploads\/cancha\//, ''));
        await fs.unlink(oldPath);
        console.log(`Archivo eliminado: ${oldPath}`);
      } catch (unlinkError) {
        console.warn(`No se pudo eliminar el archivo antiguo: ${canchaExistente.rows[0].imagen_cancha}`, unlinkError);
      }
    }
    const canchaActualizada = await updateCancha(id, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio);
    if (!canchaActualizada) {
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
          console.log(`Archivo eliminado: ${req.file.path}`);
        } catch (unlinkError) {
          console.warn(`No se pudo eliminar el archivo: ${req.file.path}`, unlinkError);
        }
      }
      return res.status(404).json(response(false, 'Cancha no encontrada'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Cancha actualizada exitosamente', canchaActualizada));
  } catch (error) {
    console.error('Error al actualizar cancha:', error);
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
        console.log(`Archivo eliminado: ${req.file.path}`);
      } catch (unlinkError) {
        console.warn(`No se pudo eliminar el archivo: ${req.file.path}`, unlinkError);
      }
    }
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarCancha = async (req, res) => {
  const { id } = req.params;
  try {
    const canchaEliminada = await deleteCancha(id);
    if (!canchaEliminada) {
      return res.status(404).json(response(false, 'Cancha no encontrada'));
    }
    if (canchaEliminada.imagen_cancha) {
      try {
        const filePath = path.join(__dirname, '../Uploads/cancha', canchaEliminada.imagen_cancha.replace(/^\/*[uU]ploads\/cancha\//, ''));
        await fs.unlink(filePath);
        console.log(`Archivo eliminado: ${filePath}`);
      } catch (unlinkError) {
        console.warn(`No se pudo eliminar el archivo: ${canchaEliminada.imagen_cancha}`, unlinkError);
      }
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Cancha eliminada exitosamente'));
  } catch (error) {
    console.error('Error al eliminar cancha:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarEstadoCanchaEnum = async (req, res) => {
  try {
    const valores = await getEstadoCanchaEnumValues();
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Valores de estado_cancha_enum obtenidos correctamente', valores));
  } catch (error) {
    console.error('Error al listar estado_cancha_enum:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

async function listarDisciplinasUnicas(req, res) {
  try {
    const disciplinas = await getDisciplinasUnicas();
    let message = 'Lista de disciplinas únicas obtenida';
    if (!disciplinas.length) {
      message = 'No hay disciplinas registradas';
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, message, disciplinas));
  } catch (error) {
    console.error('Error al listar disciplinas únicas:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
}


async function asignarDisciplinasController(req, res) {
  try {
    const idCancha = parseInt(req.params.id);
    const { disciplinas } = req.body;

    if (!Array.isArray(disciplinas) || disciplinas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debes enviar un arreglo de disciplinas'
      });
    }

    const inserted = await asignarDisciplinas(idCancha, disciplinas);

    res.status(201).json({
      success: true,
      message: 'Disciplinas asignadas correctamente',
      data: inserted
    });
  } catch (error) {
    console.error('❌ Error en asignarDisciplinasController:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

async function getDisciplinasPorCanchaController(req, res) {
  try {
    const idCancha = parseInt(req.params.id);
    const disciplinas = await getDisciplinasPorCancha(idCancha);

    res.status(200).json({
      success: true,
      message: 'Disciplinas obtenidas correctamente',
      data: disciplinas
    });
  } catch (error) {
    console.error('❌ Error en getDisciplinasPorCanchaController:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

async function listarDisciplinasPorCancha(req, res) {
  const { id_cancha } = req.params;

  try {
    const disciplinas = await getDisciplinasPorCancha(id_cancha);
    if (!disciplinas.length) {
      return res.status(404).json(response(false, 'No se encontraron disciplinas para esta cancha'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Disciplinas obtenidas por cancha', disciplinas));
  } catch (error) {
    console.error('Error al listar disciplinas por cancha:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
}

async function listarResenasPorCancha(req, res) {
  const { id_cancha } = req.params;

  try {
    const resenas = await getResenasPorCancha(id_cancha);
    if (!resenas.length) {
      return res.status(404).json(response(false, 'No se encontraron reseñas para esta cancha'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Reseñas obtenidas por cancha', resenas));
  } catch (error) {
    console.error('Error al listar reseñas por cancha:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
}

async function calcularPromedioResenas(req, res) {
  const { id_cancha } = req.params;

  try {
    const stats = await getPromedioResenasPorCancha(id_cancha);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Promedio de reseñas y total de comentarios obtenidos', stats));
  } catch (error) {
    console.error('Error al calcular promedio de reseñas:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
}

async function listarResenasDetalladas(req, res) {
  const { id_cancha } = req.params;

  try {
    const resenas = await getResenasDetalladasPorCancha(id_cancha);
    if (!resenas.length) {
      return res.status(404).json(response(false, 'No se encontraron reseñas detalladas para esta cancha'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Reseñas detalladas obtenidas por cancha', resenas));
  } catch (error) {
    console.error('Error al listar reseñas detalladas por cancha:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
}

async function crearResenaCancha(req, res) {
  const { id_reserva, estrellas, comentario } = req.body;

  if (!id_reserva || !estrellas || estrellas < 1 || estrellas > 5) {
    return res.status(400).json(response(false, 'id_reserva y estrellas (1-5) son obligatorios'));
  }

  try {
    // Verify if reserva exists and belongs to the authenticated client
    const reservaExistente = await pool.query(
      'SELECT id_reserva FROM RESERVA WHERE id_reserva = $1 AND id_cliente = $2',
      [id_reserva, req.user.id]
    );
    if (!reservaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Reserva no encontrada o no pertenece al cliente'));
    }

    // Check if a review already exists for this reserva
    const resenaExistente = await pool.query(
      'SELECT id_resena FROM RESENA WHERE id_reserva = $1',
      [id_reserva]
    );
    if (resenaExistente.rows[0]) {
      return res.status(400).json(response(false, 'Ya existe una reseña para esta reserva'));
    }

    const nuevaResena = await crearResena(id_reserva, estrellas, comentario);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(201).json(response(true, 'Reseña creada exitosamente', nuevaResena));
  } catch (error) {
    console.error('Error al crear reseña:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
}

// --- Rutas ---
const router = express.Router();

const handleUploadCancha = handleUpload('cancha', 'imagen_cancha');

router.post('/', handleUploadCancha, verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP']), crearCancha);

router.get('/datos-total', verifyToken, listarCanchas);
router.get('/id/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerCanchaPorId);
router.get('/estado-cancha-enum', verifyToken, checkRole(['ADMINISTRADOR', 'ADMINISTRADOR', 'ENCARGADO']), listarEstadoCanchaEnum);
router.get('/filtro-deportes', listarDisciplinasUnicas);

router.post('/asignar-disciplina/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), asignarDisciplinasController);
router.get('/:id/disciplinas', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']),getDisciplinasPorCanchaController);

router.get('/disciplinas-cancha/:id_cancha', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), listarDisciplinasPorCancha);
router.get('/resenas-cancha/:id_cancha', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), listarResenasPorCancha);
router.get('/promedio-resenas/:id_cancha', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), calcularPromedioResenas);
router.get('/resenas-detalladas/:id_cancha', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), listarResenasDetalladas);
router.post('/resena-cancha', verifyToken, checkRole(['CLIENTE', 'DEPORTISTA']), crearResenaCancha);

router.patch('/:id', handleUploadCancha, verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP']), actualizarCancha);
router.delete('/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP']), eliminarCancha);

module.exports = router;