// models/tasksModel.js
const { pool } = require('../config/database');

// Status and Priority
const ALLOWED_STATUS = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
const ALLOWED_PRIORITY = ['LOW', 'MODERATE', 'EXTREME'];

// คอลัมน์ที่อนุญาตให้ ORDER BY (กัน SQL injection)
const ORDERABLE = new Set(['created_at', 'due_at', 'priority', 'title', 'status', 'task_id']);

const TasksModel = {

  //Create
  async create({ user_id, title, description =  null, status = 'NOT_STARTED', priority = 'LOW', due_at = null }) {
    const [res] = await pool.execute(
      `INSERT INTO tasks (user_id, title, description, status, priority, due_at)
       VALUES (:user_id, :title, :description, :status, :priority, :due_at)`,
      { user_id, title, description, status, priority, due_at }
    );
    return res.insertId;
  },

  // READ by id 
  async findById(task_id, user_id) {
    const [rows] = await pool.execute(
      `SELECT task_id, user_id, title, description, status, priority, due_at, created_at
         FROM tasks
        WHERE task_id = :task_id AND user_id = :user_id`,
      { task_id, user_id }
    );
    return rows[0] || null;
  },

  //Update
  async update(task_id, user_id, data) {
    // 1. กรองเอาเฉพาะ key ที่มีค่าส่งมาจริงๆ (ไม่ใช่ null หรือ undefined)
      const fields = Object.keys(data).filter(key => data[key] != null);
      
      // ถ้าไม่มีข้อมูลอะไรส่งมาให้อัปเดตเลย ก็ถือว่าสำเร็จ
      if (fields.length === 0) return true;

      // 2. สร้าง SET clause แบบไดนามิก (เช่น "status = ?, priority = ?")
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      
      // 3. เตรียมค่า parameters ที่จะส่งเข้าไปใน query
      const params = fields.map(key => data[key]);

      // 4. สร้าง query ทั้งหมด
      const query = `UPDATE tasks SET ${setClause} WHERE task_id = ? AND user_id = ?`;

      // 5. ยิง query พร้อมกับ parameters
      const [res] = await pool.execute(query, [...params, task_id, user_id]);
      
      return res.affectedRows > 0;
  },

  //DELETE
  async remove(task_id, user_id) {
      // สร้างการเชื่อมต่อแบบ Transaction เพื่อให้แน่ใจว่าถ้ามีอะไรผิดพลาด จะย้อนกลับได้ทั้งหมด
      const connection = await pool.getConnection();
      try {
          await connection.beginTransaction();

          // 1. ลบ "ลูก" (Reminders) ที่เกี่ยวข้องกับ task_id นี้ก่อน
          await connection.execute(
              `DELETE FROM reminders WHERE task_id = ?`,
              [task_id]
          );

          // 2. จากนั้น ค่อยลบ "พ่อ" (Task)
          const [res] = await connection.execute(
              `DELETE FROM tasks WHERE task_id = ? AND user_id = ?`,
              [task_id, user_id]
          );

          // ถ้าทุกอย่างสำเร็จ ให้ commit การเปลี่ยนแปลง
          await connection.commit();

          return res.affectedRows > 0;

      } catch (error) {
          // ถ้ามี Error เกิดขึ้น ให้ยกเลิกทุกอย่างที่ทำไป
          await connection.rollback();
          console.error('Failed to delete task and its reminders:', error);
          throw error; // ส่ง Error ต่อไปให้ Controller จัดการ
      } finally {
          // คืนการเชื่อมต่อกลับสู่ Pool เสมอ
          connection.release();
      }
  },

  // PATCH status (PATCH /tasks/:id/status)
  async patchStatus(task_id, user_id, status) {
    if (!ALLOWED_STATUS.includes(status)) return false;
    const [res] = await pool.execute(
      `UPDATE tasks SET status = :status
        WHERE task_id = :task_id AND user_id = :user_id`,
      { status, task_id, user_id }
    );
    return res.affectedRows > 0;
  },
  
    // ฟังก์ชันสำหรับ Filter โดยเฉพาะ
  async filterBy(user_id, options = {}) {
      const { status, priority } = options;

      let query = 'SELECT * FROM tasks WHERE user_id = ?';
      const params = [user_id];

      if (status) {
          query += ' AND status = ?';
          params.push(status);
      }
      if (priority) {
          query += ' AND priority = ?';
          params.push(priority);
      }

      query += ' ORDER BY due_at ASC, FIELD(priority, "EXTREME", "MODERATE", "LOW")';

      const [rows] = await pool.query(query, params);
      return rows || [];
  },

  // ===== FILLERS =====
  // NOT_STARTED
  async fillernotstarted(user_id, { page = 1, pageSize = 10, orderBy = 'created_at', orderDir = 'DESC' } = {}) {
    const col = ORDERABLE.has(orderBy) ? orderBy : 'created_at';
    const dir = String(orderDir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const limit  = Math.max(1, Math.trunc(Number(pageSize)));
    const offset = Math.max(0, Math.trunc((Number(page) - 1) * limit));

    // ใช้ positional placeholders กับ LIMIT/OFFSET
    const [rows] = await pool.query(
      `SELECT task_id, user_id, title, description, status, priority, due_at, created_at
         FROM tasks
        WHERE user_id = ? AND status = 'NOT_STARTED'
        ORDER BY ${col} ${dir}
        LIMIT ? OFFSET ?`,
      [user_id, limit, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM tasks WHERE user_id = ? AND status = 'NOT_STARTED'`,
      [user_id]
    );

    return { page: Number(page), pageSize: limit, total: Number(total), data: rows || [] };
  },

  // IN_PROGRESS
  async fillerinprogress(user_id, { page = 1, pageSize = 10, orderBy = 'created_at', orderDir = 'DESC' } = {}) {
    const col = ORDERABLE.has(orderBy) ? orderBy : 'created_at';
    const dir = String(orderDir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const limit  = Math.max(1, Math.trunc(Number(pageSize)));
    const offset = Math.max(0, Math.trunc((Number(page) - 1) * limit));

    const [rows] = await pool.query(
      `SELECT task_id, user_id, title, description, status, priority, due_at, created_at
         FROM tasks
        WHERE user_id = ? AND status = 'IN_PROGRESS'
        ORDER BY ${col} ${dir}
        LIMIT ? OFFSET ?`,
      [user_id, limit, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM tasks WHERE user_id = ? AND status = 'IN_PROGRESS'`,
      [user_id]
    );

    return { page: Number(page), pageSize: limit, total: Number(total), data: rows || [] };
  },

  // COMPLETED
  async fillercompleted(user_id, { page = 1, pageSize = 10, orderBy = 'created_at', orderDir = 'DESC' } = {}) {
    const col = ORDERABLE.has(orderBy) ? orderBy : 'created_at';
    const dir = String(orderDir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const limit  = Math.max(1, Math.trunc(Number(pageSize)));
    const offset = Math.max(0, Math.trunc((Number(page) - 1) * limit));

    const [rows] = await pool.query(
      `SELECT task_id, user_id, title, description, status, priority, due_at, created_at
         FROM tasks
        WHERE user_id = ? AND status = 'COMPLETED'
        ORDER BY ${col} ${dir}
        LIMIT ? OFFSET ?`,
      [user_id, limit, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM tasks WHERE user_id = ? AND status = 'COMPLETED'`,
      [user_id]
    );

    return { page: Number(page), pageSize: limit, total: Number(total), data: rows || [] };
  },

  // SEARCH By title
  async searchByTitle(user_id, queryText) {
    if (!queryText || !queryText.trim()) return [];
    const like = `%${queryText}%`;
    const [rows] = await pool.execute(
      `SELECT task_id, user_id, title, description, status, priority, due_at, created_at
         FROM tasks
        WHERE user_id = :user_id
          AND title LIKE :like
        ORDER BY task_id`,
      { user_id, like }
    );
    return rows || [];
  },

  // CountByStatus
  async countByStatus(user_id) {
    const [rows] = await pool.execute(
      `SELECT status, COUNT(*) AS total
         FROM tasks
        WHERE user_id = :user_id
        GROUP BY status`,
      { user_id }
    );
    const out = { NOT_STARTED: 0, IN_PROGRESS: 0, COMPLETED: 0 };
    for (const r of rows) if (out[r.status] !== undefined) out[r.status] = Number(r.total);
    return out;
  }
};

module.exports = { TasksModel };
