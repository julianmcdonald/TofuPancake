import pg from 'pg';

require('dotenv').config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgres://tofu:tofu@localhost:5432/tofu_pancake';

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default pool;
