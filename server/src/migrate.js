import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const files = ['001_initial.sql'];
  for (const file of files) {
    const sql = readFileSync(join(__dirname, 'migrations', file), 'utf-8');
    await pool.query(sql);
    console.log(`Applied: ${file}`);
  }
  console.log('All migrations applied');
  await pool.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
