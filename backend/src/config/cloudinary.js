// Importa la versión 2 del SDK de Cloudinary para subir y manipular imágenes en la nube
const cloudinary = require('cloudinary').v2;
// Importa el almacenamiento de Cloudinary para Multer, que permite subir archivos directo a Cloudinary
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configura la conexión con Cloudinary usando las credenciales desde variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Crea una instancia de almacenamiento de Cloudinary para usar con Multer
const storage = new CloudinaryStorage({
  cloudinary,                              // Instancia de Cloudinary configurada
  params: {
    folder: 'debbie-blog',                 // Carpeta donde se guardarán las imágenes en Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'], // Formatos de imagen permitidos
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }], // Redimensiona y optimiza
  },
});

// Exporta la instancia de cloudinary y el storage para usarlos en otros módulos
module.exports = { cloudinary, storage };
