/**
 * @file        pageRoutes.js
 * @description ไฟล์นี้จะจัดการเฉพาะเส้นทางของหน้าเว็บทั่วไปที่ไม่ใช่ระบบสมาชิก
 * ซึ่งในตอนนี้มีเพียงหน้าแรก (Home Page) เท่านั้น
 */

const express = require('express');
const router = express.Router();

// เรียกใช้ Controller ที่รับผิดชอบหน้าเว็บทั่วไป
const pageController = require('../controllers/pageController');

// GET /: สร้างเส้นทางสำหรับหน้าแรกของเว็บไซต์
// เมื่อมี request มาที่ URL ราก ('/') ให้เรียกใช้ฟังก์ชัน getHomePage จาก pageController
router.get('/', pageController.getHomePage);

// ส่งออก router เพื่อให้ app.js สามารถเรียกใช้งานได้
module.exports = router;

