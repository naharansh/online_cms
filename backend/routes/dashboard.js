const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/admin', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [[{ total_users }]] = await pool.query('SELECT COUNT(*) as total_users FROM users');
    const [[{ total_courses }]] = await pool.query('SELECT COUNT(*) as total_courses FROM courses');
    const [[{ total_enrollments }]] = await pool.query('SELECT COUNT(*) as total_enrollments FROM enrollments');
    const [[{ total_revenue }]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total_revenue FROM payments WHERE payment_status = "completed"');
    const [recent_enrollments] = await pool.query(
      `SELECT e.*, u.name as student_name, c.title as course_title
       FROM enrollments e
       JOIN users u ON e.user_id = u.id
       JOIN courses c ON e.course_id = c.id
       ORDER BY e.enrolled_at DESC LIMIT 10`
    );
    const [popular_courses] = await pool.query(
      `SELECT c.title, COUNT(e.id) as enrollment_count
       FROM courses c LEFT JOIN enrollments e ON c.id = e.course_id
       GROUP BY c.id ORDER BY enrollment_count DESC LIMIT 5`
    );

    res.json({ total_users, total_courses, total_enrollments, total_revenue, recent_enrollments, popular_courses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/instructor', authenticate, authorize('instructor'), async (req, res) => {
  try {
    const [[{ total_courses }]] = await pool.query('SELECT COUNT(*) as total_courses FROM courses WHERE instructor_id = ?', [req.user.id]);
    const [[{ total_students }]] = await pool.query(
      `SELECT COUNT(DISTINCT e.user_id) as total_students
       FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.instructor_id = ?`,
      [req.user.id]
    );
    const [recent_enrollments] = await pool.query(
      `SELECT e.*, u.name as student_name, c.title as course_title
       FROM enrollments e
       JOIN users u ON e.user_id = u.id
       JOIN courses c ON e.course_id = c.id
       WHERE c.instructor_id = ?
       ORDER BY e.enrolled_at DESC LIMIT 10`,
      [req.user.id]
    );
    res.json({ total_courses, total_students, recent_enrollments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/admin/course-reports', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [courses] = await pool.query(
      `SELECT c.id, c.title, c.price, c.difficulty_level, c.is_published, c.created_at,
        u.name as instructor_name,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrollment_count,
        (SELECT COUNT(*) FROM modules WHERE course_id = c.id) as module_count,
        (SELECT COUNT(*) FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.course_id = c.id) as lesson_count,
        (SELECT COALESCE(SUM(p.amount), 0) FROM payments p WHERE p.course_id = c.id AND p.payment_status = 'completed') as revenue,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND is_completed = TRUE) as completions
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      ORDER BY enrollment_count DESC`
    );
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/admin/instructors', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [instructors] = await pool.query(
      `SELECT u.id, u.name, u.email, u.profile_image, u.created_at,
        (SELECT COUNT(*) FROM courses WHERE instructor_id = u.id) as course_count,
        (SELECT COUNT(DISTINCT e.user_id) FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.instructor_id = u.id) as student_count,
        (SELECT COUNT(*) FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.instructor_id = u.id) as enrollment_count,
        (SELECT COALESCE(SUM(p.amount), 0) FROM payments p JOIN courses c ON p.course_id = c.id WHERE c.instructor_id = u.id AND p.payment_status = 'completed') as revenue
      FROM users u WHERE u.role = 'instructor'
      ORDER BY u.name ASC`
    );
    res.json(instructors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/admin/charts', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [monthlyEnrollments] = await pool.query(
      `SELECT DATE_FORMAT(enrolled_at, '%Y-%m') as month, COUNT(*) as count
       FROM enrollments WHERE enrolled_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY month ORDER BY month ASC`
    );
    const [monthlyRevenue] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COALESCE(SUM(amount), 0) as total
       FROM payments WHERE payment_status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY month ORDER BY month ASC`
    );
    const [[{ total_users }]] = await pool.query('SELECT COUNT(*) as total_users FROM users');
    const [[{ total_students }]] = await pool.query("SELECT COUNT(*) as total_students FROM users WHERE role = 'student'");
    const [[{ total_instructors }]] = await pool.query("SELECT COUNT(*) as total_instructors FROM users WHERE role = 'instructor'");
    const [[{ total_courses }]] = await pool.query('SELECT COUNT(*) as total_courses FROM courses');
    const [[{ total_enrollments }]] = await pool.query('SELECT COUNT(*) as total_enrollments FROM enrollments');
    const [[{ total_revenue }]] = await pool.query("SELECT COALESCE(SUM(amount), 0) as total_revenue FROM payments WHERE payment_status = 'completed'");
    const [courseCategories] = await pool.query(
      `SELECT cat.name, COUNT(c.id) as count
       FROM categories cat LEFT JOIN courses c ON cat.id = c.category_id
       GROUP BY cat.id ORDER BY count DESC`
    );
    const [recentPayments] = await pool.query(
      `SELECT p.*, u.name as student_name, c.title as course_title
       FROM payments p JOIN users u ON p.user_id = u.id JOIN courses c ON p.course_id = c.id
       WHERE p.payment_status = 'completed'
       ORDER BY p.created_at DESC LIMIT 10`
    );

    res.json({
      monthlyEnrollments, monthlyRevenue,
      total_users, total_students, total_instructors, total_courses, total_enrollments, total_revenue,
      courseCategories, recentPayments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/student', authenticate, authorize('student'), async (req, res) => {
  try {
    const [[{ total_enrolled }]] = await pool.query('SELECT COUNT(*) as total_enrolled FROM enrollments WHERE user_id = ?', [req.user.id]);
    const [[{ completed_courses }]] = await pool.query('SELECT COUNT(*) as completed_courses FROM enrollments WHERE user_id = ? AND is_completed = TRUE', [req.user.id]);
    const [[{ total_certificates }]] = await pool.query('SELECT COUNT(*) as total_certificates FROM certificates WHERE user_id = ?', [req.user.id]);
    const [recent_activity] = await pool.query(
      `SELECT lp.*, l.title as lesson_title, l.video_duration, m.title as module_title, c.title as course_title
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       JOIN modules m ON l.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE lp.user_id = ?
       ORDER BY lp.completed_at DESC LIMIT 10`,
      [req.user.id]
    );
    res.json({ total_enrolled, completed_courses, total_certificates, recent_activity });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
