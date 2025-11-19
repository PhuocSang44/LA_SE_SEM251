CREATE TABLE IF NOT EXISTS session (
    session_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    class_id         BIGINT NOT NULL,
    session_title     VARCHAR(255) NOT NULL,
    description       TEXT,
    start_time        DATETIME NOT NULL,
    end_time          DATETIME NOT NULL,
    location          VARCHAR(255),
    status            VARCHAR(40) NOT NULL DEFAULT 'SCHEDULED',
    max_students      INT NOT NULL DEFAULT 30,
    current_students  INT NOT NULL DEFAULT 0,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_session_course
        FOREIGN KEY (class_id) REFERENCES class(class_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS session_enrollment (
    enrollment_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id        BIGINT NOT NULL,
    student_id        INT NOT NULL,
    enrollment_date   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status            VARCHAR(40) NOT NULL DEFAULT 'ENROLLED',
    CONSTRAINT fk_enrollment_session
        FOREIGN KEY (session_id) REFERENCES session(session_id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_student
        FOREIGN KEY (student_id) REFERENCES student(user_id) ON DELETE CASCADE
);