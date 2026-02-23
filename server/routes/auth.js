const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const protect = require('../middleware/auth');
const resetTokens = {};

// ---- LOGIN ----
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (email.toLowerCase() !== process.env.ADMIN_EMAIL?.toLowerCase()) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: 'admin', email: process.env.ADMIN_EMAIL, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    res.json({
      success: true,
      token,
      admin: {
        email: process.env.ADMIN_EMAIL,
        name: process.env.RESTAURANT_NAME,
        role: 'admin',
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Login failed' });
  }
});

// ---- ME ----
router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    admin: {
      email: process.env.ADMIN_EMAIL,
      name: process.env.RESTAURANT_NAME,
      role: 'admin',
    },
  });
});

// ---- LOGOUT ----
router.post('/logout', protect, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ---- SETUP ----
router.post('/setup', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'Setup only available in development' });
  }
  const { password } = req.body;
  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }
  const hash = await bcrypt.hash(password, 10);
  res.json({
    success: true,
    message: 'Copy this hash into your .env file as ADMIN_PASSWORD_HASH',
    hash,
  });
});

// ---- FORGOT PASSWORD ----
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (email.toLowerCase() !== process.env.ADMIN_EMAIL?.toLowerCase()) {
      return res.status(404).json({ message: 'Email not found' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000;
    resetTokens[token] = { email, expires };

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const resetUrl = `${process.env.ADMIN_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset — Taste of West Africa Admin',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background:#C4622D;color:white;padding:12px 24px;border-radius:4px;text-decoration:none;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, ignore this email.</p>
      `,
    });
    res.json({ success: true, message: 'Reset link sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to send reset email' });
  }
});

// ---- RESET PASSWORD ----
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const record = resetTokens[token];
    if (!record) return res.status(400).json({ message: 'Invalid or expired reset token' });
    if (Date.now() > record.expires) {
      delete resetTokens[token];
      return res.status(400).json({ message: 'Reset token has expired' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    delete resetTokens[token];
    res.json({
      success: true,
      hash,
      message: 'Update ADMIN_PASSWORD_HASH in your environment variables',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

module.exports = router;