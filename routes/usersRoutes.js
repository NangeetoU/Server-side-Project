/**
 * @file        usersRoutes.js
 * @description ไฟล์นี้จะจัดการ "ทุกเส้นทาง" ที่เกี่ยวข้องกับผู้ใช้ (Users)
 */

const express = require('express');
const router = express.Router();
// เราจะเรียกใช้ Controller ที่จัดการเรื่อง User โดยเฉพาะ
const { UsersController } = require('../controllers/usersController');

// ==========================================================
// ส่วนที่ 1: เส้นทางสำหรับ "หน้าเว็บ" (Web Pages)
// ==========================================================

// GET /login: เส้นทางสำหรับ "แสดง" หน้า Login
router.get('/login', UsersController.getLoginPage);

// POST /login: เส้นทางสำหรับ "รับข้อมูล" จากฟอร์ม Login
router.post('/login', UsersController.handleLogin);

// GET /register: เส้นทางสำหรับ "แสดง" หน้า Register (ที่เพิ่มเข้ามาใหม่)
router.get('/register', UsersController.getRegisterPage);

// POST /register: เส้นทางสำหรับ "รับข้อมูล" จากฟอร์ม Register (ที่เพิ่มเข้ามาใหม่)
router.post('/register', UsersController.handleRegister);


// ================================================================
// ส่วนที่ 2: เส้นทางสำหรับ API (โค้ดเดิมของคุณ สำหรับอนาคต)
// ================================================================

// Get user by id (GET /users/:id)
// หมายเหตุ: ใน app.js ควรเรียกใช้ route นี้ด้วย path /users 
// เช่น app.use('/users', usersApiRoutes);
router.get('/users/:id', UsersController.getById);

// Update user (PUT /users/:id)
router.put('/users/:id', UsersController.update);

// Delete user (DELETE /users/:id)
router.delete('/users/:id', UsersController.remove);

module.exports = router;

