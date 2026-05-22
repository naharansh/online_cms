CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'instructor', 'student') DEFAULT 'student',
  profile_image VARCHAR(255) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT 0
);

CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  instructor_id INT NOT NULL,
  category_id INT DEFAULT NULL,
  price DECIMAL(10,2) DEFAULT 0.00,
  thumbnail VARCHAR(255) DEFAULT NULL,
  difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
  language VARCHAR(50) DEFAULT 'English',
  duration VARCHAR(50) DEFAULT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT 0,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS modules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lessons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  module_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  video_url VARCHAR(500) DEFAULT NULL,
  video_duration VARCHAR(20) DEFAULT NULL,
  notes_url VARCHAR(500) DEFAULT NULL,
  order_index INT DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL DEFAULT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  progress DECIMAL(5,2) DEFAULT 0.00,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  watched_seconds INT DEFAULT 0,
  completed_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  UNIQUE KEY unique_progress (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  instructor_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  file_url VARCHAR(500) DEFAULT NULL,
  deadline DATETIME DEFAULT NULL,
  max_score INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  file_url VARCHAR(500) DEFAULT NULL,
  submission_text TEXT DEFAULT NULL,
  score INT DEFAULT NULL,
  feedback TEXT DEFAULT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  graded_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_submission (assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS quizzes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  instructor_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  time_limit INT DEFAULT NULL,
  passing_score INT DEFAULT 50,
  max_attempts INT DEFAULT 1,
  is_randomized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  question TEXT NOT NULL,
  question_type ENUM('multiple_choice', 'true_false') DEFAULT 'multiple_choice',
  options TEXT NOT NULL,
  correct_answer VARCHAR(10) NOT NULL,
  points INT DEFAULT 1,
  order_index INT DEFAULT 0,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  student_id INT NOT NULL,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  answers TEXT DEFAULT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL DEFAULT NULL,
  attempt_number INT DEFAULT 1,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS certificates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  certificate_url VARCHAR(500) DEFAULT NULL,
  certificate_code VARCHAR(50) UNIQUE NOT NULL,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT NULL,
  transaction_id VARCHAR(200) DEFAULT NULL,
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('email', 'push', 'sms') DEFAULT 'push',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
