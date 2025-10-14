// routes/remindersRoutes.js
const express = require('express');
const router = express.Router();
const { requireUserApi } = require('../middleware/apiAuth'); 
const { RemindersController } = require('../controllers/remindersController');


router.use(requireUserApi); 

router.post('/:taskId', RemindersController.createForTask); // Create
router.get('/:taskId', RemindersController.getForTask);     // Read
router.get('/', RemindersController.getAllByUser);
router.put('/:taskId', RemindersController.putForTask);     // Put
router.delete('/:taskId', RemindersController.deleteForTask); // Delete


module.exports = router;

