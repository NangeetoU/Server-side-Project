// app.js
const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// --- Imports ---
const { testConnection } = require('./config/database');
const pageRoutes  = require('./routes/pageRoutes');
const usersRoutes = require('./routes/usersRoutes');
const tasksRoutes = require('./routes/tasksRoutes');
const remindersRoutes = require('./routes/remindersRoutes');

const app  = express();
const port = process.env.PORT || 3000;

// --- Middlewares ---
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

// --- Mount API routes FIRST ---
app.use('/users', usersRoutes);   // -> /users/register, /users/login, /users/...
app.use('/tasks', tasksRoutes);   // -> /tasks/...
app.use('/api/reminders', remindersRoutes);

// --- Mount page routes LAST ---
app.use('/', pageRoutes);         // -> หน้าเว็บปกติ เช่น '/', '/about', ฯลฯ
app.use('/', usersRoutes); 

// --- 404 fallback (สำหรับเส้นทางที่ไม่ match อะไรเลย) ---
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl, method: req.method });
});

// --- Start server ---
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  testConnection();
  const { checkDueTasks } = require('./jobs/reminderChecker');
});


