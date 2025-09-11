
exports.getHomePage = (req, res) => {
    

    const pageData = {
        title: "DoDash - Get things done!",
        heading: "DoDash",
        description: `Ready to turn your "to-do" list into a "to-done" list? 
                    Stop feeling overwhelmed and start taking control of your day. 
                    Our simple, beautiful, and powerful platform helps you organize your tasks, 
                    crush your goals, and reclaim your peace of mind. Get more done, with less stress.`
    };

    // สั่งให้ render ไฟล์ index.ejs 
    res.render('index', pageData);
};

// ฟังก์ชันใหม่สำหรับ Render หน้า Login
exports.getLoginPage = (req, res) => {
    res.render('login', { title: 'Login - DoDash' });
};

exports.handleLogin = (req, res) => {
    // req.body จะมีข้อมูลที่ส่งมาจากฟอร์ม
    // ซึ่งจะมี key ตรงกับ attribute 'name' ที่เราตั้งไว้ใน HTML
    const username = req.body.username;
    const password = req.body.password;

    console.log('Login attempt with:');
    console.log('Username:', username);
    console.log('Password:', password);

    // --- ส่วนของ Database Logic จะอยู่ตรงนี้ ---
    // ในอนาคต เราจะนำ username ไปค้นหาในฐานข้อมูล
    // แล้วเปรียบเทียบ password ที่เข้ารหัสไว้
    // ถ้าถูกต้อง ก็จะสร้าง Session และ redirect ไปหน้า dashboard
    // -----------------------------------------

    // ตอนนี้ ให้ส่งข้อความกลับไปก่อนว่าได้รับข้อมูลแล้ว
    res.send(`Thank you for logging in, ${username}!`);
};

exports.getRegisterPage = (req, res) => {
    res.render('register', {
        title: "Register - DoDash"
    });
};

exports.handleRegister = (req, res) => {
    // ดึงข้อมูลทั้งหมดที่ถูกส่งมาจากฟอร์มผ่าน req.body
    const { firstName, lastName, username, email, password, confirmPassword } = req.body;

    // แสดงข้อมูลที่ได้รับใน Console ของ Server เพื่อตรวจสอบ
    console.log('New user registration:');
    console.log({ firstName, lastName, username, email });

    // --- ส่วนตรรกะสำหรับฐานข้อมูล (จะทำในอนาคต) ---
    // 1. ตรวจสอบว่า password และ confirmPassword ตรงกันหรือไม่
    // 2. ตรวจสอบว่า username หรือ email นี้มีในระบบแล้วหรือยัง
    // 3. ทำการเข้ารหัส (Hash) password ก่อนบันทึก
    // 4. บันทึกข้อมูลผู้ใช้ใหม่ลงในฐานข้อมูล
    // ---------------------------------------------

    // ส่งข้อความกลับไปหาผู้ใช้เพื่อยืนยัน
    res.send(`Welcome, ${firstName}! Your account has been created.`);
};