const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/lesson/:lessonId', authenticate, async (req, res) => {
  try {
    const [tasks] = await pool.query(
      `SELECT t.*,
        (SELECT id FROM task_submissions WHERE task_id = t.id AND student_id = ?) as submission_id,
        (SELECT score FROM task_submissions WHERE task_id = t.id AND student_id = ?) as my_score,
        (SELECT feedback FROM task_submissions WHERE task_id = t.id AND student_id = ?) as my_feedback,
        (SELECT submission_text FROM task_submissions WHERE task_id = t.id AND student_id = ?) as my_submission
      FROM lesson_tasks t WHERE t.lesson_id = ? ORDER BY t.created_at ASC`,
      [req.user.id, req.user.id, req.user.id, req.user.id, req.params.lessonId]
    );
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authenticate, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const { lesson_id, title, description } = req.body;
    if (!lesson_id || !title) {
      return res.status(400).json({ message: 'Lesson ID and title are required' });
    }
    const [result] = await pool.query(
      'INSERT INTO lesson_tasks (lesson_id, title, description) VALUES (?, ?, ?)',
      [lesson_id, title, description]
    );
    res.status(201).json({ message: 'Task created', id: result.insertId, lesson_id, title, description });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', authenticate, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const { title, description } = req.body;
    await pool.query(
      'UPDATE lesson_tasks SET title = ?, description = ? WHERE id = ?',
      [title, description, req.params.id]
    );
    res.json({ message: 'Task updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', authenticate, authorize('instructor', 'admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM lesson_tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/submit/:taskId', authenticate, authorize('student'), upload.single('file'), async (req, res) => {
  try {
    const { submission_text } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const [existing] = await pool.query(
      'SELECT id FROM task_submissions WHERE task_id = ? AND student_id = ?',
      [req.params.taskId, req.user.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already submitted' });
    }
    await pool.query(
      'INSERT INTO task_submissions (task_id, student_id, file_url, submission_text) VALUES (?, ?, ?, ?)',
      [req.params.taskId, req.user.id, fileUrl, submission_text]
    );
    res.status(201).json({ message: 'Task submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/submissions/:taskId', authenticate, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const [submissions] = await pool.query(
      `SELECT s.*, u.name as student_name, u.email as student_email
       FROM task_submissions s
       JOIN users u ON s.student_id = u.id
       WHERE s.task_id = ?
       ORDER BY s.submitted_at DESC`,
      [req.params.taskId]
    );
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/grade/:submissionId', authenticate, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const { score, feedback } = req.body;
    await pool.query(
      'UPDATE task_submissions SET score = ?, feedback = ?, graded_at = NOW() WHERE id = ?',
      [score, feedback, req.params.submissionId]
    );
    res.json({ message: 'Submission graded' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/course/:courseId', authenticate, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const [modules] = await pool.query(
      'SELECT id, title FROM modules WHERE course_id = ? ORDER BY order_index',
      [req.params.courseId]
    );

    const result = [];

    for (const mod of modules) {
      const [lessons] = await pool.query(
        'SELECT id, title FROM lessons WHERE module_id = ? ORDER BY order_index',
        [mod.id]
      );

      const lessonTasks = [];

      for (const lesson of lessons) {
        const [tasks] = await pool.query(
          `SELECT t.*,
            (SELECT COUNT(*) FROM task_submissions WHERE task_id = t.id) as submission_count,
            (SELECT COUNT(*) FROM task_submissions WHERE task_id = t.id AND score IS NOT NULL) as graded_count
          FROM lesson_tasks t WHERE t.lesson_id = ? ORDER BY t.created_at ASC`,
          [lesson.id]
        );

        if (tasks.length > 0) {
          lessonTasks.push({
            lesson: { id: lesson.id, title: lesson.title },
            tasks
          });
        }
      }

      if (lessonTasks.length > 0) {
        result.push({
          module: { id: mod.id, title: mod.title },
          lessons: lessonTasks
        });
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
