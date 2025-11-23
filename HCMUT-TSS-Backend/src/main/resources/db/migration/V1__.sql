CREATE TABLE IF NOT EXISTS user
(
    user_id      INT AUTO_INCREMENT NOT NULL,
    email       VARCHAR(255) NOT NULL,
    first_name  VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100) NULL,
    last_name   VARCHAR(100) NOT NULL,
    user_type   VARCHAR(255) NOT NULL,
    CONSTRAINT pk_user PRIMARY KEY (user_id)
);

ALTER TABLE user
    ADD CONSTRAINT uc_user_email UNIQUE (email);