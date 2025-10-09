const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;


// Función para obtener el nombre de la cancha desde la DB
async function getNombreParaArchivo(req, campo) {
  try {
    if (req.method === 'PATCH' && req.params.id) {
      // Si es PATCH, tomamos el nombre de la cancha actual en la DB
      const result = await pool.query('SELECT nombre FROM CANCHA WHERE id_cancha = $1', [req.params.id])
      if (result.rows[0]) return result.rows[0].nombre.replace(/\s+/g, '_')
    } else if (req.body[campo]) {
      // Si es POST y se envía nombre en body
      return req.body[campo].replace(/\s+/g, '_')
    }
    return 'imagen' // fallback
  } catch (error) {
    console.error('Error al obtener nombre para archivo:', error)
    return 'imagen'
  }
}

function handleUpload(folder, campo) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, `../Uploads/${folder}`))
    },
    filename: async (req, file, cb) => {
      try {
        const now = new Date()
        const fecha = now.toISOString().split('T')[0] // YYYY-MM-DD
        const hora = now.toTimeString().split(' ')[0].replace(/:/g, '_') // HH-MM-SS
        const random3 = Math.floor(100 + Math.random() * 900) // 3 dígitos aleatorios
        const nombreCancha = await getNombreParaArchivo(req, campo)
        const ext = path.extname(file.originalname).toLowerCase()
        cb(null, `${nombreCancha}-${fecha}-${hora}-${random3}${ext}`)
      } catch (error) {
        console.error('Error generando nombre de archivo:', error)
        cb(error)
      }
    }
  })

  const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedExtensions.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('Solo se permiten imágenes (.jpg, .jpeg, .png, .webp)'))
    }
  }

  return multer({ storage, fileFilter }).single(campo)
}

async function getNombreParaArchivo(req, defaultFolder) {
  let nombreParaArchivo = 'espacio';

  // Si se envió un nombre en el body, usarlo
  if (req.body?.nombre) {
    nombreParaArchivo = req.body.nombre;
  } 
  // Si no, y estamos haciendo PATCH (tiene params.id), buscar el nombre actual en DB
  else if (req.params?.id) {
    try {
      const espacio = await pool.query(
        'SELECT nombre FROM ESPACIO_DEPORTIVO WHERE id_espacio = $1',
        [req.params.id]
      );
      if (espacio.rows[0]?.nombre) {
        nombreParaArchivo = espacio.rows[0].nombre;
      }
    } catch (error) {
      console.warn('No se pudo obtener nombre del espacio para archivo:', error.message);
    }
  }

  // Limpiar espacios y normalizar a minúsculas
  return nombreParaArchivo.replace(/\s+/g, '_').toLowerCase();
}

// --- Configuración de Multer para múltiples imágenes ---
const handleMultipleUpload = (folder, fieldConfigs = []) => {
  // Configuración de almacenamiento dinámico
  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        const uploadPath = path.join(__dirname, '../Uploads', folder);
        await fs.mkdir(uploadPath, { recursive: true });
        cb(null, uploadPath);
      } catch (error) {
        cb(error, null);
      }
    },
    filename: async (req, file, cb) => {
      const now = new Date();
      const fecha = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const hora = now.toTimeString().split(' ')[0].replace(/:/g, '_'); // HH-MM-SS
      const random3 = Math.floor(100 + Math.random() * 900); // 3 dígitos aleatorios

      const espacioNombre = await getNombreParaArchivo(req, 'espacio'); // ✅ aquí extrae de DB si es PATCH
      const ext = path.extname(file.originalname).toLowerCase();

      cb(null, `${espacioNombre}-${fecha}-${hora}-${random3}${ext}`);
    }

  });

  // Filtro para aceptar solo imágenes
  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/; // ampliable
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido (solo jpeg, jpg, png, webp)'));
    }
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB por archivo
  });

  // Middleware dinámico para múltiples campos
  return (req, res, next) => {
    upload.fields(fieldConfigs)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      try {
        await next();
      } catch (error) {
        // Eliminar archivos subidos en caso de error
        if (req.files) {
          for (const field in req.files) {
            for (const file of req.files[field]) {
              const filePath = path.join(__dirname, '../Uploads', folder, file.filename);
              try {
                await fs.unlink(filePath);
                console.log(`Archivo eliminado: ${filePath}`);
              } catch (unlinkError) {
                console.warn(`No se pudo eliminar el archivo: ${filePath}`, unlinkError);
              }
            }
          }
        }
        next(error);
      }
    });
  };
};

