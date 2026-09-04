DROP DATABASE IF EXISTS mobile_banking_db;
CREATE DATABASE mobile_banking_db;
USE mobile_banking_db;



-- =====================================================
-- MOBILE BANKING DATABASE SCHEMA
-- =====================================================

-- 1. USERS TABLE
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ACCOUNTS TABLE
CREATE TABLE accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type ENUM('Savings','Current') NOT NULL,
    balance DECIMAL(12,2) DEFAULT 0.00,
    status ENUM('Active','Blocked','Closed') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
);

-- 3. TRANSACTIONS TABLE
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_account_id INT,
    receiver_account_id INT,
    amount DECIMAL(12,2) NOT NULL,
    transaction_type ENUM('Deposit','Withdrawal','Transfer') NOT NULL,
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Success','Failed','Pending') DEFAULT 'Success',

    FOREIGN KEY (sender_account_id)
    REFERENCES accounts(account_id),

    FOREIGN KEY (receiver_account_id)
    REFERENCES accounts(account_id)
);

-- 4. BENEFICIARIES TABLE
CREATE TABLE beneficiaries (
    beneficiary_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    beneficiary_name VARCHAR(100) NOT NULL,
    beneficiary_account VARCHAR(20) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
);

-- 6. OTP VERIFICATION TABLE
CREATE TABLE otp_verification (
    otp_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose ENUM('Login','Registration','Password Reset','Transaction') NOT NULL,
    expires_at DATETIME NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
);

-- 7. LOGIN HISTORY TABLE
CREATE TABLE login_history (
    login_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    device VARCHAR(100),
    status ENUM('Success','Failed') NOT NULL,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
);

SHOW TABLES;

DESCRIBE users;
DESCRIBE accounts;
DESCRIBE transactions;
DESCRIBE beneficiaries;
DESCRIBE notifications;
DESCRIBE otp_verification;
DESCRIBE login_history;