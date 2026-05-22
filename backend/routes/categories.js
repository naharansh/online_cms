const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT c.*, (SELECT COUNT(*) FROM courses WHERE category_id = c.id) as course_count FROM categories c ORDER BY c.name'
    );
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await pool.query('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);
    res.status(201).json({ message: 'Category created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
