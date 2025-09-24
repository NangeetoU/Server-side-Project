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

    //async list(req, res, next) {
    //try {
    //  const user_id = mustUserId(req, res);
    //  if (user_id == null) return;
    //  const rows = await TasksModel.findAll(user_id);
    //  res.json(rows);
    //} catch (e) { next(e); }
  //},

};

module.exports = { TasksController };
