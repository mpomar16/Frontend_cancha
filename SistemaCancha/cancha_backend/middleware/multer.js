const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

// Configura multer para manejar la subida de archivos
const createUpload = (fieldName = 'imagen') => {
  const storage = multer.memoryStorage(); // Guardar archivo en memoria

  const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.jpeg', '.jpg', '.png', '.webp', '.gif'];
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    const fileExt = path.extname(file.originalname).toLowerCase();
    const fileMime = file.mimetype;

    if (!allowedExtensions.includes(fileExt))
      return cb(new Error(`Extensión no permitida: ${fileExt}`));

    if (!allowedMimes.includes(fileMime))
      return cb(new Error(`Tipo MIME no permitido: ${fileMime}`));

    cb(null, true);
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  }).single(fieldName);

  // Envolvemos en Promesa y validamos que exista archivo
  return (req, res) =>
    new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) return reject(err);
        // ✅ Validación central: archivo obligatorio
        if (!req.file) {
          return reject(new Error("Debe enviar una imagen"));
        }
        resolve(req.file);
      });
    });
};

// =========================
// processImage separado
// =========================
const processImage = (folder = 'sin_ruta') => {
  return async (req, baseName) => {
    if (!req.file) return null; 

    try {
      const uploadPath = path.join(__dirname, '../Uploads', folder);
      await fs.mkdir(uploadPath, { recursive: true });

      // Usar baseName proporcionado, con sanitización
      const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_') || 'user';
      const ext = '.jpg'; // Forzar extensión a .jpg ya que usamos sharp para convertir
      const now = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
      const random = Math.floor(Math.random() * 90000 + 10000);
      const filename = `${sanitizedBaseName}-${now}-${random}${ext}`;
      const filePath = path.join(uploadPath, filename);

      // Redimensionar imagen a máximo 800x800 con Sharp
      await sharp(req.file.buffer)
        .resize(800, 800, { fit: 'inside' }) // Redimensiona manteniendo proporción
        .jpeg({ quality: 80 }) // Convierte a JPEG con calidad 80%
        .toFile(filePath); // Guardar con extensión .jpg

      // ✅ Devolver solo la ruta pública
      return `/Uploads/${folder}/${filename}`;

      } catch (error) {
      throw new Error(`Error al procesar la imagen: ${error.message}`);
    }
  };
};

// =========================
// unlinkFile: eliminar archivo de disco
// =========================
const unlinkFile = async (filePath) => {
  if (!filePath) return;
  try {
    const absolutePath = path.resolve(__dirname, "..", "." + filePath);
    await fs.unlink(absolutePath);
    console.log("🧹 Archivo eliminado:", absolutePath);
  } catch (err) {
    console.warn("⚠️ No se pudo eliminar el archivo:", err.message);
  }
};

// =========================
// Función combinada: Subida + Procesamiento
// =========================
const createUploadAndProcess = (fieldName = 'imagen', folder = 'sin_ruta', baseName = 'user') => {
  return async (req, res) => {
    await createUpload(fieldName)(req, res);        // valida y sube
    return await processImage(folder)(req, baseName); // procesa y devuelve ruta
  };
};

module.exports = { createUpload, processImage, createUploadAndProcess, unlinkFile};
