import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: new URL('../.env', import.meta.url) });

import authRoutes from './routes/auth.js';
import leadsRoutes from './routes/leads.js';
import projectsRoutes from './routes/projects.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/projects', projectsRoutes);

// Dashboard endpoint
app.get('/api/admin/dashboard', async (req, res) => {
  const { default: pool } = await import('./db.js');
  const { authMiddleware } = await import('./middleware/auth.js');

  authMiddleware(req, res, async () => {
    const [leadsStats, projectsStats, recentLeads] = await Promise.all([
      pool.query(`SELECT status, COUNT(*) as count FROM leads GROUP BY status`),
      pool.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_published) as published FROM projects`),
      pool.query(`SELECT id, name, phone, service, status, created_at FROM leads ORDER BY created_at DESC LIMIT 5`),
    ]);

    res.json({
      leads: leadsStats.rows,
      projects: projectsStats.rows[0],
      recentLeads: recentLeads.rows,
    });
  });
});

// Serve admin SPA (before static site to avoid conflicts)
const adminDist = join(__dirname, '../../admin/dist');
app.use('/admin', express.static(adminDist));
app.get('/admin/*', (req, res) => {
  res.sendFile(join(adminDist, 'index.html'));
});

// Serve static site
const siteRoot = join(__dirname, '../../');
app.use(express.static(siteRoot, { index: 'index.html' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
