const { Router } = require('express');
const pool = require('../config/database');
const upload = require('../middleware/upload');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { cloudinary } = require('../config/cloudinary');

const router = Router();

// GET /api/historias — públicas, solo activas
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, titulo, texto, imagen_url, fecha, destacada FROM historias WHERE activa = TRUE ORDER BY destacada DESC, fecha DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('[historias] GET error:', err.message);
    res.status(500).json({ error: 'Error al cargar historias' });
  }
});

// GET /api/historias/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, titulo, texto, imagen_url, fecha, destacada FROM historias WHERE id = $1 AND activa = TRUE',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Historia no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[historias] GET/:id error:', err.message);
    res.status(500).json({ error: 'Error al cargar la historia' });
  }
});

// POST /api/historias — admin
router.post('/', authenticate, requireAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const { titulo, texto, destacada } = req.body;
    const imagenUrl = req.file ? req.file.path : null;
    const imagenPublicId = req.file ? req.file.filename : null;

    const { rows } = await pool.query(
      `INSERT INTO historias (titulo, texto, imagen_url, imagen_public_id, destacada)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, titulo, texto, imagen_url, fecha, destacada`,
      [titulo, texto, imagenUrl, imagenPublicId, destacada === 'true' || destacada === true]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[historias] POST error:', err.message);
    res.status(500).json({ error: 'Error al crear la historia' });
  }
});

// PUT /api/historias/:id — admin
router.put('/:id', authenticate, requireAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const { titulo, texto, destacada } = req.body;
    const id = req.params.id;

    // Obtener historia actual
    const { rows: existing } = await pool.query(
      'SELECT imagen_public_id FROM historias WHERE id = $1', [id]
    );
    if (existing.length === 0) return res.status(404).json({ error: 'Historia no encontrada' });

    let imagenUrl = null;
    let imagenPublicId = null;

    if (req.file) {
      // Subir nueva imagen y eliminar anterior de Cloudinary
      imagenUrl = req.file.path;
      imagenPublicId = req.file.filename;
      if (existing[0].imagen_public_id) {
        await cloudinary.uploader.destroy(existing[0].imagen_public_id).catch(() => {});
      }
    }

    const { rows } = await pool.query(
      `UPDATE historias SET
        titulo = COALESCE($1, titulo),
        texto = COALESCE($2, texto),
        imagen_url = COALESCE($3, imagen_url),
        imagen_public_id = COALESCE($4, imagen_public_id),
        destacada = COALESCE($5, destacada),
        updated_at = NOW()
       WHERE id = $6
       RETURNING id, titulo, texto, imagen_url, fecha, destacada`,
      [
        titulo || null,
        texto || null,
        imagenUrl,
        imagenPublicId,
        destacada !== undefined ? (destacada === 'true' || destacada === true) : null,
        id,
      ]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error('[historias] PUT error:', err.message);
    res.status(500).json({ error: 'Error al actualizar la historia' });
  }
});

// DELETE /api/historias/:id — admin
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT imagen_public_id FROM historias WHERE id = $1', [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Historia no encontrada' });

    if (rows[0].imagen_public_id) {
      await cloudinary.uploader.destroy(rows[0].imagen_public_id).catch(() => {});
    }

    await pool.query('DELETE FROM historias WHERE id = $1', [req.params.id]);
    res.json({ mensaje: 'Historia eliminada' });
  } catch (err) {
    console.error('[historias] DELETE error:', err.message);
    res.status(500).json({ error: 'Error al eliminar la historia' });
  }
});

module.exports = router;
