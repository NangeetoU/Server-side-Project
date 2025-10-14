// routes/remindersRoutes.js
const express = require('express');
const router = express.Router();
const { requireUser } = require('../middleware/auth');
const { RemindersController } = require('../controllers/remindersController');

router.use(requireUser);

router.post('/:taskId', RemindersController.createForTask); // Create
router.get('/:taskId', RemindersController.getForTask);     // Read
router.get('/', RemindersController.getAllByUser);
router.put('/:taskId', RemindersController.putForTask);     // Put
router.delete('/:taskId', RemindersController.deleteForTask); // Delete


module.exports = router;

