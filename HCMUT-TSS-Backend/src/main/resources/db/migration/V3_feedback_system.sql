-- Feedback table stores student feedback for courses/classes
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id          BIGINT NOT NULL,
    course_id           BIGINT NOT NULL,
    class_id            BIGINT NOT NULL,
    comment             TEXT NULL,
    image_url           VARCHAR(500) NULL,
    status              VARCHAR(20) DEFAULT 'PENDING',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_student FOREIGN KEY (student_id) REFERENCES student(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_course FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_class FOREIGN KEY (class_id) REFERENCES class(class_id) ON DELETE CASCADE,
    INDEX idx_feedback_student (user_id),
    INDEX idx_feedback_course (course_id),
    INDEX idx_feedback_class (class_id),
    INDEX idx_feedback_status (status)
);

-- Feedback rating stores individual rating questions and answers
CREATE TABLE IF NOT EXISTS feedback_rating (
    rating_id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    feedback_id         BIGINT NOT NULL,
    question            VARCHAR(500) NOT NULL,
    rating_value        INT NOT NULL CHECK (rating_value >= 1 AND rating_value <= 5),
    CONSTRAINT fk_rating_feedback FOREIGN KEY (feedback_id) REFERENCES feedback(feedback_id) ON DELETE CASCADE,
    INDEX idx_rating_feedback (feedback_id)
);

-- Activity log to track feedback submissions
CREATE TABLE IF NOT EXISTS activity_log (
    log_id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             INT NOT NULL,
    action              VARCHAR(100) NOT NULL,
    entity_type         VARCHAR(50) NOT NULL,
    entity_id           BIGINT NULL,
    description         TEXT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    INDEX idx_log_user (user_id),
    INDEX idx_log_action (action),
    INDEX idx_log_created (created_at)
);