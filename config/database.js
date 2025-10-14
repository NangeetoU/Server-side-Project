// config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345678',
  database: process.env.DB_DATABASE || 'server_side',
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  timezone: '+00:00',
});

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    console.log('Database connected:', rows[0].now);
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    throw err;
  }
}

module.exports = { pool, testConnection };
