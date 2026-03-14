-- ============================================
-- MusicLearn — Esquema MySQL
-- Bogotá, Colombia
-- ============================================

CREATE DATABASE IF NOT EXISTS musiclearn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE musiclearn;

-- Usuarios (profesores y estudiantes)
CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('teacher','student') NOT NULL DEFAULT 'student',
  instrument    ENUM('guitar','bass','piano','vocal') NULL,
  level         ENUM('beginner','intermediate','advanced') NULL,
  modality      ENUM('virtual','presential') NULL,
  goal          VARCHAR(255) NULL,
  phone         VARCHAR(30)  NULL,
  bio           TEXT         NULL,
  avatar_url    VARCHAR(500) NULL,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role  (role)
);

-- Cursos
CREATE TABLE IF NOT EXISTS courses (
  id          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  title       VARCHAR(200) NOT NULL,
  instrument  ENUM('guitar','bass','piano','vocal') NOT NULL,
  level       ENUM('beginner','intermediate','advanced') NOT NULL,
  description TEXT         NULL,
  teacher_id  CHAR(36)     NOT NULL,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_instrument (instrument),
  INDEX idx_level      (level)
);

-- Temas del curso
CREATE TABLE IF NOT EXISTS topics (
  id          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  course_id   CHAR(36)     NOT NULL,
  title       VARCHAR(200) NOT NULL,
  order_index INT          NOT NULL DEFAULT 1,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Subtemas
CREATE TABLE IF NOT EXISTS subtopics (
  id          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  topic_id    CHAR(36)     NOT NULL,
  title       VARCHAR(200) NOT NULL,
  content_url VARCHAR(500) NULL,
  type        ENUM('video','pdf','exercise') NOT NULL DEFAULT 'video',
  order_index INT          NOT NULL DEFAULT 1,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

-- Inscripciones
CREATE TABLE IF NOT EXISTS enrollments (
  id           CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  user_id      CHAR(36)  NOT NULL,
  course_id    CHAR(36)  NOT NULL,
  progress_pct FLOAT     NOT NULL DEFAULT 0,
  enrolled_at  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_enrollment (user_id, course_id),
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Progreso por subtema
CREATE TABLE IF NOT EXISTS progress (
  id             CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  enrollment_id  CHAR(36)  NOT NULL,
  subtopic_id    CHAR(36)  NOT NULL,
  completed      BOOLEAN   NOT NULL DEFAULT FALSE,
  completed_at   DATETIME  NULL,
  UNIQUE KEY uq_progress (enrollment_id, subtopic_id),
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
  FOREIGN KEY (subtopic_id)   REFERENCES subtopics(id)   ON DELETE CASCADE
);

-- Sesiones de clase
CREATE TABLE IF NOT EXISTS sessions (
  id           CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  teacher_id   CHAR(36)  NOT NULL,
  student_id   CHAR(36)  NOT NULL,
  modality     ENUM('virtual','presential') NOT NULL,
  start_time   DATETIME  NOT NULL,
  duration_min INT       NOT NULL DEFAULT 60,
  topic        VARCHAR(255) NULL,
  meet_link    VARCHAR(500) NULL,
  notes        TEXT      NULL,
  created_at   DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  INDEX idx_start_time (start_time)
);

-- Asistencia
CREATE TABLE IF NOT EXISTS attendance (
  id         CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  session_id CHAR(36)  NOT NULL,
  attended   BOOLEAN   NOT NULL DEFAULT FALSE,
  notes      TEXT      NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Mensajes de chat
CREATE TABLE IF NOT EXISTS messages (
  id          CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  sender_id   CHAR(36)  NOT NULL,
  receiver_id CHAR(36)  NOT NULL,
  content     TEXT      NOT NULL,
  sent_at     DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at     DATETIME  NULL,
  FOREIGN KEY (sender_id)   REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id),
  INDEX idx_conversation (sender_id, receiver_id),
  INDEX idx_sent_at      (sent_at)
);

-- ── Datos de prueba ──────────────────────────────

INSERT INTO users (id, name, email, password_hash, role, instrument, level, modality, onboarding_complete) VALUES
  ('teacher-001', 'Prof. Pablo Morales', 'profesor@musiclearn.co',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJbekRSanjCxoaYgxDO89lkK',
   -- password: musiclearn123
   'teacher', 'guitar', 'advanced', 'virtual', TRUE),
  ('student-001', 'Laura Martínez', 'laura@email.com',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJbekRSanjCxoaYgxDO89lkK',
   'student', 'guitar', 'intermediate', 'virtual', TRUE),
  ('student-002', 'Juan Rodríguez', 'juan@email.com',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJbekRSanjCxoaYgxDO89lkK',
   'student', 'piano', 'beginner', 'presential', TRUE);
