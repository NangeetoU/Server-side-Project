-- =================================================================
-- DoDash Application - Database Schema
-- Version: 1.0
-- Description: This script creates the initial 'users' table.
-- =================================================================

-- Drop the table if it already exists to start fresh (optional, good for testing)
DROP TABLE IF EXISTS `users`;

-- Create the 'users' table
CREATE TABLE `users` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- You can add more tables below in the future, for example:
-- CREATE TABLE `tasks` ( ... );

