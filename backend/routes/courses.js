const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    let query = `
      SELECT c.*, u.name as instructor_name, u.profile_image as instructor_image,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as student_count,
        (SELECT COUNT(*) FROM modules WHERE course_id = c.id) as module_count
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      WHERE c.is_published = TRUE
    `;
    const params = [];

    if (category) { query += ' AND c.category_id = ?'; params.push(category); }
    if (difficulty) { query += ' AND c.difficulty_level = ?'; params.push(difficulty); }
    if (search) { query += ' AND (c.title LIKE ? OR c.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    query += ' ORDER BY c.created_at DESC';
    const [courses] = await pool.query(query, params);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/instructor', authenticate, authorize('instructor'), async (req, res) => {
  try {
    const [courses] = await pool.query(
      `SELECT c.*,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as student_count,
        (SELECT COUNT(*) FROM modules WHERE course_id = c.id) as module_count
      FROM courses c WHERE c.instructor_id = ? ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [courses] = await pool.query(
      `SELECT c.*, u.name as instructor_name, u.bio as instructor_bio,
        u.profile_image as instructor_image,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as student_count
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ?`,
      [req.params.id]
    );
    if (courses.length === 0) return res.status(404).json({ message: 'Course not found' });

    const [modules] = await pool.query(
      'SELECT * FROM modules WHERE course_id = ? ORDER BY order_index',
      [req.params.id]
    );

    for (let m of modules) {
      const [lessons] = await pool.query(
        'SELECT * FROM lessons WHERE module_id = ? ORDER BY order_index',
        [m.id]
      );
      m.lessons = lessons;
    }

    courses[0].modules = modules;
    res.json(courses[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authenticate, authorize('instructor', 'admin'), upload.single('thumbnail'), async (req, res) => {
  try {
    const { title, description, category_id, price, difficulty_level, language, duration } = req.body;
    const thumbnail = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO courses (title, description, instructor_id, category_id, price, thumbnail, difficulty_level, language, duration)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, req.user.id, category_id || null, price || 0, thumbnail, difficulty_level || 'beginner', language || 'English', duration]
    );

    res.status(201).json({ message: 'Course created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', authenticate, authorize('instructor', 'admin'), upload.single('thumbnail'), async (req, res) => {
  try {
    const course = await pool.query('SELECT * FROM courses WHERE id = ? AND instructor_id = ?', [req.params.id, req.user.id]);
    if (course[0].length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, category_id, price, difficulty_level, language, duration, is_published } = req.body;
    const thumbnail = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updateFields = [];
    const updateParams = [];
    if (title) { updateFields.push('title = ?'); updateParams.push(title); }
    if (description) { updateFields.push('description = ?'); updateParams.push(description); }
    if (category_id) { updateFields.push('category_id = ?'); updateParams.push(category_id); }
    if (price !== undefined) { updateFields.push('price = ?'); updateParams.push(price); }
    if (thumbnail) { updateFields.push('thumbnail = ?'); updateParams.push(thumbnail); }
    if (difficulty_level) { updateFields.push('difficulty_level = ?'); updateParams.push(difficulty_level); }
    if (language) { updateFields.push('language = ?'); updateParams.push(language); }
    if (duration) { updateFields.push('duration = ?'); updateParams.push(duration); }
    if (is_published !== undefined) { updateFields.push('is_published = ?'); updateParams.push(is_published); }

    if (updateFields.length > 0) {
      updateParams.push(req.params.id);
      await pool.query(`UPDATE courses SET ${updateFields.join(', ')} WHERE id = ?`, updateParams);
    }

    res.json({ message: 'Course updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', authenticate, authorize('instructor', 'admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM courses WHERE id = ? AND (instructor_id = ? OR ? = "admin")', [req.params.id, req.user.id, req.user.role]);
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
