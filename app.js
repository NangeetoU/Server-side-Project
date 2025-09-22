const express = require('express');
require('dotenv').config();

// Import ส่วนต่างๆ ของโปรแกรม
const { testConnection } = require('./config/database');
const pageRoutes = require('./routes/pageRoutes');
const usersRoutes = require('./routes/usersRoutes');

const app = express();
const port = process.env.PORT || 3000;

// ตั้งค่า Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Middleware สำหรับอ่าน JSON (ดีสำหรับ API ในอนาคต)

// --- ส่วนที่แก้ไข ---
// "Mount" หรือ "ประกาศใช้" ไฟล์ Routes ของเรา
app.use('/', pageRoutes);  // จัดการเส้นทาง /
app.use('/', usersRoutes); // บอกให้จัดการเส้นทาง /login, /register โดยไม่ต้องมี prefix

// เริ่มทำงานเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    // ทดสอบการเชื่อมต่อฐานข้อมูลเมื่อเซิร์ฟเวอร์เริ่มทำงาน
    testConnection();
});
