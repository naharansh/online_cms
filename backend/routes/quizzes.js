const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const [quizzes] = await pool.query(
      `SELECT q.*,
        (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count,
        (SELECT id FROM quiz_results WHERE quiz_id = q.id AND student_id = ? ORDER BY attempt_number DESC LIMIT 1) as attempt_id,
        (SELECT score FROM quiz_results WHERE quiz_id = q.id AND student_id = ? ORDER BY attempt_number DESC LIMIT 1) as my_score,
        (SELECT attempt_number FROM quiz_results WHERE quiz_id = q.id AND student_id = ? ORDER BY attempt_number DESC LIMIT 1) as my_attempts
      FROM quizzes q WHERE q.course_id = ? ORDER BY q.created_at DESC`,
      [req.user.id, req.user.id, req.user.id, req.params.courseId]
    );
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authenticate, authorize('instructor'), async (req, res) => {
  try {
    const { course_id, title, description, time_limit, passing_score, max_attempts, is_randomized } = req.body;
    const [result] = await pool.query(
      'INSERT INTO quizzes (course_id, instructor_id, title, description, time_limit, passing_score, max_attempts, is_randomized) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [course_id, req.user.id, title, description, time_limit, passing_score || 50, max_attempts || 1, is_randomized || false]
    );
    res.status(201).json({ message: 'Quiz created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/questions/:quizId', authenticate, authorize('instructor'), async (req, res) => {
  try {
    const { questions } = req.body;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await pool.query(
        'INSERT INTO quiz_questions (quiz_id, question, question_type, options, correct_answer, points, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.params.quizId, q.question, q.question_type || 'multiple_choice', JSON.stringify(q.options), q.correct_answer, q.points || 1, i]
      );
    }
    res.status(201).json({ message: 'Questions added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/questions/:quizId', authenticate, async (req, res) => {
  try {
    const [quiz] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [req.params.quizId]);
    const [questions] = await pool.query('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index', [req.params.quizId]);
    res.json({ quiz: quiz[0], questions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/submit/:quizId', authenticate, authorize('student'), async (req, res) => {
  try {
    const { answers } = req.body;
    const [quiz] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [req.params.quizId]);
    const [questions] = await pool.query('SELECT * FROM quiz_questions WHERE quiz_id = ?', [req.params.quizId]);

    const [existingAttempts] = await pool.query(
      'SELECT COUNT(*) as count FROM quiz_results WHERE quiz_id = ? AND student_id = ?',
      [req.params.quizId, req.user.id]
    );

    if (existingAttempts[0].count >= quiz[0].max_attempts) {
      return res.status(400).json({ message: 'Maximum attempts reached' });
    }

    let score = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correct_answer) {
        score += q.points;
      }
    }

    const totalQuestions = questions.length;
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    const [result] = await pool.query(
      'INSERT INTO quiz_results (quiz_id, student_id, score, total_questions, answers, completed_at, attempt_number) VALUES (?, ?, ?, ?, ?, NOW(), ?)',
      [req.params.quizId, req.user.id, score, totalQuestions, JSON.stringify(answers), existingAttempts[0].count + 1]
    );

    const passed = score >= quiz[0].passing_score;
    res.status(201).json({
      message: 'Quiz submitted',
      resultId: result.insertId,
      score,
      totalPoints,
      passed,
      percentage: Math.round((score / totalPoints) * 100)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
