CREATE TABLE IF NOT EXISTS department(
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    CONSTRAINT uk_department_name UNIQUE (department_name)
);

CREATE TABLE IF NOT EXISTS student(
    user_id INT PRIMARY KEY,
    student_id VARCHAR(32) UNIQUE,
    department_id INT NOT NULL,
    major VARCHAR(100),
    academic_level VARCHAR(50),
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES user(user_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_student_department FOREIGN KEY (department_id) REFERENCES department(department_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS university_staff(
    user_id INT PRIMARY KEY,
    staff_id VARCHAR(32) UNIQUE,
    department_id INT NOT NULL,
    CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES user(user_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_staff_department FOREIGN KEY (department_id) REFERENCES department(department_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS course (
    course_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(50) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    description     TEXT NULL,
    department_id INT NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    CONSTRAINT fk_course_department FOREIGN KEY (department_id) REFERENCES department(department_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uk_course_code UNIQUE (code)
);

CREATE TABLE IF NOT EXISTS class (
    class_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id       BIGINT NOT NULL,
    tutor_id        INT NOT NULL,
    semester        VARCHAR(50) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    capacity        INT,
    custom_name     VARCHAR(255),
    enrolled_count   INT DEFAULT 0,
    CONSTRAINT fk_class_course FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE CASCADE,
    CONSTRAINT fk_class_tutor FOREIGN KEY (tutor_id) REFERENCES university_staff(user_id) ON DELETE CASCADE,
    INDEX idx_class_course (course_id),
    INDEX idx_class_tutor (tutor_id)
);

CREATE TABLE IF NOT EXISTS course_registration (
    registration_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT NOT NULL,
    class_id        BIGINT NOT NULL,
    course_id       BIGINT NOT NULL,
    registered_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_reg_student_class UNIQUE (student_id, class_id),
    CONSTRAINT fk_reg_student FOREIGN KEY (student_id) REFERENCES student(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_reg_class  FOREIGN KEY (class_id)  REFERENCES class(class_id)   ON DELETE CASCADE
);
