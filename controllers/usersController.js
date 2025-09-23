/**
 * @file        usersController.js
 * @description Controller นี้จะรับผิดชอบทุกอย่างที่เกี่ยวข้องกับผู้ใช้ (Users)
 */

const bcrypt = require('bcryptjs');
const { UsersModel } = require('../models/usersModel');

const UsersController = {

    // ==========================================================
    // ส่วนที่ 1: ฟังก์ชันสำหรับ "แสดงผล" หน้าเว็บ (Render Views)
    // ==========================================================

    getLoginPage(req, res) {
        res.render('login', { title: 'Login - DoDash' });
    },

    getRegisterPage(req, res) {
        res.render('register', { title: 'Create Account - DoDash' });
    },

    /**
     * @description    (ฟังก์ชันที่เพิ่มเข้ามาใหม่) แสดงหน้า Dashboard
     * @route          GET /dashboard
     * @purpose        หลังจาก Login สำเร็จ ฟังก์ชันนี้จะทำหน้าที่ render หน้า dashboard.ejs
     */
    
    getDashboardPage(req, res) {
        // --- (ส่วนที่แก้ไข) ---
        // ในอนาคต ข้อมูลนี้จะมาจากฐานข้อมูลและ Session ของผู้ใช้ที่ Login อยู่
        // แต่ตอนนี้ เราจะสร้าง "ข้อมูลจำลอง" (Mock Data) ขึ้นมาเพื่อให้หน้าเว็บแสดงผลได้ก่อน
        const mockUser = {
            first_name: 'Nangee',
            last_name: 'ToU',
            email: 'nangee@example.com'
        };

        const mockTasks = [
            { title: 'Design Landing Page', description: 'Create a stunning design in Figma.' },
            { title: 'Develop API Endpoints', description: 'Build all necessary routes for tasks.' }
        ];

        const mockCompletedTasks = [
            { title: 'Setup Project Structure' }
        ];

        // ส่งข้อมูลทั้งหมดนี้ไปให้ไฟล์ dashboard.ejs
        res.render('dashboard', { 
            title: 'Dashboard - DoDash',
            user: mockUser,
            tasks: mockTasks,
            completedTasks: mockCompletedTasks
        });
    },


    // ============================================================
    // ส่วนที่ 2: ฟังก์ชันสำหรับ "รับข้อมูล" จากฟอร์ม (Handle Forms)
    // ============================================================

    /**
     * @description    (แก้ไขใหม่) รับข้อมูลการเข้าสู่ระบบและตรวจสอบกับฐานข้อมูล
     * @route          POST /login
     */
    async handleLogin(req, res, next) {
        try {
            const { username, password } = req.body;

            // 1. ค้นหาผู้ใช้ในฐานข้อมูลด้วย username ที่กรอกเข้ามา
            // (เราต้องมั่นใจว่าในไฟล์ models/usersModel.js มีฟังก์ชัน findByUsername)
            const user = await UsersModel.findByUsername(username);

            // 2. ถ้าไม่พบผู้ใช้ในระบบ ให้ส่งข้อความแจ้งเตือน
            // (เพื่อความปลอดภัย เราจะใช้ข้อความเดียวกันทั้งกรณี username ผิดและ password ผิด)
            if (!user) {
                return res.status(401).send('Invalid username or password');
            }

            // 3. เปรียบเทียบรหัสผ่านที่ผู้ใช้กรอก (password) กับรหัสผ่านที่ถูกเข้ารหัส (hash) ไว้ในฐานข้อมูล (user.password_hash)
            const isMatch = await bcrypt.compare(password, user.password_hash);

            // 4. ถ้ารหัสผ่านไม่ตรงกัน ให้ส่งข้อความแจ้งเตือน
            if (!isMatch) {
                return res.status(401).send('Invalid username or password');
            }

            // 5. ถ้าทุกอย่างถูกต้อง (Login สำเร็จ) ให้ redirect ไปหน้า Dashboard
            // TODO: ในอนาคต เราจะสร้าง Session ของผู้ใช้ก่อนที่จะ redirect
            
            res.redirect('/dashboard');

        } catch (e) {
            console.error("Error during login:", e);
            next(e);
        }
    },
    
    async handleRegister(req, res, next) {
        try {
            const { firstName, lastName, username, email, password, confirmPassword } = req.body;

            if (!firstName || !lastName || !username || !email || !password) {
                return res.status(400).send('Missing required fields');
            }
            if (password !== confirmPassword) {
                return res.status(400).send('Passwords do not match');
            }

            const password_hash = await bcrypt.hash(password, 10);
            
            await UsersModel.create({ 
                first_name: firstName, 
                last_name: lastName, 
                username, 
                email, 
                password_hash 
            });

            res.redirect('/login');

        } catch (e) { 
            console.error("Error during registration:", e);
            next(e); 
        }
    },


    // ================================================================
    // ส่วนที่ 3: โค้ดเดิมของคุณ (สำหรับจัดการข้อมูลผ่าน API ในอนาคต)
    // ================================================================
    
    async getById(req, res, next) {
        try {
            const id = Number(req.params.id);
            const user = await UsersModel.findById(id);
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        } catch (e) { next(e); }
    },
 
    async update(req, res, next) {
        try {
            const id = Number(req.params.id);
            const { first_name, last_name, username, email, password } = req.body;
            let password_hash = null;
            if (password) {
                password_hash = await bcrypt.hash(password, 10);
            }
            const ok = await UsersModel.update(id, {first_name, last_name, username, email, password_hash});
            if (!ok) {
                return res.status(404).json({ error: 'User not found' });
            }
            const user = await UsersModel.findById(id);
            res.json(user);
        } catch (e) {next(e);}
    },

    async remove(req, res, next) {
        try {
            const id = Number(req.params.id);
            const ok = await UsersModel.remove(id);
            if (!ok) return res.status(404).json({ error: 'User not found' });
            res.status(204).end();
        } catch (e) { next(e); }
    } 
};

module.exports = { UsersController };

