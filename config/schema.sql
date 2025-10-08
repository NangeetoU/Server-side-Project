-- =================================================================
-- DoDash Application - Database Schema
-- Version: 1.0
-- Description: This script creates the initial 'users' table.
-- =================================================================

-- Drop the table if it already exists to start fresh (optional, good for testing)
DROP TABLE IF EXISTS `users`;

-- Create the 'users' table
-- users
CREATE TABLE users (
  user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name  VARCHAR(255) NOT NULL,
  username   VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL
) ENGINE=InnoDB;

-- tasks
CREATE TABLE tasks (
  task_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  status      VARCHAR(255) NOT NULL,
  priority    VARCHAR(255) NOT NULL,
  due_at      TIMESTAMP NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- reminders
CREATE TABLE reminders (
  reminder_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  task_id   INT UNSIGNED NOT NULL,
  remind_at TIMESTAMP NOT NULL,
  is_sent   BOOLEAN NOT NULL DEFAULT 0,
  priority  VARCHAR(255) NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(task_id)
) ENGINE=InnoDB;
-- You can add more tables below in the future, for example:
-- CREATE TABLE `tasks` ( ... );

