/**
 * @file        usersRoutes.js
 * @description ไฟล์นี้จะจัดการ "ทุกเส้นทาง" ที่เกี่ยวข้องกับผู้ใช้ (Users)
 */

const express = require('express');
const router = express.Router();
// เราจะเรียกใช้ Controller ที่จัดการเรื่อง User โดยเฉพาะ
const { UsersController } = require('../controllers/usersController');
const { requireUser: authMiddleware } = require('../middleware/auth');


// ==========================================================
// ส่วนที่ 1: เส้นทางสำหรับ "หน้าเว็บ" (Web Pages)
// ==========================================================

// GET /login: เส้นทางสำหรับ "แสดง" หน้า Login
router.get('/login', UsersController.getLoginPage);

// POST /login: เส้นทางสำหรับ "รับข้อมูล" จากฟอร์ม Login
router.post('/login', UsersController.handleLogin);

// GET /register: เส้นทางสำหรับ "แสดง" หน้า Register
router.get('/register', UsersController.getRegisterPage);

// POST /register: เส้นทางสำหรับ "รับข้อมูล" จากฟอร์ม Register
router.post('/register', UsersController.handleRegister);

// GET /dashboard: เส้นทางนี้ถูกป้องกันโดย "ยาม" (authMiddleware) แล้ว
// ใช้ชื่อ requireUser ที่ import เข้ามาโดยตรง
router.get('/dashboard', authMiddleware, UsersController.getDashboardPage);

router.put('/users/me', authMiddleware, UsersController.update); 

// GET /logout: เส้นทางสำหรับ Logout
router.get('/logout', UsersController.handleLogout);
// ================================================================
// ส่วนที่ 2: เส้นทางสำหรับ API (จะถูกนำกลับมาใช้ในอนาคต)
// ตอนนี้เราจะคอมเมนต์ออกไปก่อนเพื่อป้องกัน Error
// ================================================================

// router.get('/api/users/:id', authMiddleware, UsersController.getById);
// router.put('/api/users/me', authMiddleware, UsersController.update);
// router.delete('/api/users/me', authMiddleware, UsersController.removeMe);


module.exports = router;

