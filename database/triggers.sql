USE mobile_banking_db;

DELIMITER $$

CREATE TRIGGER trg_welcome_notification
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO notifications
    (
        user_id,
        title,
        message
    )
    VALUES
    (
        NEW.user_id,
        'Welcome',
        'Welcome to Mobile Banking!'
    );
END $$

DELIMITER ;

//Test it//

//Insert a brand-new user://

INSERT INTO users
(full_name,email,phone,password_hash)
VALUES
(
'Test User',
'test@gmail.com',
'9876543999',
'test123'
);