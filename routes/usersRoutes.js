/**
 * @file        usersRoutes.js
 * @description ไฟล์นี้จะจัดการ "ทุกเส้นทาง" ที่เกี่ยวข้องกับผู้ใช้ (Users)
 */

const express = require('express');
const router = express.Router();
const { UsersController } = require('../controllers/usersController');

// ==========================================================
// ส่วนที่ 1: เส้นทางสำหรับ "หน้าเว็บ" (Web Pages)
// ==========================================================

// Login routes
router.get('/login', UsersController.getLoginPage);
router.post('/login', UsersController.handleLogin);

// Register routes
router.get('/register', UsersController.getRegisterPage);
router.post('/register', UsersController.handleRegister);

// --- (ส่วนที่เพิ่มเข้ามาใหม่) ---
// GET /dashboard: เส้นทางสำหรับ "แสดง" หน้า Dashboard หลังจาก Login สำเร็จ
router.get('/dashboard', UsersController.getDashboardPage);
// ---------------------------------


// ================================================================
// ส่วนที่ 2: เส้นทางสำหรับ API (โค้ดเดิมของคุณ สำหรับอนาคต)
// ================================================================
router.get('/users/:id', UsersController.getById);
router.put('/users/:id', UsersController.update);
router.delete('/users/:id', UsersController.remove);

module.exports = router;

