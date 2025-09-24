const express = require('express');
const { UsersController } = require('../controllers/usersController');
const { requireUser } = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', UsersController.register);

// Login (username + password in body)
router.post('/login', UsersController.login);

//Edit
router.put('/update', requireUser, UsersController.update);

// delete 
router.delete('/me', requireUser, UsersController.removeMe);

module.exports = router;


