/**
 * @file        usersController.js
 * @description Controller นี้จะรับผิดชอบทุกอย่างที่เกี่ยวข้องกับผู้ใช้ (Users)
 * ทั้งการแสดงหน้าเว็บ (Login, Register) และการจัดการข้อมูล (สร้าง, แก้ไข, ลบ)
 */

const bcrypt = require('bcryptjs');
// การเรียกใช้งาน Model ซึ่งจะทำหน้าที่เชื่อมต่อและจัดการข้อมูลในตาราง users
const { UsersModel } = require('../models/usersModel');

const UsersController = {

    // ==========================================================
    // ส่วนที่ 1: ฟังก์ชันสำหรับ "แสดงผล" หน้าเว็บ (Render Views)
    // ==========================================================

    /**
     * @description    แสดงหน้า Login
     * @route          GET /login
     */
    getLoginPage(req, res) {
        res.render('login', { title: 'Login - DoDash' });
    },

    /**
     * @description    แสดงหน้า Register
     * @route          GET /register
     */
    getRegisterPage(req, res) {
        res.render('register', { title: 'Create Account - DoDash' });
    },


    // ============================================================
    // ส่วนที่ 2: ฟังก์ชันสำหรับ "รับข้อมูล" จากฟอร์ม (Handle Forms)
    // ============================================================

    /**
     * @description    รับข้อมูลการเข้าสู่ระบบ
     * @route          POST /login
     */
    async handleLogin(req, res, next) {
        try {
            const { username, password } = req.body;
            // --- ส่วนตรรกะสำหรับฐานข้อมูลจะถูกพัฒนาต่อที่นี่ ---
            console.log('Login attempt with:', { username });
            res.send(`Login successful for ${username}! (Dashboard page coming soon)`);
        } catch (e) {
            console.error("Error during login:", e);
            next(e);
        }
    },
    
    /**
     * @description    รับข้อมูลการสมัครสมาชิกใหม่ (ฟังก์ชัน register เดิมที่นำมาปรับปรุง)
     * @route          POST /register
     */
    async handleRegister(req, res, next) {
        try {
            const { firstName, lastName, username, email, password, confirmPassword } = req.body;

            // ตรวจสอบว่ากรอกข้อมูลครบถ้วนหรือไม่
            if (!firstName || !lastName || !username || !email || !password) {
                return res.status(400).send('Missing required fields');
            }
            // ตรวจสอบว่ารหัสผ่านที่กรอก 2 ครั้งตรงกันหรือไม่
            if (password !== confirmPassword) {
                return res.status(400).send('Passwords do not match');
            }

            // เข้ารหัสรหัสผ่าน (Hashing) เพื่อความปลอดภัย
            const password_hash = await bcrypt.hash(password, 10);
            
            // สั่งให้ Model บันทึกข้อมูลผู้ใช้ใหม่ลงฐานข้อมูล
            await UsersModel.create({ 
                first_name: firstName, 
                last_name: lastName, 
                username, 
                email, 
                password_hash 
            });

            // หลังจากบันทึกสำเร็จ ให้ redirect (ส่ง) ผู้ใช้ไปที่หน้า Login
            res.redirect('/login');

        } catch (e) { 
            console.error("Error during registration:", e);
            next(e); 
        }
    },


    // ================================================================
    // ส่วนที่ 3: โค้ดเดิมของคุณ (สำหรับจัดการข้อมูลผ่าน API ในอนาคต)
    // ================================================================

    /**
     * @description    ดึงข้อมูลผู้ใช้ตาม ID
     * @route          GET /users/:id
     */
    async getById(req, res, next) {
        try {
            const id = Number(req.params.id);
            const user = await UsersModel.findById(id);
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        } catch (e) { next(e); }
    },

    /**
     * @description    อัปเดตข้อมูลผู้ใช้ตาม ID
     * @route          PUT /users/:id 
     */
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

    /**
     * @description    ลบผู้ใช้ตาม ID
     * @route          DELETE /users/:id
     */
    async remove(req, res, next) {
        try {
            const id = Number(req.params.id);
            const ok = await UsersModel.remove(id);
            if (!ok) return res.status(404).json({ error: 'User not found' });
            res.status(204).end();
        } catch (e) { next(e); }
    } 
};

// ส่งออก Controller ทั้งหมดเพื่อให้ไฟล์ Route สามารถเรียกใช้งานได้
module.exports = { UsersController };

