import { Router } from 'express';
import pool from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[а-яё]/gi, c => {
      const map = { 'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya' };
      return map[c.toLowerCase()] || c;
    })
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Public: get published projects
router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, slug, title, client, short_description, cover_image, logo_image, tags, is_featured
     FROM projects WHERE is_published = true ORDER BY sort_order, created_at DESC`
  );
  res.json(rows);
});

// Public: get single project by slug
router.get('/:slug', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM projects WHERE slug = $1 AND is_published = true',
    [req.params.slug]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json(rows[0]);
});

// Admin: get all projects (including unpublished)
router.get('/admin/all', authMiddleware, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM projects ORDER BY sort_order, created_at DESC'
  );
  res.json(rows);
});

// Admin: create project
router.post('/', authMiddleware, async (req, res) => {
  const { title, client, short_description, full_description, challenge, solution, result,
    cover_image, logo_image, gallery, tags, sort_order, is_published, is_featured } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const slug = req.body.slug || slugify(title);

  const { rows } = await pool.query(
    `INSERT INTO projects (slug, title, client, short_description, full_description, challenge, solution, result,
      cover_image, logo_image, gallery, tags, sort_order, is_published, is_featured)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING *`,
    [slug, title, client, short_description, full_description, challenge, solution, result,
      cover_image, logo_image, JSON.stringify(gallery || []), JSON.stringify(tags || []),
      sort_order || 0, is_published || false, is_featured || false]
  );

  res.status(201).json(rows[0]);
});

// Admin: update project
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { slug, title, client, short_description, full_description, challenge, solution, result,
    cover_image, logo_image, gallery, tags, sort_order, is_published, is_featured } = req.body;

  const { rows } = await pool.query(
    `UPDATE projects SET
      slug=$1, title=$2, client=$3, short_description=$4, full_description=$5,
      challenge=$6, solution=$7, result=$8, cover_image=$9, logo_image=$10,
      gallery=$11, tags=$12, sort_order=$13, is_published=$14, is_featured=$15, updated_at=NOW()
     WHERE id=$16 RETURNING *`,
    [slug, title, client, short_description, full_description, challenge, solution, result,
      cover_image, logo_image, JSON.stringify(gallery || []), JSON.stringify(tags || []),
      sort_order || 0, is_published || false, is_featured || false, parseInt(id)]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json(rows[0]);
});

// Admin: delete project
router.delete('/:id', authMiddleware, async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM projects WHERE id = $1', [parseInt(req.params.id)]);

  if (rowCount === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json({ success: true });
});

export default router;
