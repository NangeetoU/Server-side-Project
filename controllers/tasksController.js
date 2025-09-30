// controllers/tasksController.js
const { TasksModel } = require('../models/tasksModel');

function mustUserId(req, res) {
  const uid = req.user?.user_id;
  if (uid == null) {
    res.status(401).json({ error: 'Unauthorized: missing token' });
    return null;
  }
  return Number(uid);
}

// Parse paging/sorting query params with sane defaults and limits
function parsePaging(q = {}) {
  const page = Math.max(1, Number.parseInt(q.page ?? 1) || 1);
  const pageSize = Math.max(1, Math.min(100, Number.parseInt(q.pageSize ?? 10) || 10)); // cap 100
  const orderBy = String(q.orderBy ?? 'created_at');
  const orderDir = String(q.orderDir ?? 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  return { page, pageSize, orderBy, orderDir };
}

const TasksController = {
  async create(req, res, next) {
    try {
      const user_id = mustUserId(req, res);
      if (user_id == null) return;

      const { title } = req.body;
      if (!title) return res.status(400).json({ error: 'title is required' });

      const task_id = await TasksModel.create({
        user_id,
        title,
        description: req.body.description ?? null,
        image_url:   req.body.image_url   ?? null,
        status:      req.body.status      || 'NOT_STARTED',
        priority:    req.body.priority    || 'LOW',
        due_at:      req.body.due_at      ?? null
      });

      const task = await TasksModel.findById(task_id, user_id);
      res.status(201).json(task);
    } catch (e) {
      if (e.message === 'INVALID_STATUS')   return res.status(400).json({ error: 'Invalid status' });
      if (e.message === 'INVALID_PRIORITY') return res.status(400).json({ error: 'Invalid priority' });
      next(e);
    }
  },

  async getById(req, res, next) {
    try {
      const user_id = mustUserId(req, res);
      if (user_id == null) return;
      const id = Number(req.params.id);
      const task = await TasksModel.findById(id, user_id);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json(task);
    } catch (e) { next(e); }
  },

  async update(req, res, next) {
    try {
      const user_id = mustUserId(req, res);
      if (user_id == null) return;

      const id = Number(req.params.id);
      const payload = {
        title:       req.body.title       ?? null,
        description: req.body.description ?? null,
        image_url:   req.body.image_url   ?? null,
        status:      req.body.status      ?? null,
        priority:    req.body.priority    ?? null,
        due_at:      req.body.due_at      ?? null
      };

      const ok = await TasksModel.update(id, user_id, payload);
      if (!ok) return res.status(404).json({ error: 'Task not found' });

      const task = await TasksModel.findById(id, user_id);
      res.json(task);
    } catch (e) {
      if (e.message === 'INVALID_STATUS')   return res.status(400).json({ error: 'Invalid status' });
      if (e.message === 'INVALID_PRIORITY') return res.status(400).json({ error: 'Invalid priority' });
      next(e);
    }
  },

  async patchStatus(req, res, next) {
    try {
      const user_id = mustUserId(req, res);
      if (user_id == null) return;

      const task_id = Number(req.params.id);
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: 'status is required' });

      const ok = await TasksModel.patchStatus(task_id, user_id, status);
      if (!ok) return res.status(400).json({ error: 'Invalid status or task not found' });

      const task = await TasksModel.findById(task_id, user_id);
      res.json(task);
    } catch (e) { next(e); }
  },

  async remove(req, res, next) {
    try {
      const user_id = mustUserId(req, res);
      if (user_id == null) return;

      const id = Number(req.params.id);
      const ok = await TasksModel.remove(id, user_id);
      if (!ok) return res.status(404).json({ error: 'Task not found' });
      res.status(204).end();
    } catch (e) { next(e); }
  },

  // GET /tasks/dashboard
  async getdashboard(req, res, next) {
    try {
      const user_id = mustUserId(req, res); if (user_id == null) return;
      const limit = Number(req.query.limit || 20);

      const [notStarted, inProgress, stats] = await Promise.all([
        TasksModel.fillernotstarted(user_id, { page: 1, pageSize: limit, orderBy: 'updated_at', orderDir: 'DESC' }),
        TasksModel.fillerinprogress(user_id, { page: 1, pageSize: limit, orderBy: 'updated_at', orderDir: 'DESC' }),
        TasksModel.countByStatus(user_id),
      ]);

      res.json({
        user_id,
        limit,
        sections: {
          not_started: notStarted,
          in_progress: inProgress,
          stats
        }
      });
    } catch (e) { next(e); }
  },

  // SEARCH: GET /tasks/search?q=...
  async search(req, res, next) {
    try {
      const user_id = mustUserId(req, res); if (user_id == null) return;
      const q = String(req.query.q || '').trim();
      const data = await TasksModel.searchByTitle(user_id, q);
      res.json({ q, count: data.length, data });
    } catch (e) { next(e); }
  },

  // GET /tasks/not-started
  async getNotStarted(req, res, next) {
    try {
      const user_id = mustUserId(req, res); if (user_id == null) return;
      const opts = parsePaging(req.query);
      const out = await TasksModel.fillernotstarted(user_id, opts);
      res.json(out);
    } catch (e) { next(e); }
  },

  // GET /tasks/in-progress
  async getInProgress(req, res, next) {
    try {
      const user_id = mustUserId(req, res); if (user_id == null) return;
      const opts = parsePaging(req.query);
      const out = await TasksModel.fillerinprogress(user_id, opts);
      res.json(out);
    } catch (e) { next(e); }
  },

  // GET /tasks/completed
  async getCompleted(req, res, next) {
    try {
      const user_id = mustUserId(req, res); if (user_id == null) return;
      const opts = parsePaging(req.query);
      const out = await TasksModel.fillercompleted(user_id, opts);
      res.json(out);
    } catch (e) { next(e); }
  }
};


module.exports = { TasksController };