// --- Modelos ---
async function getAllEspacios(limit = 12, offset = 0) {
  try {
    const query = `
      SELECT id_espacio, nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, 
             imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_admin_esp_dep
      FROM ESPACIO_DEPORTIVO
      ORDER BY id_espacio
      LIMIT $1 OFFSET $2
      `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar espacios deportivos: ' + error.message);
  }
}

async function getEspacioById(id) {
  try {
    const query = `
      SELECT 
        e.id_espacio,
        e.nombre,
        e.direccion,
        e.descripcion,
        e.latitud,
        e.longitud,
        e.horario_apertura,
        e.horario_cierre,
        e.imagen_principal,
        e.imagen_sec_1,
        e.imagen_sec_2,
        e.imagen_sec_3,
        e.imagen_sec_4,
        e.id_admin_esp_dep,
        CONCAT(p.nombre, ' ', p.apellido) AS admin_nombre_completo
      FROM ESPACIO_DEPORTIVO e
      JOIN ADMIN_ESP_DEP aed ON e.id_admin_esp_dep = aed.id_admin_esp_dep
      JOIN PERSONA p ON aed.id_admin_esp_dep = p.id_persona
      WHERE e.id_espacio = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener espacio deportivo por ID: ' + error.message);
  }
}

async function getEspaciosByAdminId(id_admin_esp_dep) {
  try {
    const query = `
      SELECT id_espacio, nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, 
             imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_admin_esp_dep
      FROM ESPACIO_DEPORTIVO
      WHERE id_admin_esp_dep = $1
    `;
    const result = await pool.query(query, [id_admin_esp_dep]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar espacios deportivos por administrador: ' + error.message);
  }
}

async function createEspacio(nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_admin_esp_dep) {
  try {
    const query = `
      INSERT INTO ESPACIO_DEPORTIVO (nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, 
                                    imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_admin_esp_dep)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id_espacio, nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, 
                imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_admin_esp_dep
    `;
    const values = [nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, 
                    imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_admin_esp_dep];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear espacio deportivo: ' + error.message);
  }
}

async function updateEspacio(id, nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_admin_esp_dep) {
  try {
    const query = `
      UPDATE ESPACIO_DEPORTIVO
      SET nombre = COALESCE($1, nombre),
          direccion = COALESCE($2, direccion),
          descripcion = COALESCE($3, descripcion),
          latitud = COALESCE($4, latitud),
          longitud = COALESCE($5, longitud),
          horario_apertura = COALESCE($6, horario_apertura),
          horario_cierre = COALESCE($7, horario_cierre),
          imagen_principal = COALESCE($8, imagen_principal),
          imagen_sec_1 = COALESCE($9, imagen_sec_1),
          imagen_sec_2 = COALESCE($10, imagen_sec_2),
          imagen_sec_3 = COALESCE($11, imagen_sec_3),
          imagen_sec_4 = COALESCE($12, imagen_sec_4),
          id_admin_esp_dep = COALESCE($13, id_admin_esp_dep)
      WHERE id_espacio = $14
      RETURNING id_espacio, nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, 
                imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_admin_esp_dep
    `;
    const values = [nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, 
                    imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_admin_esp_dep, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar espacio deportivo: ' + error.message);
  }
}

async function deleteEspacio(id) {
  try {
    const query = `
      DELETE FROM ESPACIO_DEPORTIVO
      WHERE id_espacio = $1
      RETURNING id_espacio, nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, 
                imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_admin_esp_dep
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar espacio deportivo: ' + error.message);
  }
}

async function buscarEspaciosPorNombreODireccion(query) {
  try {
    const sql = `
      SELECT 
        id_espacio,
        nombre,
        direccion,
        descripcion,
        horario_apertura,
        horario_cierre,
        imagen_principal,
        id_admin_esp_dep
      FROM ESPACIO_DEPORTIVO
      WHERE LOWER(nombre) LIKE LOWER($1)
         OR LOWER(direccion) LIKE LOWER($1)
      ORDER BY nombre;
    `;
    
    const values = [`%${query}%`];
    const result = await pool.query(sql, values);

    return result.rows;
  } catch (error) {
    throw new Error('Error al buscar espacios deportivos: ' + error.message);
  }
}


