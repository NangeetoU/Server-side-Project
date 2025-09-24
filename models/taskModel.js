const { pool } = require('../config/database');

//Status and Priority
const ALLOWED_STATUS = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
const ALLOWED_PRIORITY = ['LOW', 'MODERATE', 'EXTREME'];

const TasksModel = {

    //Create
    async create({user_id, title, description = null, image_url = null, status = 'NOT_STARTED', priority = 'LOW', due_at = null}) {
        const [res] = await pool.execute(
            `INSERT INTO tasks (user_id, title, description, image_url, status, priority, due_at)
            VALUES (:user_id, :title, :description, :image_url, :status, :priority, :due_at)`,
        { user_id, title, description, image_url, status, priority, due_at });
        return res.insertId;
    },

    // READ by id 
    async findById(task_id, user_id) {
    const [rows] = await pool.execute(
      `SELECT task_id, user_id, title, description, image_url, status, priority, due_at
        FROM tasks
        WHERE task_id = :task_id AND user_id = :user_id`,
      { task_id, user_id }
    );
    return rows[0] || null;
    },

   //Update
   async update(task_id, user_id, { title, description, image_url, status, priority, due_at }) {
    if (status && !ALLOWED_STATUS.includes(status)) throw new Error('INVALID_STATUS');
    if (priority && !ALLOWED_PRIORITY.includes(priority)) throw new Error('INVALID_PRIORITY');
    
    
    const [res] = await pool.execute(
        `UPDATE tasks
            SET title   = COALESCE(:title, title),
            description = COALESCE(:description, description),
            image_url   = COALESCE(:image_url, image_url),
            status      = COALESCE(:status, status),
            priority    = COALESCE(:priority, priority),
            due_at      = COALESCE(:due_at, due_at)
        WHERE task_id = :task_id AND user_id = :user_id`,
    { task_id, user_id, title, description, image_url, status, priority, due_at });
    return res.affectedRows > 0;
    },

    //DELETE
    async remove(task_id, user_id) {
    const [res] = await pool.execute(
        `DELETE FROM tasks WHERE task_id = :task_id AND user_id = :user_id`,
    { task_id, user_id });
    return res.affectedRows > 0;
    },


    // PATCH status (PATCH /tasks/:id/status)
    async patchStatus(task_id, user_id, status) {
    if (!ALLOWED_STATUS.includes(status)) return false;
    const [res] = await pool.execute(
        `UPDATE tasks SET status = :status
        WHERE task_id = :task_id AND user_id = :user_id`,
    { status, task_id, user_id });
    return res.affectedRows > 0;
    }

    //FILLER NOT_STARTED, IN_PROGRESS หน้าหลัก
    //FILLER NOT_STARTED หน้ากรอง1
    //FILLER IN_PROGRESS หน้ากรอง2
    //FILLER COMPLETED หน้ากรอง3

    //SEARCH By title
}

module.exports = { TasksModel };
