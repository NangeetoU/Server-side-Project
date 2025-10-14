// models/remindersModel.js
const { pool } = require('../config/database');

const ALLOWED_PRIORITY = ['LOW', 'MODERATE', 'EXTREME'];

function normalizeDateTime(dt) {
  const d = (dt instanceof Date) ? dt : new Date(dt);
  if (Number.isNaN(d.getTime())) throw new Error('INVALID_DATETIME');
  const pad = (n) => String(n).padStart(2, '0');
  const y = d.getFullYear(), m = pad(d.getMonth()+1), day = pad(d.getDate());
  const hh = pad(d.getHours()), mm = pad(d.getMinutes()), ss = pad(d.getSeconds());
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
}

async function createForTask({ user_id, task_id, remind_at, priority = 'LOW' }) {
  if (!ALLOWED_PRIORITY.includes(priority)) return { ok:false, error:'INVALID_PRIORITY' };
  try { remind_at = normalizeDateTime(remind_at); } catch { return { ok:false, error:'INVALID_DATETIME' }; }

  const [trows] = await pool.execute(
    'SELECT task_id FROM tasks WHERE task_id = :tid AND user_id = :uid LIMIT 1',
    { tid: task_id, uid: user_id }
  );
  if (!trows.length) return { ok:false, error:'TASK_NOT_FOUND' };

  const [r1] = await pool.execute(
    'SELECT reminder_id FROM reminders WHERE task_id = :tid LIMIT 1',
    { tid: task_id }
  );
  if (r1.length) return { ok:false, error:'ALREADY_EXISTS' };

  const [res] = await pool.execute(
    `INSERT INTO reminders (task_id, remind_at, priority, is_sent)
     VALUES (:tid, :remind_at, :priority, 0)`,
    { tid: task_id, remind_at, priority }
  );
  const [out] = await pool.execute(
    `SELECT reminder_id, task_id, remind_at, is_sent, priority
       FROM reminders WHERE reminder_id = :rid`,
    { rid: res.insertId }
  );
  return { ok:true, data: out[0] };
}

async function getByTask(task_id, user_id) {
  const [rows] = await pool.execute(
    `SELECT r.reminder_id, r.task_id, r.remind_at, r.is_sent, r.priority
       FROM reminders r
       JOIN tasks t ON t.task_id = r.task_id
      WHERE r.task_id = :tid AND t.user_id = :uid
      LIMIT 1`,
    { tid: task_id, uid: user_id }
  );
  return rows[0] || null;
}

async function updateByTask(task_id, user_id, { remind_at, priority, is_sent }) {
  const fields = [];
  const params = { tid: task_id, uid: user_id };

  if (remind_at !== undefined) {
    try { params.remind_at = normalizeDateTime(remind_at); }
    catch { return { ok:false, error:'INVALID_DATETIME' }; }
    fields.push('r.remind_at = :remind_at');
  }
  if (priority !== undefined) {
    if (!ALLOWED_PRIORITY.includes(priority)) return { ok:false, error:'INVALID_PRIORITY' };
    params.priority = priority;
    fields.push('r.priority = :priority');
  }
  if (is_sent !== undefined) {
    params.is_sent = is_sent ? 1 : 0;
    fields.push('r.is_sent = :is_sent');
  }
  if (!fields.length) return { ok:false, error:'NO_FIELDS' };

  const [res] = await pool.execute(
    `UPDATE reminders r
       JOIN tasks t ON t.task_id = r.task_id
          SET ${fields.join(', ')}
     WHERE r.task_id = :tid AND t.user_id = :uid`,
    params
  );
  if (!res.affectedRows) return { ok:false, error:'NOT_FOUND' };

  const row = await getByTask(task_id, user_id);
  return { ok:true, data: row };
}

async function deleteByTask(task_id, user_id) {
  const [res] = await pool.execute(
    `DELETE r FROM reminders r
      JOIN tasks t ON t.task_id = r.task_id
     WHERE r.task_id = :tid AND t.user_id = :uid`,
    { tid: task_id, uid: user_id }
  );
  return res.affectedRows > 0;
}

async function getAllByUserId(user_id) {
  const [rows] = await pool.execute(
    `SELECT r.reminder_id, r.task_id, t.title AS task_title,
            r.remind_at, r.is_sent, r.priority, t.due_at, t.status
       FROM reminders r
       JOIN tasks t ON t.task_id = r.task_id
      WHERE t.user_id = :uid
      ORDER BY r.remind_at ASC`,
    { uid: user_id }
  );
  return rows || [];
}

module.exports = { createForTask, getByTask, updateByTask, deleteByTask, getAllByUserId };
