-- =========================================
-- BLOODBRIDGE DATABASE
-- =========================================

CREATE DATABASE IF NOT EXISTS bloodbridge;

USE bloodbridge;


-- =========================================
-- USERS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('donor', 'seeker', 'admin') DEFAULT 'seeker',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- DONORS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS donors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(20),
    city VARCHAR(100),
    address VARCHAR(255),
    last_donation_date DATE,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================
-- BLOOD REQUESTS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS blood_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seeker_id INT NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    hospital_name VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    units_required INT NOT NULL,
    urgency ENUM('Normal', 'Urgent', 'Emergency') DEFAULT 'Normal',
    required_date DATE,
    status ENUM('Pending', 'Accepted', 'Completed', 'Cancelled')
        DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (seeker_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================
-- DONOR REQUESTS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS donor_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    donor_id INT NOT NULL,
    status ENUM('Pending', 'Accepted', 'Rejected', 'Completed')
        DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (request_id)
        REFERENCES blood_requests(id)
        ON DELETE CASCADE,

    FOREIGN KEY (donor_id)
        REFERENCES donors(id)
        ON DELETE CASCADE
);


-- =========================================
-- BLOOD BANK TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS blood_bank (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blood_group VARCHAR(5) NOT NULL UNIQUE,
    units_available INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- =========================================
-- INITIAL BLOOD GROUPS
-- =========================================

INSERT IGNORE INTO blood_bank
(blood_group, units_available)
VALUES
('A+', 0),
('A-', 0),
('B+', 0),
('B-', 0),
('AB+', 0),
('AB-', 0),
('O+', 0),
('O-', 0);


-- =========================================
-- ADMIN USER
-- =========================================

INSERT IGNORE INTO users
(name, email, phone, password, role)
VALUES
(
    'Admin',
    'admin@bloodbridge.com',
    '9999999999',
    'admin123',
    'admin'
);


-- =========================================
-- CHECK TABLES
-- =========================================

SHOW TABLES;