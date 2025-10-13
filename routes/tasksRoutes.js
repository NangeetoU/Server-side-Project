// routes/tasksRoutes.js (ฉบับทำความสะอาด)
const express = require('express');
const router = express.Router();
const { requireUserApi } = require('../middleware/apiAuth');
const { TasksController } = require('../controllers/tasksController');

// ใช้ middleware ป้องกันทุกเส้นทางในไฟล์นี้
router.use(requireUserApi);


// ---------- (คงไว้) Route สำหรับ Search โดยเฉพาะ ----------
// จะถูกเรียกที่ URL: GET /tasks/search?q=...
router.get('/search', TasksController.search);

// ---------- (คงไว้) Route สำหรับ Filter โดยเฉพาะ ----------
// จะถูกเรียกที่ URL: GET /tasks/filter?status=... หรือ /tasks/filter?priority=...
router.get('/filter', TasksController.filter);

// ---------- Routes สำหรับ CRUD (เหมือนเดิม) ----------
const reId       = /^\/(\d+)$/;
const reIdStatus = /^\/(\d+)\/status$/;

function mapRegexId(req, _res, next) {
    if (req.params && req.params[0]) req.params.id = req.params[0];
    next();
}

router.post('/',           TasksController.create);
router.get(reId,           mapRegexId, TasksController.getById);
router.put(reId,           mapRegexId, TasksController.update);
router.delete(reId,        mapRegexId, TasksController.remove);
router.patch(reIdStatus,   mapRegexId, TasksController.patchStatus);

module.exports = router;