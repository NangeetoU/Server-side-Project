// middleware/apiAuth.js
const jwt = require('jsonwebtoken');

/**
 * ฟังก์ชัน Helper (Private) สำหรับตรวจสอบ JWT จาก Cookie
 * - ทำหน้าที่ดึง Token, ตรวจสอบ (verify), และถอดรหัส (decode)
 * - ถ้า Token ถูกต้อง จะคืนค่าข้อมูล user (payload)
 * - ถ้า Token ไม่มี, ไม่ถูกต้อง, หรือหมดอายุ จะคืนค่า null
 * @param {object} req - Express request object
 * @returns {object|null} - ข้อมูล user หรือ null หากไม่สำเร็จ
 */
function _verifyToken(req) {
    const token = req.cookies.token;

    if (!token) {
        return null; // ไม่มี Token
    }

    try {
        // ตรวจสอบและถอดรหัส Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const uid = decoded.user_id ?? decoded.id ?? decoded.userId;

        // ตรวจสอบว่ามี user id ใน payload หรือไม่
        if (uid == null) {
            return null; // Token มีโครงสร้างไม่ถูกต้อง
        }

        // คืนค่าข้อมูล user ที่สมบูรณ์
        return { ...decoded, user_id: Number(uid) };

    } catch (e) {
        // Token ไม่ถูกต้องหรือหมดอายุ
        console.error('JWT Verification Error:', e.message);
        return null;
    }
}

/**
 * Middleware สำหรับ "Web Pages" (เช่น Dashboard, Profile)
 * - หากไม่ผ่านการตรวจสอบสิทธิ์ จะทำการ "redirect" ไปยังหน้า /login
 */
function requireUser(req, res, next) {
    const user = _verifyToken(req);

    if (user) {
        req.user = user;
        console.log('[Auth Web] Access granted for user_id:', req.user.user_id);
        next(); // ผ่าน! ไปยัง Controller ของหน้าเว็บได้
    } else {
        // ถ้าไม่ผ่าน ให้กลับไปหน้า login
        return res.redirect('/login');
    }
}

/**
 * Middleware สำหรับ "API Endpoints"
 * - หากไม่ผ่านการตรวจสอบสิทธิ์ จะตอบกลับเป็น "JSON error" พร้อม status 401
 */
function requireUserApi(req, res, next) {
    const user = _verifyToken(req);

    if (user) {
        req.user = user;
        next(); // ผ่าน! ไปยัง Controller ของ API ได้
    } else {
        // ถ้าไม่ผ่าน ให้ตอบกลับเป็น JSON
        return res.status(401).json({ error: 'Authentication required. Invalid or missing token.' });
    }
}

module.exports = {
    requireUser,
    requireUserApi
};