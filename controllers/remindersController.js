// controllers/remindersController.js
const {
  createForTask,
  getByTask,
  updateByTask,
  deleteByTask,
  getAllByUserId, 
} = require('../models/remindersModel');

function uid(req, res) {
  const id = req.user?.user_id;
  if (id == null) { res.status(401).json({ error: 'Unauthorized' }); return null; }
  return Number(id);
}

const RemindersController = {
  // Create
  async createForTask(req, res, next) {
    try {
      const user_id = uid(req, res); if (user_id == null) return;
      const task_id = Number(req.params.taskId);
      const { remind_at, priority = 'LOW' } = req.body || {};
      if (!remind_at) return res.status(400).json({ error: 'remind_at is required' });

      const r = await createForTask({ user_id, task_id, remind_at, priority });
      if (!r.ok) {
        if (r.error === 'TASK_NOT_FOUND') return res.status(404).json({ error: 'Task not found' });
        if (r.error === 'ALREADY_EXISTS') return res.status(409).json({ error: 'Reminder already exists for this task' });
        if (r.error === 'INVALID_PRIORITY') return res.status(400).json({ error: 'Invalid priority' });
        if (r.error === 'INVALID_DATETIME') return res.status(400).json({ error: 'Invalid datetime' });
        return res.status(400).json({ error: r.error });
      }
      res.status(201).json(r.data);
    } catch (e) { next(e); }
  },

  // Read (single)
  async getForTask(req, res, next) {
    try {
      const user_id = uid(req, res); if (user_id == null) return;
      const task_id = Number(req.params.taskId);
      const row = await getByTask(task_id, user_id);
      if (!row) return res.status(404).json({ error: 'Reminder not found' });
      res.json(row);
    } catch (e) { next(e); }
  },

  // Read all for current user
  async getAllByUser(req, res, next) {
    try {
      const user_id = uid(req, res); if (user_id == null) return;
      const rows = await getAllByUserId(user_id);
      res.json(rows);
    } catch (e) { next(e); }
  },

  // Update (PUT/PATCH)
  async putForTask(req, res, next) {
    try {
      const user_id = uid(req, res); if (user_id == null) return;
      const task_id = Number(req.params.taskId);
      const { remind_at, priority, is_sent } = req.body || {};
      const r = await updateByTask(task_id, user_id, { remind_at, priority, is_sent });
      if (!r.ok) {
        if (r.error === 'NOT_FOUND') return res.status(404).json({ error: 'Reminder not found' });
        if (r.error === 'INVALID_PRIORITY') return res.status(400).json({ error: 'Invalid priority' });
        if (r.error === 'INVALID_DATETIME') return res.status(400).json({ error: 'Invalid datetime' });
        if (r.error === 'NO_FIELDS') return res.status(400).json({ error: 'No fields to update' });
        return res.status(400).json({ error: r.error });
      }
      res.json(r.data);
    } catch (e) { next(e); }
  },

  // Delete
  async deleteForTask(req, res, next) {
    try {
      const user_id = uid(req, res); if (user_id == null) return;
      const task_id = Number(req.params.taskId);
      const ok = await deleteByTask(task_id, user_id);
      if (!ok) return res.status(404).json({ error: 'Reminder not found' });
      res.status(204).end();
    } catch (e) { next(e); }
  }
};

module.exports = { RemindersController };
