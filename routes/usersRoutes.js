const express = require('express');
const { UsersController } = require('../controllers/usersController');

const router = express.Router();

// Register user (POST /users/register)
router.post('/register', UsersController.register);

// Get user by id (GET /users/:id)
router.get('/:id', UsersController.getById);

// Update user (PUT /users/:id)
router.put('/:id', UsersController.update);

// Delete user (DELETE /users/:id)
router.delete('/:id', UsersController.remove);

module.exports = router;