// routes/tasksRoutes.js
const express = require('express');
const router = express.Router();
const { requireUser } = require('../middleware/auth');
const { TasksController } = require('../controllers/tasksController');

router.post('/',            requireUser, TasksController.create);
router.get('/:id',          requireUser, TasksController.getById);
router.put('/:id',          requireUser, TasksController.update);
router.patch('/:id/status', requireUser, TasksController.patchStatus);
router.delete('/:id',       requireUser, TasksController.remove);

module.exports = router;
