USE mobile_banking_db;

DELIMITER $$

CREATE PROCEDURE GetAccountDetails(
    IN acc_number VARCHAR(20)
)
BEGIN
    SELECT
        u.full_name,
        a.account_number,
        a.account_type,
        a.balance,
        a.status
    FROM users u
    JOIN accounts a
        ON u.user_id = a.user_id
    WHERE a.account_number = acc_number;
END $$

DELIMITER ;