const { Router } = require('express');
const pool = require('../config/database');
const upload = require('../middleware/upload');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { cloudinary } = require('../config/cloudinary');

const router = Router();

// GET /api/reflexiones — públicas
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, titulo, contenido, imagen_url, fecha FROM reflexiones ORDER BY fecha DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('[reflexiones] GET error:', err.message);
    res.status(500).json({ error: 'Error al cargar reflexiones' });
  }
});

// GET /api/reflexiones/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, titulo, contenido, imagen_url, fecha FROM reflexiones WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Reflexión no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[reflexiones] GET/:id error:', err.message);
    res.status(500).json({ error: 'Error al cargar la reflexión' });
  }
});

// POST /api/reflexiones — admin
router.post('/', authenticate, requireAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const { titulo, contenido } = req.body;
    const imagenUrl = req.file ? req.file.path : null;
    const imagenPublicId = req.file ? req.file.filename : null;

    const { rows } = await pool.query(
      `INSERT INTO reflexiones (titulo, contenido, imagen_url, imagen_public_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, titulo, contenido, imagen_url, fecha`,
      [titulo, contenido, imagenUrl, imagenPublicId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[reflexiones] POST error:', err.message);
    res.status(500).json({ error: 'Error al crear la reflexión' });
  }
});

// PUT /api/reflexiones/:id — admin
router.put('/:id', authenticate, requireAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const { titulo, contenido } = req.body;
    const id = req.params.id;

    const { rows: existing } = await pool.query(
      'SELECT imagen_public_id FROM reflexiones WHERE id = $1', [id]
    );
    if (existing.length === 0) return res.status(404).json({ error: 'Reflexión no encontrada' });

    let imagenUrl = null;
    let imagenPublicId = null;

    if (req.file) {
      imagenUrl = req.file.path;
      imagenPublicId = req.file.filename;
      if (existing[0].imagen_public_id) {
        await cloudinary.uploader.destroy(existing[0].imagen_public_id).catch(() => {});
      }
    }

    const { rows } = await pool.query(
      `UPDATE reflexiones SET
        titulo = COALESCE($1, titulo),
        contenido = COALESCE($2, contenido),
        imagen_url = COALESCE($3, imagen_url),
        imagen_public_id = COALESCE($4, imagen_public_id),
        updated_at = NOW()
       WHERE id = $5
       RETURNING id, titulo, contenido, imagen_url, fecha`,
      [titulo || null, contenido || null, imagenUrl, imagenPublicId, id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error('[reflexiones] PUT error:', err.message);
    res.status(500).json({ error: 'Error al actualizar la reflexión' });
  }
});

// DELETE /api/reflexiones/:id — admin
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT imagen_public_id FROM reflexiones WHERE id = $1', [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Reflexión no encontrada' });

    if (rows[0].imagen_public_id) {
      await cloudinary.uploader.destroy(rows[0].imagen_public_id).catch(() => {});
    }

    await pool.query('DELETE FROM reflexiones WHERE id = $1', [req.params.id]);
    res.json({ mensaje: 'Reflexión eliminada' });
  } catch (err) {
    console.error('[reflexiones] DELETE error:', err.message);
    res.status(500).json({ error: 'Error al eliminar la reflexión' });
  }
});

module.exports = router;
