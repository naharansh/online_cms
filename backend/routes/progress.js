const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.post('/lesson', authenticate, async (req, res) => {
  try {
    const { lesson_id, watched_seconds, is_completed } = req.body;
    const [existing] = await pool.query(
      'SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?',
      [req.user.id, lesson_id]
    );
    if (existing.length > 0) {
      await pool.query(
        'UPDATE lesson_progress SET watched_seconds = ?, is_completed = ?, completed_at = ? WHERE id = ?',
        [watched_seconds, is_completed || false, is_completed ? new Date() : null, existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO lesson_progress (user_id, lesson_id, watched_seconds, is_completed, completed_at) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, lesson_id, watched_seconds, is_completed || false, is_completed ? new Date() : null]
      );
    }

    const [lesson] = await pool.query('SELECT module_id FROM lessons WHERE id = ?', [lesson_id]);
    const [moduleInfo] = await pool.query('SELECT course_id FROM modules WHERE id = ?', [lesson[0].module_id]);

    const [totalLessons] = await pool.query(
      'SELECT COUNT(*) as total FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.course_id = ?',
      [moduleInfo[0].course_id]
    );
    const [completedLessons] = await pool.query(
      `SELECT COUNT(*) as completed FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       JOIN modules m ON l.module_id = m.id
       WHERE m.course_id = ? AND lp.user_id = ? AND lp.is_completed = TRUE`,
      [moduleInfo[0].course_id, req.user.id]
    );

    const progress = totalLessons[0].total > 0
      ? Math.round((completedLessons[0].completed / totalLessons[0].total) * 100)
      : 0;

    const isCourseCompleted = progress === 100;
    await pool.query(
      'UPDATE enrollments SET progress = ?, is_completed = ?, completed_at = ? WHERE user_id = ? AND course_id = ?',
      [progress, isCourseCompleted, isCourseCompleted ? new Date() : null, req.user.id, moduleInfo[0].course_id]
    );

    res.json({ progress, is_completed: isCourseCompleted });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const [progress] = await pool.query(
      `SELECT lp.*, l.title as lesson_title, l.video_duration
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       JOIN modules m ON l.module_id = m.id
       WHERE m.course_id = ? AND lp.user_id = ?
       ORDER BY l.order_index`,
      [req.params.courseId, req.user.id]
    );
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
