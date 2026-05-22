const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/:courseId', authenticate, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const [maxOrder] = await pool.query('SELECT MAX(order_index) as max FROM modules WHERE course_id = ?', [req.params.courseId]);
    const orderIndex = (maxOrder[0].max || 0) + 1;
    const [result] = await pool.query(
      'INSERT INTO modules (course_id, title, description, order_index) VALUES (?, ?, ?, ?)',
      [req.params.courseId, title, description, orderIndex]
    );
    res.status(201).json({ message: 'Module created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', authenticate, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const { title, description, order_index } = req.body;
    await pool.query('UPDATE modules SET title = ?, description = ?, order_index = ? WHERE id = ?',
      [title, description, order_index, req.params.id]);
    res.json({ message: 'Module updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', authenticate, authorize('instructor', 'admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM modules WHERE id = ?', [req.params.id]);
    res.json({ message: 'Module deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/:moduleId/lessons', authenticate, authorize('instructor', 'admin'), upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'notes', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, video_duration, is_free } = req.body;
    const videoUrl = req.files?.video ? `/uploads/${req.files.video[0].filename}` : null;
    const notesUrl = req.files?.notes ? `/uploads/${req.files.notes[0].filename}` : null;

    const [maxOrder] = await pool.query('SELECT MAX(order_index) as max FROM lessons WHERE module_id = ?', [req.params.moduleId]);
    const orderIndex = (maxOrder[0].max || 0) + 1;

    const [result] = await pool.query(
      'INSERT INTO lessons (module_id, title, description, video_url, video_duration, notes_url, order_index, is_free) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.params.moduleId, title, description, videoUrl, video_duration, notesUrl, orderIndex, is_free || false]
    );
    res.status(201).json({ message: 'Lesson created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/lessons/:id', authenticate, authorize('instructor', 'admin'), upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'notes', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, video_duration, is_free, order_index } = req.body;
    const videoUrl = req.files?.video ? `/uploads/${req.files.video[0].filename}` : undefined;
    const notesUrl = req.files?.notes ? `/uploads/${req.files.notes[0].filename}` : undefined;

    const updates = [];
    const params = [];
    if (title) { updates.push('title = ?'); params.push(title); }
    if (description) { updates.push('description = ?'); params.push(description); }
    if (videoUrl) { updates.push('video_url = ?'); params.push(videoUrl); }
    if (video_duration) { updates.push('video_duration = ?'); params.push(video_duration); }
    if (notesUrl) { updates.push('notes_url = ?'); params.push(notesUrl); }
    if (is_free !== undefined) { updates.push('is_free = ?'); params.push(is_free); }
    if (order_index !== undefined) { updates.push('order_index = ?'); params.push(order_index); }

    if (updates.length > 0) {
      params.push(req.params.id);
      await pool.query(`UPDATE lessons SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    res.json({ message: 'Lesson updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/lessons/:id', authenticate, authorize('instructor', 'admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM lessons WHERE id = ?', [req.params.id]);
    res.json({ message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
