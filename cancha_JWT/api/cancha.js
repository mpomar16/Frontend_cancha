const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');

// --- Configuración de Multer para Cancha ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../Uploads/cancha');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png)'));
  }
};

// Configuración de multer para múltiples campos de imagen
const uploadCancha = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por archivo
}).fields([
  { name: 'imagen_principal', maxCount: 1 },
  { name: 'imagen_sec_1', maxCount: 1 },
  { name: 'imagen_sec_2', maxCount: 1 },
  { name: 'imagen_sec_3', maxCount: 1 },
  { name: 'imagen_sec_4', maxCount: 1 }
]);

// Middleware para manejar la carga de archivos para cancha
const handleUploadCancha = (req, res, next) => {
  uploadCancha(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    try {
      // Continúa con el siguiente middleware/controlador
      await next();
    } catch (error) {
      // Si hay un error en el controlador, elimina los archivos cargados
      if (req.files) {
        Object.keys(req.files).forEach(fieldName => {
          req.files[fieldName].forEach(async file => {
            const filePath = path.join(__dirname, '../Uploads/cancha', file.filename);
            try {
              await fs.unlink(filePath);
              console.log(`Archivo eliminado: ${filePath}`);
            } catch (unlinkError) {
              console.warn(`No se pudo eliminar el archivo: ${filePath}`, unlinkError);
            }
          });
        });
      }
      // Reenvía el error al manejador de errores de Express
      next(error);
    }
  });
};

// --- Modelos ---
async function getAllCanchas() {
  try {
    const query = `
      SELECT id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_espacio
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
      SELECT id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_espacio
      FROM CANCHA
      WHERE id_cancha = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener cancha por ID: ' + error.message);
  }
}

async function getEspacioByCanchaId(id) {
  try {
    const query = `
      SELECT e.id_espacio, e.nombre, e.direccion, e.descripcion, e.latitud, e.longitud, e.horario_apertura, e.horario_cierre, e.id_admin
      FROM ESPACIO_DEPORTIVO e
      JOIN CANCHA c ON e.id_espacio = c.id_espacio
      WHERE c.id_cancha = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener espacio deportivo asociado a la cancha: ' + error.message);
  }
}

async function getReservasByCanchaId(id) {
  try {
    const query = `
      SELECT r.id_reserva, r.fecha_reserva, r.cupo, r.monto_total, r.saldo_pendiente, r.estado, r.id_cliente, r.id_cancha, r.id_disciplina
      FROM RESERVA r
      WHERE r.id_cancha = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar reservas de la cancha: ' + error.message);
  }
}

async function getComentariosByCanchaId(id) {
  try {
    const query = `
      SELECT c.id_comentario, c.contenido, c.fecha_comentario, c.hora_comentario, c.estado, c.id_cancha, c.id_cliente
      FROM COMENTARIO c
      WHERE c.id_cancha = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar comentarios de la cancha: ' + error.message);
  }
}

