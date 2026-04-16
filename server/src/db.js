import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  user: process.env.DB_USER || 'asystem',
  password: process.env.DB_PASSWORD || 'asystem123',
  database: process.env.DB_NAME || 'asystemai',
});

export default pool;
