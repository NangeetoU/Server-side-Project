/**
 * @file        usersController.js
 * @description Controller นี้จะรับผิดชอบทุกอย่างที่เกี่ยวข้องกับผู้ใช้ (Users)
 * ทั้งการแสดงหน้าเว็บ (Login, Register) และการจัดการข้อมูล
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UsersModel } = require('../models/usersModel');
const { TasksModel } = require('../models/tasksModel');

const UsersController = {

    async getLoginPage(req, res) {
        res.render('login', { title: 'Login - DoDash' });
    },

    async getRegisterPage(req, res) {
        res.render('register', { title: 'Create Account - DoDash' });
    },

    async getDashboardPage(req, res, next) {
        try {
            const userId = req.user.user_id;

            const [notStartedTasks, inProgressTasks, completedTasksResult] = await Promise.all([
                TasksModel.fillernotstarted(userId, {}),
                TasksModel.fillerinprogress(userId, {}),
                TasksModel.fillercompleted(userId, { orderBy: 'created_at', orderDir: 'DESC' })
            ]);

            let tasksToDo = [...notStartedTasks.data, ...inProgressTasks.data];

            // --- (สำคัญ) ส่วน Logic การเรียงลำดับใหม่ ---
            const priorityMap = { 'EXTREME': 3, 'MODERATE': 2, 'LOW': 1 };

            tasksToDo.sort((a, b) => {
                // 1. เรียงตาม due_at ก่อน (น้อยไปมาก)
                const dateA = a.due_at ? new Date(a.due_at) : null;
                const dateB = b.due_at ? new Date(b.due_at) : null;

                if (dateA && !dateB) return -1; // a มีวันที่, b ไม่มี -> a มาก่อน
                if (!dateA && dateB) return 1;  // a ไม่มีวันที่, b มี -> b มาก่อน
                if (dateA && dateB) {
                    if (dateA < dateB) return -1;
                    if (dateA > dateB) return 1;
                }

                // 2. ถ้า due_at เหมือนกัน (หรือไม่มีทั้งคู่) ให้เรียงตาม priority (มากไปน้อย)
                const priorityA = priorityMap[a.priority] || 0;
                const priorityB = priorityMap[b.priority] || 0;
                return priorityB - priorityA;
            });

            res.render('dashboard', { 
                title: 'Dashboard - DoDash',
                user: req.user,
                tasks: tasksToDo,
                completedTasks: completedTasksResult.data
            });

        } catch (error) {
            next(error);
        }
    },

    async handleLogout(req, res) {
        // 1. สั่งให้เบราว์เซอร์ลบ Cookie ที่ชื่อ 'token' ทิ้ง
        res.clearCookie('token');
        
        // 2. สั่งให้เบราว์เซอร์ Redirect กลับไปที่หน้า Login
        res.redirect('/login');
    },

    // --- ส่วนจัดการข้อมูลจากฟอร์ม (Form Handling) ---

    async handleLogin(req, res, next) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.render('login', {
                title: 'Login - DoDash',
                error: 'Username and password are required'
            });
        }

        const user = await UsersModel.findByUsername(username);
        if (!user) {
            return res.render('login', {
                title: 'Login - DoDash',
                error: 'Invalid username or password'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash || '');
        if (!isMatch) {
            return res.render('login', {
                title: 'Login - DoDash',
                error: 'Invalid username or password'
            });
        }

        // --- ส่วนที่ Login สำเร็จ (เหมือนเดิม) ---
        const payload = {
            user_id: user.user_id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');

    } catch (e) {
        next(e);
    }
},


    



    async handleRegister(req, res, next) {
        try {
            const { firstName, lastName, username, email, password, confirmPassword } = req.body;
            if (!firstName || !lastName || !username || !email || !password) return res.status(400).send('Missing required fields');
            if (password !== confirmPassword) return res.status(400).send('Passwords do not match');

            const password_hash = await bcrypt.hash(password, 10);
            
            try {
                await UsersModel.create({ 
                    first_name: firstName, 
                    last_name: lastName, 
                    username, 
                    email, 
                    password_hash 
                });
            } catch (dbErr) {
                if (dbErr.code === 'ER_DUP_ENTRY') return res.status(400).send('Username or email already exists');
                throw dbErr;
            }
            
            res.redirect('/login?registered=success');
        } catch (e) { 
            next(e); 
        }
    },

    // ================================================================
    // ส่วนที่ 3: ฟังก์ชันสำหรับ API (โค้ดเดิมของคุณที่นำกลับมา)
    // ================================================================

    /**
     * @description    (API) อัปเดตข้อมูลผู้ใช้ที่ Login อยู่
     * @route          PUT /users/me (ตัวอย่าง)
     */
    async update(req, res, next) {
        try {
            // req.user.user_id จะมาจาก authMiddleware
            const user_id = req.user.user_id; 
            const { first_name, last_name, username, email, password } = req.body;

            if (!first_name || !last_name || !username || !email) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            let password_hash = null;
            if (password) {
                password_hash = await bcrypt.hash(password, 10);
            }

            const ok = await UsersModel.update(user_id, {
                first_name,
                last_name,
                username,
                email,
                password_hash
            });

            if (!ok) return res.status(404).json({ error: 'User not found' });

            const user = await UsersModel.findById(user_id);
            res.json(user); // ตอบกลับเป็น JSON
        } catch (e) { 
            next(e); 
        }
    },

    /**
     * @description    (API) ลบผู้ใช้ที่ Login อยู่
     * @route          DELETE /users/me (ตัวอย่าง)
     */
    async removeMe(req, res, next) {
        try {
            const ok = await UsersModel.remove(req.user.user_id);
            if (!ok) return res.status(404).json({ error: 'User not found' });
            res.status(204).end(); // ตอบกลับว่าสำเร็จแต่ไม่มีเนื้อหา
        } catch (e) { 
            next(e); 
        }
    }
};

module.exports = { UsersController };

