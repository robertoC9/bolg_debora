// Importa la librería jsonwebtoken para crear y verificar tokens JWT
const jwt = require('jsonwebtoken');

// Middleware que verifica que el usuario tenga un token JWT válido en el header Authorization
function authenticate(req, res, next) {
  // Obtiene el header Authorization de la petición
  const header = req.headers.authorization;
  // Si no hay header o no empieza con "Bearer ", responde con error 401
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  // Extrae solo el token quitando la palabra "Bearer "
  const token = header.split(' ')[1];

  try {
    // Verifica el token usando la clave secreta del archivo .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Guarda los datos decodificados del token en req.user (id, email, rol)
    req.user = decoded;
    // Continúa con el siguiente middleware o controlador
    next();
  } catch (err) {
    // Si el token es inválido o expiró, responde con error 401
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Middleware que verifica que el usuario autenticado tenga rol de admin
function requireAdmin(req, res, next) {
  // Si no hay usuario en la petición o su rol no es 'admin', responde con error 403
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso no autorizado (se requiere admin)' });
  }
  // Si es admin, continúa con el siguiente middleware o controlador
  next();
}

// Exporta ambos middlewares para usarlos en las rutas protegidas
module.exports = { authenticate, requireAdmin };
