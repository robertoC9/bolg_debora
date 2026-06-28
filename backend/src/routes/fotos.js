// Importa el Router de Express para crear rutas modulares
const { Router } = require('express');
// Importa el pool de conexiones a PostgreSQL
const pool = require('../config/database');
// Importa el middleware de subida de archivos (Multer + Cloudinary)
const upload = require('../middleware/upload');
// Importa los middlewares de autenticación y verificación de admin
const { authenticate, requireAdmin } = require('../middleware/auth');
// Importa la instancia de Cloudinary para eliminar imágenes
const { cloudinary } = require('../config/cloudinary');

// Crea una instancia del Router de Express
const router = Router();

// GET /api/fotos — públicas, activas, ordenadas
router.get('/', async (_req, res) => {
  try {
    // Consulta las fotos donde activa es TRUE, ordenadas por orden y luego por id
    const { rows } = await pool.query(
      'SELECT id, titulo, descripcion, url, orden FROM fotos WHERE activa = TRUE ORDER BY orden ASC, id ASC'
    );
    // Responde con el listado de fotos
    res.json(rows);
  } catch (err) {
    // Si ocurre un error, lo muestra en consola y responde con error 500
    console.error('[fotos] GET error:', err.message);
    res.status(500).json({ error: 'Error al cargar fotos' });
  }
});

// GET /api/fotos/:id — Devuelve una foto específica por su ID
router.get('/:id', async (req, res) => {
  try {
    // Busca la foto por id y que esté activa
    const { rows } = await pool.query(
      'SELECT id, titulo, descripcion, url, orden FROM fotos WHERE id = $1 AND activa = TRUE',
      [req.params.id]
    );
    // Si no se encuentra, responde con error 404
    if (rows.length === 0) return res.status(404).json({ error: 'Foto no encontrada' });
    // Responde con los datos de la foto
    res.json(rows[0]);
  } catch (err) {
    // Si ocurre un error, lo muestra en consola y responde con error 500
    console.error('[fotos] GET/:id error:', err.message);
    res.status(500).json({ error: 'Error al cargar la foto' });
  }
});

// POST /api/fotos — Crea una nueva foto (solo admin)
router.post('/', authenticate, requireAdmin, upload.single('imagen'), async (req, res) => {
  try {
    // Si no se subió ninguna imagen, responde con error 400
    if (!req.file) return res.status(400).json({ error: 'Debes subir una imagen' });

    // Extrae titulo, descripcion y orden del cuerpo de la petición
    const { titulo, descripcion, orden } = req.body;

    // Inserta la foto en la base de datos con los datos de Cloudinary
    const { rows } = await pool.query(
      `INSERT INTO fotos (titulo, descripcion, url, public_id, orden)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, titulo, descripcion, url, orden`,
      [titulo || null, descripcion || null, req.file.path, req.file.filename, orden || 0]
    );

    // Responde con código 201 y los datos de la foto creada
    res.status(201).json(rows[0]);
  } catch (err) {
    // Si ocurre un error, lo muestra en consola y responde con error 500
    console.error('[fotos] POST error:', err.message);
    res.status(500).json({ error: 'Error al subir la foto' });
  }
});

// PUT /api/fotos/:id — Actualiza los metadatos de una foto (solo admin)
router.put('/:id', authenticate, requireAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const id = req.params.id;
    // Extrae titulo, descripcion y orden del cuerpo de la petición
    const { titulo, descripcion, orden } = req.body;

    // Obtiene la foto actual para conocer su public_id en Cloudinary
    const { rows: existing } = await pool.query(
      'SELECT public_id FROM fotos WHERE id = $1', [id]
    );
    // Si no se encuentra, responde con error 404
    if (existing.length === 0) return res.status(404).json({ error: 'Foto no encontrada' });

    let url = null;
    let publicId = null;

    // Si se subió una nueva imagen, actualiza URL y public_id
    if (req.file) {
      url = req.file.path;
      publicId = req.file.filename;
      // Elimina la imagen anterior de Cloudinary (ignora error si falla)
      if (existing[0].public_id) {
        await cloudinary.uploader.destroy(existing[0].public_id).catch(() => {});
      }
    }

    // Actualiza los campos en la base de datos usando COALESCE para mantener valores existentes
    const { rows } = await pool.query(
      `UPDATE fotos SET
        titulo = COALESCE($1, titulo),
        descripcion = COALESCE($2, descripcion),
        url = COALESCE($3, url),
        public_id = COALESCE($4, public_id),
        orden = COALESCE($5, orden)
       WHERE id = $6
       RETURNING id, titulo, descripcion, url, orden`,
      [titulo || null, descripcion || null, url, publicId, orden || null, id]
    );

    // Responde con los datos actualizados de la foto
    res.json(rows[0]);
  } catch (err) {
    // Si ocurre un error, lo muestra en consola y responde con error 500
    console.error('[fotos] PUT error:', err.message);
    res.status(500).json({ error: 'Error al actualizar la foto' });
  }
});

// DELETE /api/fotos/:id — Elimina una foto (solo admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    // Obtiene la foto actual para conocer su public_id en Cloudinary
    const { rows } = await pool.query(
      'SELECT public_id FROM fotos WHERE id = $1', [req.params.id]
    );
    // Si no se encuentra, responde con error 404
    if (rows.length === 0) return res.status(404).json({ error: 'Foto no encontrada' });

    // Si tiene una imagen en Cloudinary, la elimina (ignora error si falla)
    if (rows[0].public_id) {
      await cloudinary.uploader.destroy(rows[0].public_id).catch(() => {});
    }

    // Elimina el registro de la base de datos
    await pool.query('DELETE FROM fotos WHERE id = $1', [req.params.id]);
    // Responde con mensaje de confirmación
    res.json({ mensaje: 'Foto eliminada' });
  } catch (err) {
    // Si ocurre un error, lo muestra en consola y responde con error 500
    console.error('[fotos] DELETE error:', err.message);
    res.status(500).json({ error: 'Error al eliminar la foto' });
  }
});

// Exporta el router para montarlo en el servidor principal
module.exports = router;
