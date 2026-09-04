USE mobile_banking_db;

-- ==========================================
-- VIEW 1 : CUSTOMER ACCOUNTS
-- ==========================================

CREATE VIEW customer_accounts AS
SELECT
    u.user_id,
    u.full_name,
    u.email,
    u.phone,
    a.account_number,
    a.account_type,
    a.balance,
    a.status
FROM users u
JOIN accounts a
ON u.user_id = a.user_id;

-- Test the View
SELECT * FROM customer_accounts;