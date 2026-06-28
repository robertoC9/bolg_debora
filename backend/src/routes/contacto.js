// Importa el Router de Express para crear rutas modulares
const { Router } = require('express');
// Importa el pool de conexiones a PostgreSQL
const pool = require('../config/database');

// Crea una instancia del Router de Express
const router = Router();

// POST /api/contacto — Guarda un mensaje de contacto en la base de datos
router.post('/', async (req, res) => {
  try {
    // Extrae nombre, email y mensaje del cuerpo de la petición
    const { nombre, email, mensaje } = req.body;

    // Si falta algún campo requerido, responde con error 400
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ error: 'Nombre, email y mensaje son requeridos' });
    }

    // Inserta el mensaje en la tabla configuracion usando una clave compuesta
    await pool.query(
      `INSERT INTO configuracion (clave, valor)
       VALUES ('contacto_' || $1 || '_' || NOW(), $2)`,
      [
        nombre.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),  // Limpia el nombre para usarlo en la clave
        JSON.stringify({ nombre, email, mensaje, fecha: new Date().toISOString() }), // Guarda todo como JSON
      ]
    );

    // Responde con un mensaje de confirmación
    res.status(201).json({ mensaje: 'Mensaje recibido. Gracias por contactarme.' });
  } catch (err) {
    // Si ocurre un error, lo muestra en consola y responde con error 500
    console.error('[contacto] POST error:', err.message);
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
});

// Exporta el router para montarlo en el servidor principal
module.exports = router;
