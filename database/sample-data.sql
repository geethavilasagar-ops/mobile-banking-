USE mobile_banking_db;

-- =====================================================
-- SAMPLE DATA FOR USERS
-- =====================================================

INSERT INTO users (full_name, email, phone, password_hash)
VALUES
('Geetha Vilas','geetha@gmail.com','9876543210','password123'),
('Rahul Sharma','rahul@gmail.com','9876543211','rahul123'),
('Priya Reddy','priya@gmail.com','9876543212','priya123'),
('Arjun Kumar','arjun@gmail.com','9876543213','arjun123'),
('Sneha Patel','sneha@gmail.com','9876543214','sneha123');

SELECT * FROM users;

-- =====================================================
-- SAMPLE DATA FOR ACCOUNTS
-- =====================================================

INSERT INTO accounts
(user_id, account_number, account_type, balance, status)
VALUES
(1,'501000000001','Savings',50000.00,'Active'),
(2,'501000000002','Savings',32000.00,'Active'),
(3,'501000000003','Current',85000.00,'Active'),
(4,'501000000004','Savings',12000.00,'Blocked'),
(5,'501000000005','Current',150000.00,'Active');

SELECT * FROM accounts;

-- =====================================================
-- SAMPLE DATA FOR BENEFICIARIES
-- =====================================================

INSERT INTO beneficiaries
(user_id, beneficiary_name, beneficiary_account, bank_name, ifsc_code)
VALUES
(1,'Rahul Sharma','501000000002','State Bank of India','SBIN0001234'),
(2,'Geetha Vilas','501000000001','State Bank of India','SBIN0001234'),
(3,'Sneha Patel','501000000005','HDFC Bank','HDFC0005678'),
(4,'Priya Reddy','501000000003','ICICI Bank','ICIC0009876'),
(5,'Arjun Kumar','501000000004','Axis Bank','UTIB0001111');

SELECT * FROM beneficiaries;

-- =====================================================
-- SAMPLE DATA FOR TRANSACTIONS
-- =====================================================

INSERT INTO transactions
(sender_account_id, receiver_account_id, amount, transaction_type, status)
VALUES
(1,2,5000.00,'Transfer','Success'),
(2,3,2500.00,'Transfer','Success'),
(3,NULL,10000.00,'Withdrawal','Success'),
(NULL,4,7000.00,'Deposit','Success'),
(5,1,15000.00,'Transfer','Pending');

SELECT * FROM transactions;

-- =====================================================
-- SAMPLE DATA FOR NOTIFICATIONS
-- =====================================================

INSERT INTO notifications
(user_id,title,message,is_read)
VALUES
(1,'Money Received','₹7500 credited to your account.',0),
(1,'Welcome','Welcome to Mobile Banking!',1),
(2,'Money Sent','₹5000 transferred successfully.',1),
(2,'KYC Reminder','Please update your KYC.',0),
(3,'Deposit Successful','₹2000 deposited.',1),
(3,'Low Balance Alert','Your balance is below ₹1000.',0),
(4,'Account Blocked','Contact customer care.',0),
(4,'Transaction Failed','Transaction could not be processed.',1),
(5,'Salary Credited','₹50000 credited.',0),
(5,'Password Changed','Your password was changed successfully.',1);

SELECT * FROM notifications;

-- =====================================================
-- SAMPLE DATA FOR OTP VERIFICATION
-- =====================================================

INSERT INTO otp_verification
(user_id, otp_code, purpose, expires_at, is_verified)
VALUES
(1,'123456','Login',DATE_ADD(NOW(),INTERVAL 5 MINUTE),TRUE),
(2,'234567','Registration',DATE_ADD(NOW(),INTERVAL 10 MINUTE),FALSE),
(3,'345678','Password Reset',DATE_ADD(NOW(),INTERVAL 5 MINUTE),TRUE),
(4,'456789','Transaction',DATE_ADD(NOW(),INTERVAL 3 MINUTE),FALSE),
(5,'567890','Login',DATE_ADD(NOW(),INTERVAL 5 MINUTE),TRUE);

SELECT * FROM otp_verification;

-- =====================================================
-- SAMPLE DATA FOR LOGIN HISTORY
-- =====================================================

INSERT INTO login_history
(user_id, ip_address, device, status)
VALUES
(1,'192.168.1.10','Android','Success'),
(2,'192.168.1.20','iPhone','Success'),
(3,'192.168.1.30','Laptop','Failed'),
(4,'192.168.1.40','Android','Success'),
(5,'192.168.1.50','Windows PC','Failed');

SELECT * FROM login_history;