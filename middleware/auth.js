const jwt = require('jsonwebtoken');

function requireUser(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing Authorization' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const uid = decoded.user_id ?? decoded.id ?? decoded.userId;
    if (uid == null) return res.status(401).json({ error: 'Invalid token payload' });

    req.user = { ...decoded, user_id: Number(uid) };
    console.log('[auth] ok user_id =', req.user.user_id);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
module.exports = { requireUser };
