// routes/tasksRoutes.js
const express = require('express');
const router = express.Router();

const { requireUser } = require('../middleware/auth');
const { TasksController } = require('../controllers/tasksController');

router.use(requireUser);

// ---------- Dashboard & Search (static paths มาก่อน) ----------
router.get('/dashboard',   TasksController.getdashboard);
router.get('/search',      TasksController.search);
router.get('/not-started', TasksController.getNotStarted);
router.get('/in-progress', TasksController.getInProgress);
router.get('/completed',   TasksController.getCompleted);

// ---------- CRUD ----------
// ใช้ RegExp เพื่อบังคับให้ id เป็นตัวเลขล้วน
const reId        = /^\/(\d+)$/;
const reIdStatus  = /^\/(\d+)\/status$/;

// helper: map capture group -> req.params.id
function mapRegexId(req, _res, next) {
  // สำหรับเส้นทางแบบ RegExp, express จะใส่ค่าส่วนจับใน req.params[0], [1], ...
  if (req.params && req.params[0]) req.params.id = req.params[0];
  next();
}

router.post('/',          TasksController.create);
router.patch(reIdStatus,  mapRegexId, TasksController.patchStatus);
router.get(reId,          mapRegexId, TasksController.getById);
router.put(reId,          mapRegexId, TasksController.update);
router.delete(reId,       mapRegexId, TasksController.remove);

module.exports = router;
