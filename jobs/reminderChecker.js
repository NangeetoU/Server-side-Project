// jobs/reminderChecker.js
const cron = require('node-cron');
const { pool } = require('../config/database');
const { createForTask } = require('../models/remindersModel');

async function checkDueTasks() {
  console.log('[ReminderChecker] Running check...');

  try {
    const [rows] = await pool.query(`
        SELECT t.task_id, t.user_id, t.due_at, t.priority
        FROM tasks t
        LEFT JOIN reminders r ON t.task_id = r.task_id
        WHERE t.due_at IS NOT NULL
        AND r.reminder_id IS NULL
        AND t.status != 'COMPLETED'
        AND TIMESTAMPDIFF(HOUR, NOW(), t.due_at) BETWEEN -24 AND 24
    `);

    for (const task of rows) {
      try {
        const remindTime = new Date(new Date(task.due_at).getTime() - 60 * 60 * 1000); // 1 ชม. ก่อน due
        const result = await createForTask({
            user_id: task.user_id,
            task_id: task.task_id,
            remind_at: remindTime,
            priority: task.priority || 'LOW'
        });

        if (result.ok) {
          console.log(`Created reminder for task_id=${task.task_id}`);
        } else if (result.error === 'ALREADY_EXISTS') {
          console.log(`ℹReminder already exists for task_id=${task.task_id}`);
        } else {
          console.warn(`Failed to create reminder for task_id=${task.task_id}: ${result.error}`);
        }
      } catch (innerErr) {
        console.error('Error creating reminder:', innerErr);
      }
    }

    console.log(`[ReminderChecker] Checked ${rows.length} tasks.`);
  } catch (err) {
    console.error('[ReminderChecker] Error:', err);
  }
}

// ตั้ง schedule ให้รันทุกชั่วโมง
cron.schedule('0 * * * *', checkDueTasks); // “ทุกชั่วโมงตอนนาที 0”
// ถ้าอยากทดสอบทันที:
checkDueTasks();

module.exports = { checkDueTasks };
