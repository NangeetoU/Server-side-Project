const express = require('express');
require('dotenv').config();

// Import Route ที่เราสร้างขึ้น
const { testConnection } = require('./config/database');
const usersRoutes = require('./routes/usersRoutes');
const pageRoutes = require('./routes/pageRoutes');

const app = express();
const port = 3000;

// ตั้งค่า Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Mount routes
app.use('/', pageRoutes);
app.use('/users', usersRoutes);

// เริ่มทำงานเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    testConnection();
});
