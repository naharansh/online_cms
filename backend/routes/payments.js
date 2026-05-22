const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

router.post('/create-payment', authenticate, async (req, res) => {
  try {
    const { course_id, amount, payment_method } = req.body;
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const [result] = await pool.query(
      'INSERT INTO payments (user_id, course_id, amount, payment_method, transaction_id, payment_status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, course_id, amount, payment_method, transactionId, 'completed']
    );

    await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
      [req.user.id, course_id]
    );

    res.status(201).json({
      message: 'Payment successful',
      payment: { id: result.insertId, transaction_id: transactionId }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/history', authenticate, async (req, res) => {
  try {
    const [payments] = await pool.query(
      `SELECT p.*, c.title as course_title
       FROM payments p
       JOIN courses c ON p.course_id = c.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/revenue', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [revenue] = await pool.query(
      'SELECT SUM(amount) as total_revenue, COUNT(*) as total_transactions FROM payments WHERE payment_status = "completed"'
    );
    res.json(revenue[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