async function getDisciplinasByCanchaId(id) {
  try {
    const query = `
      SELECT d.id_disciplina, d.nombre, d.descripcion
      FROM DISCIPLINA d
      JOIN se_practica sp ON d.id_disciplina = sp.id_disciplina
      WHERE sp.id_cancha = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar disciplinas de la cancha: ' + error.message);
  }
}

async function getCanchasByEspacioId(id_espacio) {
  try {
    const query = `
      SELECT id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_espacio
      FROM CANCHA
      WHERE id_espacio = $1
    `;
    const result = await pool.query(query, [id_espacio]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar canchas por espacio deportivo: ' + error.message);
  }
}

async function getCanchasByEstado(estado) {
  try {
    const query = `
      SELECT id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_espacio
      FROM CANCHA
      WHERE estado = $1
    `;
    const result = await pool.query(query, [estado]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar canchas por estado: ' + error.message);
  }
}

async function createCancha(nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_espacio) {
  try {
    const query = `
      INSERT INTO CANCHA (nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_espacio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_espacio
    `;
    const values = [nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_espacio];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear cancha: ' + error.message);
  }
}

async function updateCancha(id, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_espacio) {
  try {
    const query = `
      UPDATE CANCHA
      SET nombre = COALESCE($1, nombre),
          capacidad = COALESCE($2, capacidad),
          estado = COALESCE($3, estado),
          ubicacion = COALESCE($4, ubicacion),
          monto_por_hora = COALESCE($5, monto_por_hora),
          imagen_principal = COALESCE($6, imagen_principal),
          imagen_sec_1 = COALESCE($7, imagen_sec_1),
          imagen_sec_2 = COALESCE($8, imagen_sec_2),
          imagen_sec_3 = COALESCE($9, imagen_sec_3),
          imagen_sec_4 = COALESCE($10, imagen_sec_4),
          id_espacio = COALESCE($11, id_espacio)
      WHERE id_cancha = $12
      RETURNING id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_espacio
    `;
    const values = [nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_espacio, id];
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
      RETURNING id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_espacio
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar cancha: ' + error.message);
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

const listarCanchas = async (req, res) => {
  try {
    const canchas = await getAllCanchas();
    const canchasConImagenValidada = await Promise.all(
      canchas.map(async (cancha) => {
        const imagenes = ['imagen_principal', 'imagen_sec_1', 'imagen_sec_2', 'imagen_sec_3', 'imagen_sec_4'];
        for (const img of imagenes) {
          if (cancha[img]) {
            try {
              const filePath = path.join(__dirname, '../Uploads/cancha', cancha[img].replace(/^\/*[uU]ploads\/cancha\//, ''));
              await fs.access(filePath);
            } catch (error) {
              console.warn(`Imagen no encontrada para cancha ${cancha.id_cancha}: ${cancha[img]}`);
              cancha[img] = null;
            }
          }
        }
        return cancha;
      })
    );
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
    const imagenes = ['imagen_principal', 'imagen_sec_1', 'imagen_sec_2', 'imagen_sec_3', 'imagen_sec_4'];
    for (const img of imagenes) {
      if (cancha[img]) {
        try {
          const filePath = path.join(__dirname, '../Uploads/cancha', cancha[img].replace(/^\/*[uU]ploads\/cancha\//, ''));
          await fs.access(filePath);
        } catch (error) {
          console.warn(`Imagen no encontrada para cancha ${cancha.id_cancha}: ${cancha[img]}`);
          cancha[img] = null;
        }
      }
    }
    res.status(200).json(response(true, 'Cancha obtenida', cancha));
  } catch (error) {
    console.error('Error al obtener cancha por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerEspacioPorCanchaId = async (req, res) => {
  const { id } = req.params;

  try {
    const espacio = await getEspacioByCanchaId(id);
    if (!espacio) {
      return res.status(404).json(response(false, 'Espacio deportivo no encontrado'));
    }
    res.status(200).json(response(true, 'Espacio deportivo obtenido', espacio));
  } catch (error) {
    console.error('Error al obtener espacio deportivo asociado a la cancha:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerReservasPorCanchaId = async (req, res) => {
  const { id } = req.params;

  try {
    const reservas = await getReservasByCanchaId(id);
    if (!reservas.length) {
      return res.status(404).json(response(false, 'No se encontraron reservas para esta cancha'));
    }
    res.status(200).json(response(true, 'Reservas obtenidas', reservas));
  } catch (error) {
    console.error('Error al listar reservas de la cancha:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerComentariosPorCanchaId = async (req, res) => {
  const { id } = req.params;

  try {
    const comentarios = await getComentariosByCanchaId(id);
    if (!comentarios.length) {
      return res.status(404).json(response(false, 'No se encontraron comentarios para esta cancha'));
    }
    res.status(200).json(response(true, 'Comentarios obtenidos', comentarios));
  } catch (error) {
    console.error('Error al listar comentarios de la cancha:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerDisciplinasPorCanchaId = async (req, res) => {
  const { id } = req.params;

  try {
    const disciplinas = await getDisciplinasByCanchaId(id);
    if (!disciplinas.length) {
      return res.status(404).json(response(false, 'No se encontraron disciplinas para esta cancha'));
    }
    res.status(200).json(response(true, 'Disciplinas obtenidas', disciplinas));
  } catch (error) {
    console.error('Error al listar disciplinas de la cancha:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarCanchasPorEspacioId = async (req, res) => {
  const { id_espacio } = req.params;

  try {
    const canchas = await getCanchasByEspacioId(id_espacio);
    if (!canchas.length) {
      return res.status(404).json(response(false, 'No se encontraron canchas para este espacio deportivo'));
    }
    const canchasConImagenValidada = await Promise.all(
      canchas.map(async (cancha) => {
        const imagenes = ['imagen_principal', 'imagen_sec_1', 'imagen_sec_2', 'imagen_sec_3', 'imagen_sec_4'];
        for (const img of imagenes) {
          if (cancha[img]) {
            try {
              const filePath = path.join(__dirname, '../Uploads/cancha', cancha[img].replace(/^\/*[uU]ploads\/cancha\//, ''));
              await fs.access(filePath);
            } catch (error) {
              console.warn(`Imagen no encontrada para cancha ${cancha.id_cancha}: ${cancha[img]}`);
              cancha[img] = null;
            }
          }
        }
        return cancha;
      })
    );
    res.status(200).json(response(true, 'Canchas obtenidas por espacio deportivo', canchasConImagenValidada));
  } catch (error) {
    console.error('Error al listar canchas por espacio deportivo:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarCanchasPorEstado = async (req, res) => {
  const { estado } = req.params;

  try {
    const canchas = await getCanchasByEstado(estado);
    if (!canchas.length) {
      return res.status(404).json(response(false, 'No se encontraron canchas para este estado'));
    }
    const canchasConImagenValidada = await Promise.all(
      canchas.map(async (cancha) => {
        const imagenes = ['imagen_principal', 'imagen_sec_1', 'imagen_sec_2', 'imagen_sec_3', 'imagen_sec_4'];
        for (const img of imagenes) {
          if (cancha[img]) {
            try {
              const filePath = path.join(__dirname, '../Uploads/cancha', cancha[img].replace(/^\/*[uU]ploads\/cancha\//, ''));
              await fs.access(filePath);
            } catch (error) {
              console.warn(`Imagen no encontrada para cancha ${cancha.id_cancha}: ${cancha[img]}`);
              cancha[img] = null;
            }
          }
        }
        return cancha;
      })
    );
    res.status(200).json(response(true, 'Canchas obtenidas por estado', canchasConImagenValidada));
  } catch (error) {
    console.error('Error al listar canchas por estado:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearCancha = async (req, res) => {
  const { nombre, capacidad, estado, ubicacion, monto_por_hora, id_espacio } = req.body;

  if (!nombre || !capacidad || !id_espacio) {
    return res.status(400).json(response(false, 'Nombre, capacidad e id_espacio son obligatorios'));
  }

  try {
    // Verificar que id_espacio existe en ESPACIO_DEPORTIVO
    const espacioExistente = await pool.query('SELECT id_espacio FROM ESPACIO_DEPORTIVO WHERE id_espacio = $1', [id_espacio]);
    if (!espacioExistente.rows[0]) {
      return res.status(404).json(response(false, 'Espacio deportivo no encontrado'));
    }

    // Validar capacidad
    if (capacidad <= 0) {
      return res.status(400).json(response(false, 'La capacidad debe ser mayor que 0'));
    }

    // Validar monto_por_hora
    if (monto_por_hora && monto_por_hora < 0) {
      return res.status(400).json(response(false, 'El monto por hora no puede ser negativo'));
    }

    // Procesar imágenes desde req.files
    const imagen_principal = req.files && req.files['imagen_principal'] && req.files['imagen_principal'][0] ? `/uploads/cancha/${req.files['imagen_principal'][0].filename}` : null;
    const imagen_sec_1 = req.files && req.files['imagen_sec_1'] && req.files['imagen_sec_1'][0] ? `/uploads/cancha/${req.files['imagen_sec_1'][0].filename}` : null;
    const imagen_sec_2 = req.files && req.files['imagen_sec_2'] && req.files['imagen_sec_2'][0] ? `/uploads/cancha/${req.files['imagen_sec_2'][0].filename}` : null;
    const imagen_sec_3 = req.files && req.files['imagen_sec_3'] && req.files['imagen_sec_3'][0] ? `/uploads/cancha/${req.files['imagen_sec_3'][0].filename}` : null;
    const imagen_sec_4 = req.files && req.files['imagen_sec_4'] && req.files['imagen_sec_4'][0] ? `/uploads/cancha/${req.files['imagen_sec_4'][0].filename}` : null;

    const nuevaCancha = await createCancha(nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_espacio);
    res.status(201).json(response(true, 'Cancha creada exitosamente', nuevaCancha));
  } catch (error) {
    console.error('Error al crear cancha:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarCancha = async (req, res) => {
  const { id } = req.params;
  const { nombre, capacidad, estado, ubicacion, monto_por_hora, id_espacio } = req.body;

  try {
    // Validar capacidad si se proporciona
    if (capacidad && capacidad <= 0) {
      return res.status(400).json(response(false, 'La capacidad debe ser mayor que 0'));
    }

    // Validar monto_por_hora si se proporciona
    if (monto_por_hora && monto_por_hora < 0) {
      return res.status(400).json(response(false, 'El monto por hora no puede ser negativo'));
    }

    // Verificar que id_espacio existe si se proporciona
    if (id_espacio) {
      const espacioExistente = await pool.query('SELECT id_espacio FROM ESPACIO_DEPORTIVO WHERE id_espacio = $1', [id_espacio]);
      if (!espacioExistente.rows[0]) {
        return res.status(404).json(response(false, 'Espacio deportivo no encontrado'));
      }
    }

    // Procesar imágenes nuevas desde req.files (solo actualizar si se envían)
    let imagen_principal = null;
    let imagen_sec_1 = null;
    let imagen_sec_2 = null;
    let imagen_sec_3 = null;
    let imagen_sec_4 = null;

    if (req.files) {
      if (req.files['imagen_principal'] && req.files['imagen_principal'][0]) {
        imagen_principal = `/uploads/cancha/${req.files['imagen_principal'][0].filename}`;
      }
      if (req.files['imagen_sec_1'] && req.files['imagen_sec_1'][0]) {
        imagen_sec_1 = `/uploads/cancha/${req.files['imagen_sec_1'][0].filename}`;
      }
      if (req.files['imagen_sec_2'] && req.files['imagen_sec_2'][0]) {
        imagen_sec_2 = `/uploads/cancha/${req.files['imagen_sec_2'][0].filename}`;
      }
      if (req.files['imagen_sec_3'] && req.files['imagen_sec_3'][0]) {
        imagen_sec_3 = `/uploads/cancha/${req.files['imagen_sec_3'][0].filename}`;
      }
      if (req.files['imagen_sec_4'] && req.files['imagen_sec_4'][0]) {
        imagen_sec_4 = `/uploads/cancha/${req.files['imagen_sec_4'][0].filename}`;
      }
    }

    const canchaActualizada = await updateCancha(id, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_espacio);
    if (!canchaActualizada) {
      return res.status(404).json(response(false, 'Cancha no encontrada'));
    }
    res.status(200).json(response(true, 'Cancha actualizada exitosamente', canchaActualizada));
  } catch (error) {
    console.error('Error al actualizar cancha:', error);
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
    res.status(200).json(response(true, 'Cancha eliminada exitosamente'));
  } catch (error) {
    console.error('Error al eliminar cancha:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

// --- Rutas ---
const router = express.Router();

// Aplicar middleware de upload para POST y PATCH
router.post('/', handleUploadCancha, verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), crearCancha);

router.get('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), listarCanchas);
router.get('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerCanchaPorId);
router.get('/espacio/:id_espacio', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), listarCanchasPorEspacioId);
router.get('/estado/:estado', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), listarCanchasPorEstado);
router.get('/:id/espacio', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerEspacioPorCanchaId);
router.get('/:id/reservas', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerReservasPorCanchaId);
router.get('/:id/disciplinas', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerDisciplinasPorCanchaId);
//falta
router.get('/:id/comentarios', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerComentariosPorCanchaId);

router.patch('/:id', handleUploadCancha, verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), actualizarCancha);
router.delete('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), eliminarCancha);

module.exports = router;