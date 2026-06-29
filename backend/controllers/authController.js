const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Authenticate admin user and get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }

    const adminEmailsRaw = process.env.ADMIN_EMAILS;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    
    // 2. Check if admin credentials exist in env
    if (!adminEmailsRaw || !adminPasswordHash) {
      return res.status(500).json({ error: 'Admin authentication is not configured on the server.' });
    }

    const adminEmails = adminEmailsRaw.split(',').map(e => e.trim().toLowerCase());

    // 3. Verify email exists in allowed admins
    if (!adminEmails.includes(email.trim().toLowerCase())) {
      return res.status(401).json({ error: 'Access denied. Admins only.' });
    }

    // 4. Verify password
    const isMatch = await bcrypt.compare(password, adminPasswordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    // 5. Generate JWT token
    const token = jwt.sign(
      { role: 'admin', email: email.trim().toLowerCase() },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during authentication.' });
  }
};

module.exports = {
  login
};
