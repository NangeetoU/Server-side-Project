// routes/pageRoutes.js

const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

// เมื่อมี request มาที่ URL ราก (/) ให้เรียกใช้ฟังก์ชัน getHomePage จาก pageController
router.get('/', pageController.getHomePage);
// Route ใหม่สำหรับหน้า Login
router.get('/login', pageController.getLoginPage);
//  เพิ่ม Route นี้เข้าไปใหม่สำหรับรับข้อมูลจากฟอร์ม (POST request)
router.post('/login', pageController.handleLogin);


module.exports = router;