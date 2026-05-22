const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  try {
    const { course_id } = req.body;
    const [existing] = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [req.user.id, course_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already enrolled' });
    }
    await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
      [req.user.id, course_id]
    );
    res.status(201).json({ message: 'Enrolled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/my-courses', authenticate, async (req, res) => {
  try {
    const [enrollments] = await pool.query(
      `SELECT e.*, c.title, c.thumbnail, c.difficulty_level, c.duration,
        u.name as instructor_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON c.instructor_id = u.id
      WHERE e.user_id = ?
      ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    );
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/course/:courseId/students', authenticate, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const [students] = await pool.query(
      `SELECT u.id, u.name, u.email, u.profile_image, e.enrolled_at, e.is_completed,
        (SELECT COUNT(*) FROM lesson_progress lp
         JOIN lessons l ON lp.lesson_id = l.id
         JOIN modules m ON l.module_id = m.id
         WHERE m.course_id = ? AND lp.user_id = u.id AND lp.is_completed = TRUE) as completed_lessons,
        (SELECT COUNT(*) FROM lessons l
         JOIN modules m ON l.module_id = m.id
         WHERE m.course_id = ?) as total_lessons,
        (SELECT score FROM assignment_submissions s
         JOIN assignments a ON s.assignment_id = a.id
         WHERE a.course_id = ? AND s.student_id = u.id
         ORDER BY s.graded_at DESC LIMIT 1) as latest_assignment_score,
        (SELECT score FROM quiz_results r
         JOIN quizzes q ON r.quiz_id = q.id
         WHERE q.course_id = ? AND r.student_id = u.id
         ORDER BY r.completed_at DESC LIMIT 1) as latest_quiz_score
      FROM users u
      JOIN enrollments e ON u.id = e.user_id
      WHERE e.course_id = ?
      ORDER BY u.name ASC`,
      [req.params.courseId, req.params.courseId, req.params.courseId, req.params.courseId, req.params.courseId]
    );
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/check/:courseId', authenticate, async (req, res) => {
  try {
    const [enrollment] = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [req.user.id, req.params.courseId]
    );
    res.json({ enrolled: enrollment.length > 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
