// Importa Multer, middleware para manejar la subida de archivos en Express
const multer = require('multer');
// Importa la configuración de almacenamiento de Cloudinary desde el archivo de configuración
const { storage } = require('../config/cloudinary');

// Crea y configura una instancia de Multer con almacenamiento en Cloudinary
const upload = multer({
  storage,                                    // Usa el almacenamiento de Cloudinary configurado
  limits: { fileSize: 10 * 1024 * 1024 },     // Límite de tamaño: 10 MB por archivo
  // Filtro para validar el tipo MIME del archivo subido
  fileFilter: (_req, file, cb) => {
    // Lista de tipos MIME permitidos (imágenes)
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    // Si el tipo del archivo está en la lista, lo acepta
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // Si no es un formato permitido, rechaza con un error
      cb(new Error('Formato no permitido. Usa JPG, PNG, GIF o WebP.'));
    }
  },
});

// Exporta el middleware de subida para usarlo en las rutas
module.exports = upload;
