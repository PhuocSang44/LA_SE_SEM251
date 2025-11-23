DROP TABLE IF EXISTS performance_evaluation_metric;
DROP TABLE IF EXISTS performance_evaluation;

CREATE TABLE performance_evaluation (
    evaluation_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id           INT NOT NULL,
    class_id             BIGINT NOT NULL,
    course_id            BIGINT NOT NULL,
    tutor_id             INT NOT NULL,
    status               VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    overall_comment      TEXT NULL,
    numeric_score        DOUBLE NULL,
    overall_score        DOUBLE NULL,
    star_rating          INT NOT NULL CHECK (star_rating BETWEEN 1 AND 5),
    submitted_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP NULL,
    client_request_id    VARCHAR(100) NULL,
    CONSTRAINT uk_perf_class_student UNIQUE (class_id, student_id),
    CONSTRAINT uk_perf_client_request UNIQUE (client_request_id),
    CONSTRAINT fk_perf_student FOREIGN KEY (student_id) REFERENCES student(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_perf_class FOREIGN KEY (class_id) REFERENCES class(class_id) ON DELETE CASCADE,
    CONSTRAINT fk_perf_course FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE CASCADE,
    CONSTRAINT fk_perf_tutor FOREIGN KEY (tutor_id) REFERENCES university_staff(user_id) ON DELETE CASCADE
);

CREATE TABLE performance_evaluation_metric (
    metric_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id    BIGINT NOT NULL,
    question         VARCHAR(255) NOT NULL,
    score            DOUBLE NOT NULL,
    max_score        DOUBLE NOT NULL,
    metric_comment   VARCHAR(1000) NULL,
    CONSTRAINT fk_metric_evaluation FOREIGN KEY (evaluation_id) REFERENCES performance_evaluation(evaluation_id) ON DELETE CASCADE
);