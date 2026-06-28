// Carga las variables de entorno desde el archivo .env ubicado en la carpeta padre del directorio actual
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

// Importa el framework Express para crear el servidor web
const express = require('express');
// Importa el paquete CORS para permitir peticiones desde otros dominios
const cors = require('cors');

// Crea una instancia de la aplicación Express
const app = express();

// ============================
//  Middleware global
// ============================
// Configura CORS: permite peticiones desde FRONTEND_URL o cualquier origen si no está definido
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Middleware para parsear JSON en el body de las peticiones, con límite de 10 MB
app.use(express.json({ limit: '10mb' }));
// Middleware para parsear datos URL-encoded (formularios tradicionales)
app.use(express.urlencoded({ extended: true }));

// ============================
//  Rutas
// ============================
// Monta las rutas de historias en /api/historias
app.use('/api/historias', require('./routes/historias'));
// Monta las rutas de reflexiones en /api/reflexiones
app.use('/api/reflexiones', require('./routes/reflexiones'));
// Monta las rutas de fotos en /api/fotos
app.use('/api/fotos', require('./routes/fotos'));
// Monta las rutas de autenticación en /api/auth
app.use('/api/auth', require('./routes/auth'));
// Monta las rutas de contacto en /api/contacto
app.use('/api/contacto', require('./routes/contacto'));

// ============================
//  Health check
// ============================
// Endpoint GET /api/health para verificar que el servidor está funcionando
app.get('/api/health', (_req, res) => {
  // Responde con estado "ok" y la marca de tiempo actual
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================
//  404
// ============================
// Middleware para rutas no encontradas — se ejecuta si ninguna ruta anterior coincidió
app.use((_req, res) => {
  // Responde con código 404 y mensaje de error
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ============================
//  Error handler
// ============================
// Middleware global de errores — recibe cualquier error que ocurra en la cadena de middlewares
app.use((err, _req, res, _next) => {
  // Imprime el error en la consola del servidor
  console.error('[Server] Error no manejado:', err);
  // Usa el código de estado del error o 500 por defecto
  const status = err.status || 500;
  // Responde con el mensaje de error o uno genérico
  res.status(status).json({
    error: err.message || 'Error interno del servidor',
  });
});

// ============================
//  Inicio
// ============================
// Define el puerto: usa la variable de entorno PORT o 3001 por defecto
const PORT = process.env.PORT || 3001;

// Inicia el servidor y escucha en el puerto especificado
app.listen(PORT, () => {
  // Muestra un mensaje en consola indicando que la API está corriendo
  console.log(`[Server] Blog API corriendo en puerto ${PORT}`);
  // Muestra la URL del frontend permitida por CORS
  console.log(`[Server] Frontend CORS: ${process.env.FRONTEND_URL || '*'}`);
});

// Exporta la aplicación para usarla en tests o como módulo
module.exports = app;
