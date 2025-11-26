-- Evaluation table stores tutor evaluations for students in courses/classes
CREATE TABLE IF NOT EXISTS evaluation (
    evaluation_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id          INT NOT NULL,
    course_id           BIGINT NOT NULL,
    class_id            BIGINT NOT NULL,
    tutor_id            INT NOT NULL,
    comment             TEXT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_evaluation_student FOREIGN KEY (student_id) REFERENCES student(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_evaluation_course FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE CASCADE,
    CONSTRAINT fk_evaluation_class FOREIGN KEY (class_id) REFERENCES class(class_id) ON DELETE CASCADE,
    CONSTRAINT fk_evaluation_tutor FOREIGN KEY (tutor_id) REFERENCES university_staff(user_id) ON DELETE CASCADE,
    INDEX idx_evaluation_student (student_id),
    INDEX idx_evaluation_course (course_id),
    INDEX idx_evaluation_class (class_id),
    INDEX idx_evaluation_tutor (tutor_id),
    UNIQUE KEY unique_student_class_evaluation (student_id, class_id)
);

-- Evaluation item stores individual rating criteria and scores
CREATE TABLE IF NOT EXISTS evaluation_item (
    item_id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id       BIGINT NOT NULL,
    criterion           VARCHAR(500) NOT NULL,
    rating_value        INT NOT NULL CHECK (rating_value >= 0),
    max_rating          INT NOT NULL DEFAULT 5 CHECK (max_rating > 0),
    CONSTRAINT fk_evaluation_item_evaluation FOREIGN KEY (evaluation_id) REFERENCES evaluation(evaluation_id) ON DELETE CASCADE,
    INDEX idx_evaluation_item_evaluation (evaluation_id)
);

