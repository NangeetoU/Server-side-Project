const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UsersModel } = require('../models/usersModel');

const UsersController = {
  // POST /users/register
  async register(req, res, next) {
    try {
      const { first_name, last_name, username, email, password } = req.body;
      if (!first_name || !last_name || !username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const password_hash = await bcrypt.hash(password, 10);

      let user_id;
      try {
        user_id = await UsersModel.create({
          first_name, last_name, username, email, password_hash
        });
      } catch (dbErr) {
        if (dbErr.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Username or email already exists' });
        }
        throw dbErr;
      }

      const user = await UsersModel.findById(user_id);
      res.status(201).json(user);
    } catch (e) { next(e); }
  },

  // POST /users/login
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'username and password are required' });
      }

      const userRow = await UsersModel.findByUsername(username);
      if (!userRow) return res.status(401).json({ error: 'Invalid credentials' });

      const ok = await bcrypt.compare(password, userRow.password_hash || '');
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const payload = {
        user_id: userRow.user_id,
        username: userRow.username,
        email: userRow.email
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES || '24h',
        issuer: 'server-side-app',
        audience: String(userRow.user_id),
      });

      const user = {
        user_id: userRow.user_id,
        first_name: userRow.first_name,
        last_name: userRow.last_name,
        username: userRow.username,
        email: userRow.email
      };

      res.json({ token, user });
    } catch (e) { next(e); }
  },

  // PUT /users/:id
async update(req, res, next) {
  try {
    const user_id = req.user.user_id;
    const { first_name, last_name, username, email, password } = req.body;

    if (!first_name || !last_name || !username || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let password_hash = null;
    if (password) {
      password_hash = await bcrypt.hash(password, 10);
    }

    const ok = await UsersModel.update(user_id, {
      first_name,
      last_name,
      username,
      email,
      password_hash
    });

    if (!ok) return res.status(404).json({ error: 'User not found' });

    const user = await UsersModel.findById(user_id);
    res.json(user);
  } catch (e) { next(e); }
},

  // DELETE /users/me
  async removeMe(req, res, next) {
    try {
      const ok = await UsersModel.remove(req.user.user_id);
      if (!ok) return res.status(404).json({ error: 'User not found' });
      res.status(204).end();
    } catch (e) { next(e); }
  }
};

module.exports = { UsersController };
