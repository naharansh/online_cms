const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lms_db',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
  });

  const { readFileSync } = require('fs');
  const { join } = require('path');
  const sql = readFileSync(join(__dirname, 'config', 'db.sql'), 'utf8');
  await connection.query(sql);

  const hash = await bcrypt.hash('password123', 10);

  await connection.query(`INSERT IGNORE INTO users (id, name, email, password, role, is_active, email_verified) VALUES
    (1, 'Admin User', 'admin@lms.com', '${hash}', 'admin', TRUE, TRUE),
    (2, 'John Instructor', 'instructor@lms.com', '${hash}', 'instructor', TRUE, TRUE),
    (3, 'Sarah Teacher', 'sarah@lms.com', '${hash}', 'instructor', TRUE, TRUE),
    (4, 'Mike Student', 'student@lms.com', '${hash}', 'student', TRUE, TRUE),
    (5, 'Emma Student', 'emma@lms.com', '${hash}', 'student', TRUE, TRUE),
    (6, 'Alex Student', 'alex@lms.com', '${hash}', 'student', TRUE, TRUE)`);

  await connection.query(`INSERT IGNORE INTO categories (id, name, description) VALUES
    (1, 'Web Development', 'Learn HTML, CSS, JavaScript, React, Node.js and more'),
    (2, 'Data Science', 'Python, Machine Learning, AI, Data Analysis courses'),
    (3, 'Mobile Development', 'iOS, Android, React Native app development'),
    (4, 'Business', 'Entrepreneurship, Marketing, Finance, Management'),
    (5, 'Design', 'UI/UX Design, Graphic Design, Figma, Photoshop')`);

  await connection.query(`INSERT IGNORE INTO courses (id, title, description, instructor_id, category_id, price, difficulty_level, language, duration, is_published) VALUES
    (1, 'Complete Web Development Bootcamp', 'Learn full-stack web development from scratch. HTML, CSS, JavaScript, React, Node.js, MongoDB and more.', 2, 1, 49.99, 'beginner', 'English', '12 weeks', TRUE),
    (2, 'Advanced React & Next.js', 'Master React hooks, Next.js 14, server components, and modern frontend patterns.', 2, 1, 79.99, 'advanced', 'English', '8 weeks', TRUE),
    (3, 'Python for Data Science', 'Learn Python programming and its application in data analysis, visualization, and machine learning.', 3, 2, 59.99, 'intermediate', 'English', '10 weeks', TRUE),
    (4, 'UI/UX Design Fundamentals', 'Learn the principles of user interface and user experience design.', 3, 5, 39.99, 'beginner', 'English', '6 weeks', TRUE),
    (5, 'React Native Mobile Apps', 'Build cross-platform mobile applications using React Native.', 2, 3, 69.99, 'intermediate', 'English', '8 weeks', TRUE),
    (6, 'Introduction to JavaScript', 'A beginner-friendly introduction to JavaScript programming.', 2, 1, 0, 'beginner', 'English', '4 weeks', TRUE)`);

  await connection.query(`INSERT IGNORE INTO modules (id, course_id, title, description, order_index) VALUES
    (1, 1, 'Getting Started with Web Development', 'Introduction to web technologies and development environment setup', 1),
    (2, 1, 'HTML & CSS Fundamentals', 'Learn the building blocks of the web', 2),
    (3, 1, 'JavaScript Basics', 'Core JavaScript concepts and programming fundamentals', 3),
    (4, 2, 'React Hooks Deep Dive', 'Understanding useState, useEffect, useContext and custom hooks', 1),
    (5, 2, 'Next.js App Router', 'Learn the new App Router pattern in Next.js', 2),
    (6, 3, 'Python Basics', 'Python syntax, data types, and control flow', 1),
    (7, 4, 'Design Principles', 'Color theory, typography, and layout principles', 1),
    (8, 6, 'JavaScript Fundamentals', 'Variables, functions, and basic programming concepts', 1)`);

  await connection.query(`INSERT IGNORE INTO lessons (id, module_id, title, description, video_duration, order_index, is_free) VALUES
    (1, 1, 'What is Web Development?', 'Overview of web development and career paths', '10:30', 1, TRUE),
    (2, 1, 'Setting Up Your Environment', 'Install VS Code, Node.js, and Git', '15:00', 2, TRUE),
    (3, 1, 'How the Internet Works', 'Understanding HTTP, DNS, and browsers', '12:45', 3, FALSE),
    (4, 2, 'HTML Document Structure', 'Learn the basic structure of HTML documents', '14:20', 1, FALSE),
    (5, 2, 'CSS Selectors and Properties', 'Understanding CSS selectors, properties, and values', '18:30', 2, FALSE),
    (6, 3, 'Variables and Data Types', 'JavaScript variables, strings, numbers, and booleans', '16:00', 1, FALSE),
    (7, 4, 'useState Hook', 'Managing component state with useState', '20:00', 1, FALSE),
    (8, 8, 'Hello World in JavaScript', 'Writing your first JavaScript program', '8:00', 1, TRUE)`);

  await connection.query(`INSERT IGNORE INTO enrollments (user_id, course_id, progress, is_completed) VALUES
    (4, 1, 45.00, FALSE),
    (4, 6, 100.00, TRUE),
    (5, 1, 20.00, FALSE),
    (5, 3, 0.00, FALSE),
    (6, 2, 10.00, FALSE),
    (6, 6, 100.00, TRUE)`);

  await connection.query(`INSERT IGNORE INTO assignments (id, course_id, instructor_id, title, description, deadline, max_score) VALUES
    (1, 1, 2, 'Build a Personal Portfolio', 'Create a personal portfolio website using HTML and CSS', '2026-06-15 23:59:00', 100),
    (2, 1, 2, 'JavaScript Calculator', 'Build a calculator app using JavaScript', '2026-07-01 23:59:00', 100),
    (3, 6, 2, 'Simple Todo App', 'Create a todo list application with vanilla JavaScript', '2026-06-10 23:59:00', 50)`);

  await connection.query(`INSERT IGNORE INTO quizzes (id, course_id, instructor_id, title, description, time_limit, passing_score, max_attempts) VALUES
    (1, 1, 2, 'HTML & CSS Quiz', 'Test your knowledge of HTML and CSS fundamentals', 30, 60, 2),
    (2, 1, 2, 'JavaScript Basics Quiz', 'Test your JavaScript fundamentals', 45, 70, 3),
    (3, 6, 2, 'JS Fundamentals Test', 'Basic JavaScript concepts test', 15, 50, 3)`);

  await connection.query(`INSERT IGNORE INTO quiz_questions (id, quiz_id, question, question_type, options, correct_answer, points, order_index) VALUES
    (1, 1, 'What does HTML stand for?', 'multiple_choice', '["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"]', 'A', 1, 1),
    (2, 1, 'Which tag is used for a hyperlink?', 'multiple_choice', '["<link>", "<a>", "<href>", "<nav>"]', 'B', 1, 2),
    (3, 1, 'CSS is used for styling web pages.', 'true_false', '["True", "False"]', 'A', 1, 3),
    (4, 2, 'Which keyword is used to declare a variable in JavaScript?', 'multiple_choice', '["var", "let", "const", "All of the above"]', 'D', 1, 1),
    (5, 2, 'What is the correct way to write a JavaScript array?', 'multiple_choice', '["(1, 2, 3)", "[1, 2, 3]", "{1, 2, 3}", "<1, 2, 3>"]', 'B', 1, 2),
    (6, 3, 'What does typeof return for a number?', 'multiple_choice', '["number", "string", "object", "undefined"]', 'A', 1, 1),
    (7, 3, 'JavaScript is case-sensitive.', 'true_false', '["True", "False"]', 'A', 1, 2)`);

  await connection.query(`INSERT IGNORE INTO certificates (user_id, course_id, certificate_code) VALUES
    (4, 6, 'CERT-HTML101'),
    (6, 6, 'CERT-HTML102')`);

  console.log('Database seeded successfully!');
  console.log('\n--- Dummy Accounts ---');
  console.log('Admin:      admin@lms.com / password123');
  console.log('Instructor: instructor@lms.com / password123');
  console.log('Instructor: sarah@lms.com / password123');
  console.log('Student:    student@lms.com / password123');
  console.log('Student:    emma@lms.com / password123');
  console.log('Student:    alex@lms.com / password123');

  await connection.end();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
