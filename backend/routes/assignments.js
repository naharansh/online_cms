const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const [assignments] = await pool.query(
      `SELECT a.*,
        (SELECT id FROM assignment_submissions WHERE assignment_id = a.id AND student_id = ?) as submission_id,
        (SELECT score FROM assignment_submissions WHERE assignment_id = a.id AND student_id = ?) as my_score,
        (SELECT feedback FROM assignment_submissions WHERE assignment_id = a.id AND student_id = ?) as my_feedback,
        (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as submission_count,
        (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id AND score IS NOT NULL) as graded_count
      FROM assignments a WHERE a.course_id = ? ORDER BY a.created_at DESC`,
      [req.user.id, req.user.id, req.user.id, req.params.courseId]
    );
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authenticate, authorize('instructor'), upload.single('file'), async (req, res) => {
  try {
    const { course_id, title, description, deadline, max_score } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const [result] = await pool.query(
      'INSERT INTO assignments (course_id, instructor_id, title, description, file_url, deadline, max_score) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [course_id, req.user.id, title, description, fileUrl, deadline, max_score || 100]
    );
    res.status(201).json({ message: 'Assignment created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/submit/:assignmentId', authenticate, authorize('student'), upload.single('file'), async (req, res) => {
  try {
    const { submission_text } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const [existing] = await pool.query(
      'SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?',
      [req.params.assignmentId, req.user.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already submitted' });
    }
    await pool.query(
      'INSERT INTO assignment_submissions (assignment_id, student_id, file_url, submission_text) VALUES (?, ?, ?, ?)',
      [req.params.assignmentId, req.user.id, fileUrl, submission_text]
    );
    res.status(201).json({ message: 'Assignment submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/grade/:submissionId', authenticate, authorize('instructor'), async (req, res) => {
  try {
    const { score, feedback } = req.body;
    await pool.query(
      'UPDATE assignment_submissions SET score = ?, feedback = ?, graded_at = NOW() WHERE id = ?',
      [score, feedback, req.params.submissionId]
    );
    res.json({ message: 'Assignment graded' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/submissions/:assignmentId', authenticate, authorize('instructor'), async (req, res) => {
  try {
    const [submissions] = await pool.query(
      `SELECT s.*, u.name as student_name, u.email as student_email
       FROM assignment_submissions s
       JOIN users u ON s.student_id = u.id
       WHERE s.assignment_id = ?
       ORDER BY s.submitted_at DESC`,
      [req.params.assignmentId]
    );
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
