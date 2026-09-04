-- ==========================================
-- MOBILE BANKING DATABASE INDEXES
-- ==========================================

USE mobile_banking_db;

-- Users Table
CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_phone
ON users(phone);

-- Accounts Table
CREATE INDEX idx_accounts_number
ON accounts(account_number);

-- Transactions Table
CREATE INDEX idx_transactions_sender
ON transactions(sender_account_id);

CREATE INDEX idx_transactions_receiver
ON transactions(receiver_account_id);

-- Beneficiaries Table
CREATE INDEX idx_beneficiaries_user
ON beneficiaries(user_id);