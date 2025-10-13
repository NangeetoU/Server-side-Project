// middleware/apiAuth.js
const jwt = require('jsonwebtoken');

function requireUserApi(req, res, next) {
    const token = req.cookies.token; 

    // ถ้าไม่มี token ให้ตอบกลับเป็น JSON error (ไม่ใช่ redirect)
    if (!token) {
        return res.status(401).json({ error: 'Missing authorization token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const uid = decoded.user_id ?? decoded.id ?? decoded.userId;

        if (uid == null) {
            return res.status(401).json({ error: 'Invalid token payload' });
        }

        req.user = { ...decoded, user_id: Number(uid) };
        next(); // ผ่าน! ไปยัง Controller ของ API ได้

    } catch (e) {
        // ถ้า token หมดอายุหรือผิดพลาด ให้ตอบกลับเป็น JSON error
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = { requireUserApi };