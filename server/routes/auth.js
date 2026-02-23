const crypto = require('crypto');

// Store reset tokens temporarily (in production use Redis or DB)
const resetTokens = {};

// ---- FORGOT PASSWORD ----
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (email.toLowerCase() !== process.env.ADMIN_EMAIL?.toLowerCase()) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour

    resetTokens[token] = { email, expires };

    // Send email
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.ADMIN_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset — Taste of West Africa Admin',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for the admin dashboard.</p>
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

    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (Date.now() > record.expires) {
      delete resetTokens[token];
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Generate new hash
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(newPassword, 10);

    // Clean up token
    delete resetTokens[token];

    res.json({
      success: true,
      message: 'Password reset successful! Update your .env with this hash:',
      hash,
      instruction: `Set ADMIN_PASSWORD_HASH=${hash} in your environment variables`
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});