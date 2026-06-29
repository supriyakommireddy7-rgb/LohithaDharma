const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

    // 3. Re-verify that the decoded email is still in the ADMIN_EMAILS list
    const adminEmailsRaw = process.env.ADMIN_EMAILS;
    if (!adminEmailsRaw) {
      return res.status(500).json({ error: 'Admin authentication is not configured.' });
    }

    const adminEmails = adminEmailsRaw.split(',').map(e => e.trim().toLowerCase());
    
    if (!decoded.email || !adminEmails.includes(decoded.email.toLowerCase())) {
      return res.status(401).json({ error: 'Access denied. Admin email not allowed or revoked.' });
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden. Admin role required.' });
    }

    // 4. Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
  }
};

module.exports = { authMiddleware };
