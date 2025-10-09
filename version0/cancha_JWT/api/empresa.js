// empresaRoutes.js
const express = require('express');
const { verifyToken, checkRole } = require('../middleware/auth');
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

async function getNombreParaArchivo(req, defaultFolder) {
  let nombreParaArchivo = 'empresa';

  // Si se envió un nombre_sistema en el body, usarlo
  if (req.body?.nombre_sistema) {
    nombreParaArchivo = req.body.nombre_sistema;
  }
  // Si no, y estamos haciendo PATCH (tiene params.id), buscar el nombre_sistema actual en DB
  else if (req.params?.id) {
    try {
      const empresa = await pool.query(
        'SELECT nombre_sistema FROM EMPRESA WHERE id_empresa = $1',
        [req.params.id]
      );
      if (empresa.rows[0]?.nombre_sistema) {
        nombreParaArchivo = empresa.rows[0].nombre_sistema;
      }
    } catch (error) {
      console.warn('No se pudo obtener nombre_sistema para archivo:', error.message);
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

      const empresaNombre = await getNombreParaArchivo(req, 'empresa'); // ✅ aquí extrae de DB si es PATCH
      const ext = path.extname(file.originalname).toLowerCase();

      cb(null, `${empresaNombre}-${fecha}-${hora}-${random3}${ext}`);
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

async function getEmpresaById(id) {
  try {
    const query = `
      SELECT 
        id_empresa,
        fecha_registrado,
        logo_imagen,
        nombre_sistema,
        titulo_h1,
        descripcion_h1,
        te_ofrecemos,
        imagen_hero,
        imagen_1,
        imagen_2,
        imagen_3,
        titulo_1,
        titulo_2,
        titulo_3,
        descripcion_1,
        descripcion_2,
        descripcion_3,
        mision,
        vision,
        nuestro_objetivo,
        objetivo_1,
        objetivo_2,
        objetivo_3,
        quienes_somos,
        correo_empresa,
        telefono,
        direccion,
        id_administrador
      FROM EMPRESA
      WHERE id_empresa = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener empresa por ID: ' + error.message);
  }
}

async function getEmpresaBody() {
  try {
    const query = `
      SELECT 
        id_empresa,
        fecha_registrado,
        logo_imagen,
        nombre_sistema,
        titulo_h1,
        descripcion_h1,
        te_ofrecemos,
        imagen_hero,
        imagen_1,
        imagen_2,
        imagen_3,
        titulo_1,
        titulo_2,
        titulo_3,
        descripcion_1,
        descripcion_2,
        descripcion_3,
        mision,
        vision,
        nuestro_objetivo,
        objetivo_1,
        objetivo_2,
        objetivo_3,
        id_administrador
      FROM EMPRESA
      LIMIT 1  -- Asumiendo que hay solo una empresa principal
    `;
    const result = await pool.query(query);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener datos del body de la empresa: ' + error.message);
  }
}

async function getEmpresaFooter() {
  try {
    const query = `
      SELECT 
        quienes_somos,
        correo_empresa,
        telefono,
        direccion,
        logo_imagen,
        nombre_sistema
      FROM EMPRESA
      LIMIT 1  -- Asumiendo que hay solo una empresa principal
    `;
    const result = await pool.query(query);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener datos del footer de la empresa: ' + error.message);
  }
}

async function updateEmpresa(id, logo_imagen, nombre_sistema, titulo_h1, descripcion_h1, te_ofrecemos, imagen_hero, imagen_1, imagen_2, imagen_3, titulo_1, titulo_2, titulo_3, descripcion_1, descripcion_2, descripcion_3, mision, vision, nuestro_objetivo, objetivo_1, objetivo_2, objetivo_3, quienes_somos, correo_empresa, telefono, direccion, id_administrador) {
  try {
    const query = `
      UPDATE EMPRESA
      SET logo_imagen = COALESCE($1, logo_imagen),
          nombre_sistema = COALESCE($2, nombre_sistema),
          titulo_h1 = COALESCE($3, titulo_h1),
          descripcion_h1 = COALESCE($4, descripcion_h1),
          te_ofrecemos = COALESCE($5, te_ofrecemos),
          imagen_hero = COALESCE($6, imagen_1),
          imagen_1 = COALESCE($7, imagen_1),
          imagen_2 = COALESCE($8, imagen_2),
          imagen_3 = COALESCE($9, imagen_3),
          titulo_1 = COALESCE($10, titulo_1),
          titulo_2 = COALESCE($11, titulo_2),
          titulo_3 = COALESCE($12, titulo_3),
          descripcion_1 = COALESCE($13, descripcion_1),
          descripcion_2 = COALESCE($14, descripcion_2),
          descripcion_3 = COALESCE($15, descripcion_3),
          mision = COALESCE($16, mision),
          vision = COALESCE($17, vision),
          nuestro_objetivo = COALESCE($18, nuestro_objetivo),
          objetivo_1 = COALESCE($19, objetivo_1),
          objetivo_2 = COALESCE($20, objetivo_2),
          objetivo_3 = COALESCE($21, objetivo_3),
          quienes_somos = COALESCE($22, quienes_somos),
          correo_empresa = COALESCE($23, correo_empresa),
          telefono = COALESCE($24, telefono),
          direccion = COALESCE($25, direccion),
          id_administrador = COALESCE($26, id_administrador)
      WHERE id_empresa = $27
      RETURNING id_empresa, fecha_registrado, logo_imagen, nombre_sistema, titulo_h1, descripcion_h1, te_ofrecemos, imagen_hero, imagen_1, imagen_2, imagen_3, titulo_1, titulo_2, titulo_3, descripcion_1, descripcion_2, descripcion_3, mision, vision, nuestro_objetivo, objetivo_1, objetivo_2, objetivo_3, quienes_somos, correo_empresa, telefono, direccion, id_administrador
    `;
    const values = [logo_imagen, nombre_sistema, titulo_h1, descripcion_h1, te_ofrecemos, imagen_hero, imagen_1, imagen_2, imagen_3, titulo_1, titulo_2, titulo_3, descripcion_1, descripcion_2, descripcion_3, mision, vision, nuestro_objetivo, objetivo_1, objetivo_2, objetivo_3, quienes_somos, correo_empresa, telefono, direccion, id_administrador, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar empresa: ' + error.message);
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

const imageFields = ['logo_imagen', 'imagen_hero', 'imagen_1', 'imagen_2', 'imagen_3'];

async function validateImages(empresa) {
  for (const field of imageFields) {
    if (empresa[field]) {
      try {
        const filePath = path.join(__dirname, '../Uploads', empresa[field].replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
      } catch (error) {
        console.warn(`Imagen no encontrada para empresa ${empresa.id_empresa}, campo ${field}: ${empresa[field]}`);
        empresa[field] = null;
      }
    }
  }
  return empresa;
}

const obtenerEmpresaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    let empresa = await getEmpresaById(id);
    if (!empresa) {
      return res.status(404).json(response(false, 'Empresa no encontrada'));
    }
    empresa = await validateImages(empresa);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Empresa obtenida', empresa));
  } catch (error) {
    console.error('Error al obtener empresa por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerEmpresaBody = async (req, res) => {
  try {
    let bodyData = await getEmpresaBody();
    if (!bodyData) {
      return res.status(404).json(response(false, 'Datos del body de la empresa no encontrados'));
    }
    bodyData = await validateImages(bodyData);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Datos del body de la empresa obtenidos', bodyData));
  } catch (error) {
    console.error('Error al obtener datos del body de la empresa:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerEmpresaFooter = async (req, res) => {
  try {
    const footerData = await getEmpresaFooter();
    if (!footerData) {
      return res.status(404).json(response(false, 'Datos del footer de la empresa no encontrados'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Datos del footer de la empresa obtenidos', footerData));
  } catch (error) {
    console.error('Error al obtener datos del footer de la empresa:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarEmpresa = async (req, res) => {
  const { id } = req.params;
  const { nombre_sistema, titulo_h1, descripcion_h1, te_ofrecemos, titulo_1, titulo_2, titulo_3, descripcion_1, descripcion_2, descripcion_3, mision, vision, nuestro_objetivo, objetivo_1, objetivo_2, objetivo_3, quienes_somos, correo_empresa, telefono, direccion, id_administrador } = req.body;

  try {
    const empresaExistente = await pool.query(
      'SELECT * FROM EMPRESA WHERE id_empresa = $1',
      [id]
    );
    if (!empresaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Empresa no encontrada'));
    }

    // Verificar que id_administrador existe si se proporciona
    if (id_administrador) {
      const adminExistente = await pool.query('SELECT id_administrador FROM ADMINISTRADOR WHERE id_administrador = $1', [id_administrador]);
      if (!adminExistente.rows[0]) {
        return res.status(404).json(response(false, 'Administrador no encontrado'));
      }
    }

    // Validar correo_empresa único si se proporciona
    if (correo_empresa) {
      const correoExistente = await pool.query('SELECT id_empresa FROM EMPRESA WHERE correo_empresa = $1 AND id_empresa != $2', [correo_empresa, id]);
      if (correoExistente.rows[0]) {
        return res.status(400).json(response(false, 'El correo de la empresa ya está registrado'));
      }
    }

    // Procesar imágenes
    let logo_imagen = empresaExistente.rows[0].logo_imagen;
    let imagen_hero = empresaExistente.rows[0].imagen_hero;
    let imagen_1 = empresaExistente.rows[0].imagen_1;
    let imagen_2 = empresaExistente.rows[0].imagen_2;
    let imagen_3 = empresaExistente.rows[0].imagen_3;

    const oldPaths = {};

    if (req.files?.logo_imagen?.[0]) {
      logo_imagen = `/Uploads/empresa/${req.files.logo_imagen[0].filename}`;
      if (empresaExistente.rows[0].logo_imagen) {
        oldPaths.logo_imagen = path.join(__dirname, '../Uploads', empresaExistente.rows[0].logo_imagen.replace(/^\/*[uU]ploads\//, ''));
      }
    }

    if (req.files?.imagen_hero?.[0]) {
      imagen_hero = `/Uploads/empresa/${req.files.imagen_hero[0].filename}`;
      if (empresaExistente.rows[0].imagen_hero) {
        oldPaths.imagen_hero = path.join(__dirname, '../Uploads', empresaExistente.rows[0].imagen_hero.replace(/^\/*[uU]ploads\//, ''));
      }
    }

    if (req.files?.imagen_1?.[0]) {
      imagen_1 = `/Uploads/empresa/${req.files.imagen_1[0].filename}`;
      if (empresaExistente.rows[0].imagen_1) {
        oldPaths.imagen_1 = path.join(__dirname, '../Uploads', empresaExistente.rows[0].imagen_1.replace(/^\/*[uU]ploads\//, ''));
      }
    }

    if (req.files?.imagen_2?.[0]) {
      imagen_2 = `/Uploads/empresa/${req.files.imagen_2[0].filename}`;
      if (empresaExistente.rows[0].imagen_2) {
        oldPaths.imagen_2 = path.join(__dirname, '../Uploads', empresaExistente.rows[0].imagen_2.replace(/^\/*[uU]ploads\//, ''));
      }
    }

    if (req.files?.imagen_3?.[0]) {
      imagen_3 = `/Uploads/empresa/${req.files.imagen_3[0].filename}`;
      if (empresaExistente.rows[0].imagen_3) {
        oldPaths.imagen_3 = path.join(__dirname, '../Uploads', empresaExistente.rows[0].imagen_3.replace(/^\/*[uU]ploads\//, ''));
      }
    }

    const empresaActualizada = await updateEmpresa(
      id,
      logo_imagen,
      nombre_sistema,
      titulo_h1,
      descripcion_h1,
      te_ofrecemos,
      imagen_hero,
      imagen_1,
      imagen_2,
      imagen_3,
      titulo_1,
      titulo_2,
      titulo_3,
      descripcion_1,
      descripcion_2,
      descripcion_3,
      mision,
      vision,
      nuestro_objetivo,
      objetivo_1,
      objetivo_2,
      objetivo_3,
      quienes_somos,
      correo_empresa,
      telefono,
      direccion,
      id_administrador
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
    res.status(200).json(response(true, 'Empresa actualizada exitosamente', empresaActualizada));
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

// --- Rutas ---

const router = express.Router();

const empresaFieldConfigs = [
  { name: 'logo_imagen', maxCount: 1 },
  { name: 'imagen_hero', maxCount: 1 },
  { name: 'imagen_1', maxCount: 1 },
  { name: 'imagen_2', maxCount: 1 },
  { name: 'imagen_3', maxCount: 1 }
];

// Aplicar middleware de upload a POST y PATCH
router.patch('/:id', verifyToken, checkRole(['ADMINISTRADOR']), handleMultipleUpload('empresa', empresaFieldConfigs), actualizarEmpresa);

router.get('/body', obtenerEmpresaBody);
router.get('/footer', obtenerEmpresaFooter);

router.get('/id/:id', verifyToken, obtenerEmpresaPorId);

module.exports = router;