// --- New Models ---

async function getEspaciosGeneral(limit = 12, offset = 0) {
  try {
    const query = `
      SELECT id_espacio, nombre, imagen_principal, direccion
      FROM ESPACIO_DEPORTIVO
      ORDER BY nombre
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar espacios deportivos generales: ' + error.message);
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

async function getEspaciosPorDisciplina(disciplina) {
  try {
    const query = `
      SELECT DISTINCT 
        e.id_espacio,
        e.nombre,
        e.direccion,
        e.descripcion,
        e.horario_apertura,
        e.horario_cierre,
        e.imagen_principal,
        e.id_admin_esp_dep
      FROM ESPACIO_DEPORTIVO e
      JOIN CANCHA c ON e.id_espacio = c.id_espacio
      JOIN SE_PRACTICA sp ON c.id_cancha = sp.id_cancha
      JOIN DISCIPLINA d ON sp.id_disciplina = d.id_disciplina
      WHERE LOWER(d.nombre) = LOWER($1)
      ORDER BY e.nombre;
    `;
    const result = await pool.query(query, [disciplina]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al buscar espacios por disciplina: ' + error.message);
  }
}


async function getCanchasDisponiblesPorEspacio(id) {
  try {
    const query = `
      SELECT 
        c.id_cancha,
        c.nombre,
        c.capacidad,
        COALESCE(
          json_agg(DISTINCT d.nombre) FILTER (WHERE d.id_disciplina IS NOT NULL),
          '[]'
        ) AS disciplinas
      FROM CANCHA c
      LEFT JOIN se_practica sp ON c.id_cancha = sp.id_cancha
      LEFT JOIN DISCIPLINA d ON sp.id_disciplina = d.id_disciplina
      WHERE c.id_espacio = $1
        AND c.estado = 'disponible'
      GROUP BY c.id_cancha, c.nombre, c.capacidad
      ORDER BY c.nombre;
    `;

    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar canchas disponibles: ' + error.message);
  }
}

// 🔹 Obtener coordenadas de una persona
async function getPersonaCoords(idPersona) {
  const query = `
    SELECT latitud, longitud
    FROM PERSONA
    WHERE id_persona = $1
  `;
  const result = await pool.query(query, [idPersona]);
  return result.rows[0];
}

// 🔹 Obtener espacios ordenados por cercanía
async function getEspaciosCercanos(latPersona, lonPersona, limit = 12, offset = 0) {
  const query = `
    SELECT 
      e.id_espacio,
      e.nombre,
      e.imagen_principal,
      e.direccion,
      e.latitud,
      e.longitud,
      (
        6371 * acos(
          cos(radians($1)) * cos(radians(e.latitud)) * cos(radians(e.longitud) - radians($2)) +
          sin(radians($1)) * sin(radians(e.latitud))
        )
      ) AS distancia_km
    FROM ESPACIO_DEPORTIVO e
    ORDER BY distancia_km ASC
    LIMIT $3 OFFSET $4
  `;
  const result = await pool.query(query, [latPersona, lonPersona, limit, offset]);
  return result.rows;
}

async function getAdminsEspDepModel() {
  const query = `
    SELECT aed.id_admin_esp_dep AS id, 
           TRIM(COALESCE(p.nombre, '') || ' ' || COALESCE(p.apellido, '')) AS nombre_completo
    FROM ADMIN_ESP_DEP aed
    INNER JOIN PERSONA p ON p.id_persona = aed.id_admin_esp_dep
    WHERE aed.estado = TRUE;
  `;
  const { rows } = await pool.query(query);
  return rows;
}

// --- Controladores ---
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

const response = (success, message, data = null) => ({
  success,
  message,
  data,
});

const imageFields = ['imagen_principal', 'imagen_sec_1', 'imagen_sec_2', 'imagen_sec_3', 'imagen_sec_4'];

async function validateImages(espacio) {
  for (const field of imageFields) {
    if (espacio[field]) {
      try {
        const filePath = path.join(__dirname, '../Uploads', espacio[field].replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
      } catch (error) {
        console.warn(`Imagen no encontrada para espacio ${espacio.id_espacio}, campo ${field}: ${espacio[field]}`);
        espacio[field] = null;
      }
    }
  }
  return espacio;
}

const listarEspacios = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const offset = parseInt(req.query.offset) || 0;

    const espacios = await getAllEspacios(limit, offset);

    const espaciosConImagenValidada = await Promise.all(
      espacios.map(async (espacio) => await validateImages(espacio))
    );

    const hasMore = espaciosConImagenValidada.length === limit;
    const dataResponse = {
      espacios: espaciosConImagenValidada,
      limit,
      offset,
      hasMore
    };

    let message = 'Lista de espacios deportivos obtenida';
    if (espaciosConImagenValidada.length === 0) {
      message = offset === 0 ? 'No hay espacios deportivos registrados' : 'No hay más espacios deportivos para mostrarse';
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, message, dataResponse));
  } catch (error) {
    console.error('Error al listar espacios deportivos:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerEspacioPorId = async (req, res) => {
  const { id } = req.params;

  try {
    let espacio = await getEspacioById(id);
    if (!espacio) {
      return res.status(404).json(response(false, 'Espacio deportivo no encontrado'));
    }
    espacio = await validateImages(espacio);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Espacio deportivo obtenido', espacio));
    console.log("Espacio obtenido según id ", id);
  } catch (error) {
    console.error('Error al obtener espacio deportivo por ID:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerEspaciosPorAdminId = async (req, res) => {
  const { id_admin_esp_dep } = req.params;

  try {
    const espacios = await getEspaciosByAdminId(id_admin_esp_dep);
    if (!espacios.length) {
      return res.status(404).json(response(false, 'No se encontraron espacios deportivos para este administrador'));
    }

    const espaciosConImagenValidada = await Promise.all(
      espacios.map(async (espacio) => await validateImages(espacio))
    );
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Espacios deportivos obtenidos', espaciosConImagenValidada));
  } catch (error) {
    console.error('Error al listar espacios deportivos por administrador:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearEspacio = async (req, res) => {
  const { nombre, direccion, descripcion, latitud: latInput, longitud: lonInput, horario_apertura, horario_cierre, id_admin_esp_dep } = req.body;

  // 🧹 Función auxiliar para limpiar archivos subidos si ocurre error
  const limpiarArchivos = async () => {
    if (req.files) {
      for (const field in req.files) {
        for (const file of req.files[field]) {
          await fs.unlink(file.path).catch(() => {});
        }
      }
    }
  };

  if (!nombre || !id_admin_esp_dep) {
    await limpiarArchivos();
    return res.status(400).json(response(false, 'Nombre e id_admin_esp_dep son obligatorios'));
  }

  try {
    // Verificar que id_admin_esp_dep existe en ADMIN_ESP_DEP
    const adminExistente = await pool.query(
      'SELECT id_admin_esp_dep FROM ADMIN_ESP_DEP WHERE id_admin_esp_dep = $1',
      [id_admin_esp_dep]
    );
    if (!adminExistente.rows[0]) {
      await limpiarArchivos();
      return res.status(404).json(response(false, 'Administrador no encontrado'));
    }

    // Rango aproximado de La Paz, Bolivia
    const LAT_MIN = -16.55, LAT_MAX = -16.25;
    const LON_MIN = -68.25, LON_MAX = -68.05;

    // Generar valores aleatorios si no se proporcionan
    const latitud = latInput !== undefined
      ? parseFloat(latInput)
      : parseFloat((Math.random() * (LAT_MAX - LAT_MIN) + LAT_MIN).toFixed(6));
    
    const longitud = lonInput !== undefined
      ? parseFloat(lonInput)
      : parseFloat((Math.random() * (LON_MAX - LON_MIN) + LON_MIN).toFixed(6));

    // Validar que latitud y longitud estén dentro del rango
    if (latitud < LAT_MIN || latitud > LAT_MAX) {
      await limpiarArchivos();
      return res.status(400).json(response(false, 'Latitud inválida. Debe estar dentro de La Paz, Bolivia'));
    }
    if (longitud < LON_MIN || longitud > LON_MAX) {
      await limpiarArchivos();
      return res.status(400).json(response(false, 'Longitud inválida. Debe estar dentro de La Paz, Bolivia'));
    }

    // Procesar imágenes
    const imagen_principal = req.files?.imagen_principal?.[0] ? `/Uploads/espacio/${req.files.imagen_principal[0].filename}` : null;
    const imagen_sec_1 = req.files?.imagen_sec_1?.[0] ? `/Uploads/espacio/${req.files.imagen_sec_1[0].filename}` : null;
    const imagen_sec_2 = req.files?.imagen_sec_2?.[0] ? `/Uploads/espacio/${req.files.imagen_sec_2[0].filename}` : null;
    const imagen_sec_3 = req.files?.imagen_sec_3?.[0] ? `/Uploads/espacio/${req.files.imagen_sec_3[0].filename}` : null;
    const imagen_sec_4 = req.files?.imagen_sec_4?.[0] ? `/Uploads/espacio/${req.files.imagen_sec_4[0].filename}` : null;

    const nuevoEspacio = await createEspacio(
      nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre,
      imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_admin_esp_dep
    );
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(201).json(response(true, 'Espacio deportivo creado exitosamente', nuevoEspacio));
    console.log("✅ Espacio creado exitosamente");

  } catch (error) {
    console.error('❌ Error al crear espacio deportivo:', error.message);
    await limpiarArchivos();
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};


const actualizarEspacio = async (req, res) => {
  const { id } = req.params;
  const { nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin_esp_dep } = req.body;

  try {
    const espacioExistente = await pool.query(
      'SELECT * FROM ESPACIO_DEPORTIVO WHERE id_espacio = $1',
      [id]
    );
    if (!espacioExistente.rows[0]) {
      return res.status(404).json(response(false, 'Espacio deportivo no encontrado'));
    }

    // Validar latitud y longitud si se proporcionan
    if (latitud && (latitud < -90 || latitud > 90)) {
      return res.status(400).json(response(false, 'Latitud inválida. Debe estar entre -90 y 90'));
    }
    if (longitud && (longitud < -180 || longitud > 180)) {
      return res.status(400).json(response(false, 'Longitud inválida. Debe estar entre -180 y 180'));
    }

    // Verificar que id_admin_esp_dep existe si se proporciona
    if (id_admin_esp_dep) {
      const adminExistente = await pool.query('SELECT id_admin_esp_dep FROM ADMIN_ESP_DEP WHERE id_admin_esp_dep = $1', [id_admin_esp_dep]);
      if (!adminExistente.rows[0]) {
        return res.status(404).json(response(false, 'Administrador no encontrado'));
      }
    }

    // Procesar imágenes
    let imagen_principal = espacioExistente.rows[0].imagen_principal;
    let imagen_sec_1 = espacioExistente.rows[0].imagen_sec_1;
    let imagen_sec_2 = espacioExistente.rows[0].imagen_sec_2;
    let imagen_sec_3 = espacioExistente.rows[0].imagen_sec_3;
    let imagen_sec_4 = espacioExistente.rows[0].imagen_sec_4;

    const oldPaths = {};

    if (req.files?.imagen_principal?.[0]) {
      imagen_principal = `/Uploads/espacio/${req.files.imagen_principal[0].filename}`;
      if (espacioExistente.rows[0].imagen_principal) {
        oldPaths.imagen_principal = path.join(__dirname, '../Uploads', espacioExistente.rows[0].imagen_principal.replace(/^\/*[uU]ploads\//, ''));
      }
    }

    if (req.files?.imagen_sec_1?.[0]) {
      imagen_sec_1 = `/Uploads/espacio/${req.files.imagen_sec_1[0].filename}`;
      if (espacioExistente.rows[0].imagen_sec_1) {
        oldPaths.imagen_sec_1 = path.join(__dirname, '../Uploads', espacioExistente.rows[0].imagen_sec_1.replace(/^\/*[uU]ploads\//, ''));
      }
    }

    if (req.files?.imagen_sec_2?.[0]) {
      imagen_sec_2 = `/Uploads/espacio/${req.files.imagen_sec_2[0].filename}`;
      if (espacioExistente.rows[0].imagen_sec_2) {
        oldPaths.imagen_sec_2 = path.join(__dirname, '../Uploads', espacioExistente.rows[0].imagen_sec_2.replace(/^\/*[uU]ploads\//, ''));
      }
    }

    if (req.files?.imagen_sec_3?.[0]) {
      imagen_sec_3 = `/Uploads/espacio/${req.files.imagen_sec_3[0].filename}`;
      if (espacioExistente.rows[0].imagen_sec_3) {
        oldPaths.imagen_sec_3 = path.join(__dirname, '../Uploads', espacioExistente.rows[0].imagen_sec_3.replace(/^\/*[uU]ploads\//, ''));
      }
    }

    if (req.files?.imagen_sec_4?.[0]) {
      imagen_sec_4 = `/Uploads/espacio/${req.files.imagen_sec_4[0].filename}`;
      if (espacioExistente.rows[0].imagen_sec_4) {
        oldPaths.imagen_sec_4 = path.join(__dirname, '../Uploads', espacioExistente.rows[0].imagen_sec_4.replace(/^\/*[uU]ploads\//, ''));
      }
    }

    const espacioActualizado = await updateEspacio(
      id,
      nombre !== undefined ? nombre : espacioExistente.rows[0].nombre,
      direccion !== undefined ? direccion : espacioExistente.rows[0].direccion,
      descripcion !== undefined ? descripcion : espacioExistente.rows[0].descripcion,
      latitud !== undefined ? latitud : espacioExistente.rows[0].latitud,
      longitud !== undefined ? longitud : espacioExistente.rows[0].longitud,
      horario_apertura !== undefined ? horario_apertura : espacioExistente.rows[0].horario_apertura,
      horario_cierre !== undefined ? horario_cierre : espacioExistente.rows[0].horario_cierre,
      imagen_principal,
      imagen_sec_1,
      imagen_sec_2,
      imagen_sec_3,
      imagen_sec_4,
      id_admin_esp_dep !== undefined ? id_admin_esp_dep : espacioExistente.rows[0].id_admin_esp_dep
    );

    // Eliminar imágenes antiguas
    for (const oldPath of Object.values(oldPaths)) {
      try {
        await fs.unlink(oldPath);
      } catch (error) {
        console.warn(`No se pudo eliminar la imagen antigua: ${oldPath}`);
      }
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Espacio deportivo actualizado exitosamente', espacioActualizado));
    console.log(`Espacio ${id} actualizado exitosamente`);
  } catch (error) {
    console.error('Error al actualizar espacio deportivo:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarEspacio = async (req, res) => {
  const { id } = req.params;

  try {
    const espacioEliminado = await deleteEspacio(id);
    if (!espacioEliminado) {
      return res.status(404).json(response(false, 'Espacio deportivo no encontrado'));
    }

    // Eliminar imágenes asociadas
    for (const field of imageFields) {
      if (espacioEliminado[field]) {
        try {
          const filePath = path.join(__dirname, '../Uploads', espacioEliminado[field].replace(/^\/*[uU]ploads\//, ''));
          await fs.unlink(filePath);
        } catch (error) {
          console.warn(`No se pudo eliminar la imagen: ${espacioEliminado[field]}`);
        }
      }
    }

    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Espacio deportivo eliminado exitosamente'));
    console.log("Espacio eliminado exitosamente ", espacioEliminado.nombre);
  } catch (error) {
    console.error('Error al eliminar espacio deportivo:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const buscarPorNombreODireccion = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === '') {
    return res.status(400).json({
      success: false,
      message: "Debe proporcionar un parámetro de búsqueda (?q=...)"
    });
  }

  try {
    const resultados = await buscarEspaciosPorNombreODireccion(q);

    if (!resultados.length) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron espacios con ese nombre o dirección"
      });
    }

    res.status(200).json({
      success: true,
      message: "Resultados de búsqueda obtenidos",
      data: resultados
    });
  } catch (error) {
    console.error("❌ Error en buscarPorNombreODireccion:", error.message);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

// --- New Controllers ---

async function listarEspaciosGeneral(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const offset = parseInt(req.query.offset) || 0;

    const espacios = await getEspaciosGeneral(limit, offset);

    let message = 'Lista de espacios deportivos obtenida';
    if (!espacios.length) {
      message = offset === 0 ? 'No hay espacios deportivos registrados' : 'No hay más espacios para mostrar';
    }

    res.status(200).json(response(true, message, {
      espacios,
      limit,
      offset,
      hasMore: espacios.length === limit
    }));
  } catch (error) {
    console.error('Error al listar espacios generales:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
}

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

async function buscarEspaciosPorDisciplina(req, res) {
  const { disciplina } = req.params;

  if (!disciplina || disciplina.trim() === '') {
    return res.status(400).json(response(false, 'Debe proporcionar una disciplina válida'));
  }

  try {
    const espacios = await getEspaciosPorDisciplina(disciplina);
    if (!espacios.length) {
      return res.status(404).json(response(false, `No se encontraron espacios para la disciplina: ${disciplina}`));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Espacios obtenidos por disciplina', espacios));
  } catch (error) {
    console.error('Error al buscar espacios por disciplina:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
}

async function listarCanchasDisponibles(req, res) {
  const { id } = req.params;

  try {
    const canchas = await getCanchasDisponiblesPorEspacio(id);
    if (!canchas.length) {
      return res.status(404).json(response(false, 'No se encontraron canchas disponibles para este espacio'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Canchas disponibles obtenidas', canchas));
  } catch (error) {
    console.error('Error al listar canchas disponibles:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
}

// 🔹 Listar espacios por cercanía a la persona del token
async function listarEspacioPersona(req, res) {
  try {
    const idPersona = req.user.id_persona; // ⚡ del token
    const limit = parseInt(req.query.limit) || 12;
    const offset = parseInt(req.query.offset) || 0;

    // 1️⃣ Coordenadas de la persona
    const persona = await getPersonaCoords(idPersona);
    if (!persona) {
      return res.status(404).json(response(false, "Persona no encontrada"));
    }

    const { latitud, longitud } = persona;
    if (!latitud || !longitud) {
      return res.status(400).json(response(false, "La persona no tiene coordenadas registradas"));
    }

    // 2️⃣ Espacios cercanos
    const espacios = await getEspaciosCercanos(latitud, longitud, limit, offset);

    const dataResponse = {
      espacios,
      limit,
      offset,
      hasMore: espacios.length === limit
    };

    res.status(200).json(response(true, "Espacios ordenados por cercanía obtenidos", dataResponse));

  } catch (error) {
    console.error("❌ Error en listarEspacioPersona:", error.message);
    res.status(500).json(response(false, "Error interno del servidor"));
  }
}

async function getAdminsEspDepController(req, res) {
  try {
    const admins = await getAdminsEspDepModel();
    res.json({
      success: true,
      message: "Lista de administradores deportivos obtenida",
      data: admins,
    });
  } catch (error) {
    console.error("❌ Error al obtener admins:", error.message);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
}

const router = express.Router();

const espacioFieldConfigs = [
  { name: 'imagen_principal', maxCount: 1 },
  { name: 'imagen_sec_1', maxCount: 1 },
  { name: 'imagen_sec_2', maxCount: 1 },
  { name: 'imagen_sec_3', maxCount: 1 },
  { name: 'imagen_sec_4', maxCount: 1 }
];

//-------- Rutas --------- 
//------------------------
//------------------------

router.post('/', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP']), handleMultipleUpload('espacio', espacioFieldConfigs), crearEspacio);


router.get('/id/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerEspacioPorId);

router.get('/datos-total', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), listarEspacios);
router.get('/espacios-general', listarEspaciosGeneral);
router.get('/buscar-nombre-direccion', buscarPorNombreODireccion);
router.get('/filtro-deportes', listarDisciplinasUnicas);
router.get('/buscar-espacio/:disciplina', buscarEspaciosPorDisciplina);

router.get('/admin-esp-dep/:id_admin_esp_dep', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP']), obtenerEspaciosPorAdminId);

router.get('/canchas-disponibles-por-espacio/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), listarCanchasDisponibles);
router.get('/espacio-persona', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), listarEspacioPersona);
router.get('/admin-unicos', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), getAdminsEspDepController);

router.patch('/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP']), handleMultipleUpload('espacio', espacioFieldConfigs), actualizarEspacio);
router.delete('/:id', verifyToken, checkRole(['ADMINISTRADOR', 'ADMIN_ESP_DEP']), eliminarEspacio);

module.exports = router;