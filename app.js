// app.js

const express = require('express');
const app = express();
const port = 3000;

// Import Route ที่เราสร้างขึ้น
const pageRoutes = require('./routes/pageRoutes');

// ตั้งค่า Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
// 👇 เพิ่มบรรทัดนี้เพื่อให้ Express อ่านข้อมูลจากฟอร์มได้
app.use(express.urlencoded({ extended: true }));
app.use('/', pageRoutes);

// เริ่มทำงานเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});