const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, profile_image, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, bio } = req.body;
    await pool.query('UPDATE users SET name = ?, bio = ? WHERE id = ?', [name, bio, req.user.id]);
    res.json({ message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ message: 'Password changed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { is_active } = req.body;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, req.params.id]);
    res.json({ message: 'User status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
