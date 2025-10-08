// middleware/auth.js

const jwt = require('jsonwebtoken');

function requireUser(req, res, next) {
    // เปลี่ยนจาก req.headers.authorization มาเป็น req.cookies.token
    const token = req.cookies.token; 

    if (!token) {
        // ถ้าไม่มี token ให้ redirect กลับไปหน้า login แทนการส่ง JSON error
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const uid = decoded.user_id ?? decoded.id ?? decoded.userId;
        if (uid == null) {
            // ถ้า token เพี้ยน ก็ให้กลับไป login ใหม่
            return res.redirect('/login'); 
        }

        req.user = { ...decoded, user_id: Number(uid) };
        console.log('[auth] ok user_id =', req.user.user_id);
        next(); // ผ่าน! ไปยังหน้า dashboard ได้
    } catch (e) {
        // ถ้า token หมดอายุหรือผิดพลาด ก็ให้กลับไป login ใหม่
        return res.redirect('/login');
    }
}

module.exports = { requireUser };