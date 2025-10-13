// models/usersModel.js
const { pool } = require('../config/database');

const UsersModel = {
  // CREATE
  async create({ first_name, last_name, username, email, password_hash }) {
    const [res] = await pool.execute(
      `INSERT INTO users (first_name, last_name, username, email, password_hash)
       VALUES (:first_name, :last_name, :username, :email, :password_hash)`,
      { first_name, last_name, username, email, password_hash }
    );
    return res.insertId;
  },

  // READ by id
  async findById(user_id) {
    const [rows] = await pool.execute(
      `SELECT user_id, first_name, last_name, username, email
         FROM users WHERE user_id = :user_id`,
      { user_id }
    );
    return rows[0] || null;
  },

  // READ by username 
  async findByUsername(username) {
    const [rows] = await pool.execute(
      `SELECT user_id, first_name, last_name, username, email, password_hash
         FROM users WHERE username = :username`,
      { username }
    );
    return rows[0] || null;
  },

  // UPDATE
  async update(user_id, { first_name, last_name, username, email, password_hash }) {
  const [res] = await pool.execute(
    `UPDATE users
        SET first_name    = :first_name,
            last_name     = :last_name,
            username      = :username,
            email         = :email,
            password_hash = COALESCE(:password_hash, password_hash)
      WHERE user_id = :user_id`,
    { user_id, first_name, last_name, username, email, password_hash: password_hash ?? null }
        );
    return res.affectedRows > 0;
    },



};

module.exports = { UsersModel };

