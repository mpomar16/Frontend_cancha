const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const handleUpload = (folder, fieldName = 'imagen') => {
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
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  });

  // Filtro para aceptar solo imágenes
  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/; // ampliable
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido (solo jpeg, jpg, png, pdf)'));
    }
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });

  // Middleware dinámico
  return (req, res, next) => {
    upload.single(fieldName)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      try {
        await next();
      } catch (error) {
        if (req.file) {
          const filePath = path.join(__dirname, '../Uploads', folder, req.file.filename);
          try {
            await fs.unlink(filePath);
            console.log(`Archivo eliminado: ${filePath}`);
          } catch (unlinkError) {
            console.warn(`No se pudo eliminar el archivo: ${filePath}`, unlinkError);
          }
        }
        next(error);
      }
    });
  };
};

module.exports = { handleUpload };
