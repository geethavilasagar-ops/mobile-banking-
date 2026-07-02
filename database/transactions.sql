USE mobile_banking_db;

START TRANSACTION;

UPDATE accounts
SET balance = balance - 5000
WHERE account_id = 1;

UPDATE accounts
SET balance = balance + 5000
WHERE account_id = 2;

INSERT INTO transactions
(sender_account_id, receiver_account_id, amount, transaction_type, status)
VALUES
(1, 2, 5000, 'Transfer', 'Success');

COMMIT;

SELECT * FROM accounts;
SELECT * FROM transactions;