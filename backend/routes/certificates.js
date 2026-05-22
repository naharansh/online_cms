const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

router.get('/my', authenticate, async (req, res) => {
  try {
    const [certificates] = await pool.query(
      `SELECT cert.*, c.title as course_title, c.duration, u.name as instructor_name
       FROM certificates cert
       JOIN courses c ON cert.course_id = c.id
       JOIN users u ON c.instructor_id = u.id
       WHERE cert.user_id = ?
       ORDER BY cert.issued_at DESC`,
      [req.user.id]
    );
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/generate/:courseId', authenticate, async (req, res) => {
  try {
    const [enrollment] = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ? AND is_completed = TRUE',
      [req.user.id, req.params.courseId]
    );
    if (enrollment.length === 0) {
      return res.status(400).json({ message: 'Course not completed' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM certificates WHERE user_id = ? AND course_id = ?',
      [req.user.id, req.params.courseId]
    );
    if (existing.length > 0) {
      return res.json({ message: 'Certificate already exists', certificate: existing[0] });
    }

    const [course] = await pool.query('SELECT * FROM courses WHERE id = ?', [req.params.courseId]);
    const certificateCode = `CERT-${uuidv4().substring(0, 8).toUpperCase()}`;
    const certUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificates/verify/${certificateCode}`;

    const [result] = await pool.query(
      'INSERT INTO certificates (user_id, course_id, certificate_url, certificate_code) VALUES (?, ?, ?, ?)',
      [req.user.id, req.params.courseId, certUrl, certificateCode]
    );

    res.status(201).json({
      message: 'Certificate generated',
      certificate: {
        id: result.insertId,
        certificate_code: certificateCode,
        certificate_url: certUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/verify/:code', async (req, res) => {
  try {
    const [certificates] = await pool.query(
      `SELECT cert.*, u.name as student_name, c.title as course_title,
        c.duration, u2.name as instructor_name, cert.issued_at
       FROM certificates cert
       JOIN users u ON cert.user_id = u.id
       JOIN courses c ON cert.course_id = c.id
       JOIN users u2 ON c.instructor_id = u2.id
       WHERE cert.certificate_code = ?`,
      [req.params.code]
    );
    if (certificates.length === 0) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    res.json(certificates[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
