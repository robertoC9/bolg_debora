// Importa el Router de Express para crear rutas modulares
const { Router } = require('express');
// Importa bcryptjs para encriptar y comparar contraseñas de forma segura
const bcrypt = require('bcryptjs');
// Importa jsonwebtoken para generar y verificar tokens JWT
const jwt = require('jsonwebtoken');
// Importa el pool de conexiones a PostgreSQL
const pool = require('../config/database');
// Importa los middlewares de autenticación y verificación de admin
const { authenticate, requireAdmin } = require('../middleware/auth');

// Crea una instancia del Router de Express
const router = Router();

// POST /api/auth/login — Inicia sesión con email y contraseña
router.post('/login', async (req, res) => {
  try {
    // Extrae email y password del cuerpo de la petición
    const { email, password } = req.body;

    // Si falta email o password, responde con error 400
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Busca el usuario en la base de datos por email
    const { rows } = await pool.query(
      'SELECT id, nombre, email, password_hash, rol FROM usuarios WHERE email = $1',
      [email]
    );

    // Si no se encuentra ningún usuario, responde con error 401
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Toma el primer usuario encontrado
    const user = rows[0];
    // Compara la contraseña proporcionada con el hash almacenado usando bcrypt
    const valid = await bcrypt.compare(password, user.password_hash);

    // Si la contraseña no coincide, responde con error 401
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Genera un token JWT con id, email y rol del usuario
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,                               // Clave secreta desde .env
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }     // Tiempo de expiración (7 días por defecto)
    );

    // Responde con el token y los datos del usuario (sin password_hash)
    res.json({
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (err) {
    // Si ocurre un error, lo muestra en consola y responde con error 500
    console.error('[auth] login error:', err.message);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// POST /api/auth/register — Registra un nuevo usuario admin
// En producción, deshabilitar o proteger con otra capa de seguridad
router.post('/register', async (req, res) => {
  try {
    // Extrae nombre, email y password del cuerpo de la petición
    const { nombre, email, password } = req.body;

    // Si falta algún campo requerido, responde con error 400
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    // Valida que la contraseña tenga al menos 6 caracteres
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verifica si ya existe un usuario con ese email en la base de datos
    const { rows: existing } = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1', [email]
    );
    // Si ya existe, responde con error 409 (conflicto)
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Encripta la contraseña con bcrypt usando 12 rondas de sal
    const passwordHash = await bcrypt.hash(password, 12);

    // Inserta el nuevo usuario en la base de datos con rol 'admin'
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, 'admin')
       RETURNING id, nombre, email, rol`,
      [nombre, email, passwordHash]
    );

    // Genera un token JWT para el nuevo usuario
    const token = jwt.sign(
      { id: rows[0].id, email: rows[0].email, rol: rows[0].rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Responde con código 201 (creado), el token y los datos del usuario
    res.status(201).json({
      token,
      usuario: rows[0],
    });
  } catch (err) {
    // Si ocurre un error, lo muestra en consola y responde con error 500
    console.error('[auth] register error:', err.message);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// GET /api/auth/me — Devuelve el perfil del usuario autenticado
router.get('/me', authenticate, async (req, res) => {
  try {
    // Busca el usuario en la base de datos usando el id del token
    const { rows } = await pool.query(
      'SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = $1',
      [req.user.id]
    );
    // Si no se encuentra, responde con error 404
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    // Responde con los datos del usuario
    res.json(rows[0]);
  } catch (err) {
    // Si ocurre un error, lo muestra en consola y responde con error 500
    console.error('[auth] me error:', err.message);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// Exporta el router para montarlo en el servidor principal
module.exports = router;
