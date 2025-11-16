<<<<<<< HEAD
-- Student table stores student-specific attributes and links to application user by user_id
CREATE TABLE IF NOT EXISTS student (
    student_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    official_id     BIGINT NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    program         VARCHAR(100) NULL,
    academic_level  VARCHAR(50) NULL,
    CONSTRAINT uk_student_official_id UNIQUE (official_id),
    CONSTRAINT uk_student_user_id UNIQUE (user_id),
    INDEX idx_student_user_id (user_id)
);

-- University staff table stores staff-specific attributes and links to application user by user_id
CREATE TABLE IF NOT EXISTS university_staff (
    staff_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    official_id     BIGINT NOT NULL,
    position_title  VARCHAR(100) NULL,
    department_name VARCHAR(255) NOT NULL,
    specialization  VARCHAR(255) NULL,
    CONSTRAINT uk_staff_official_id UNIQUE (official_id),
    CONSTRAINT uk_staff_user_id UNIQUE (user_id),
    INDEX idx_staff_user_id (user_id)
);

-- Course stores minimal course information used by TSS
=======
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

>>>>>>> bfc592d (quick fix and save local change before rebase)
CREATE TABLE IF NOT EXISTS course (
    course_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(50) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    description     TEXT NULL,
<<<<<<< HEAD
    department_name VARCHAR(255) NULL,
    CONSTRAINT uk_course_code UNIQUE (code)
);

-- Class represents a specific instance of a course taught by a tutor
=======
    department_id INT NOT NULL,
    CONSTRAINT fk_course_department FOREIGN KEY (department_id) REFERENCES department(department_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uk_course_code UNIQUE (code)
);

>>>>>>> bfc592d (quick fix and save local change before rebase)
CREATE TABLE IF NOT EXISTS class (
    class_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id       BIGINT NOT NULL,
    tutor_id        BIGINT NOT NULL,
    semester        VARCHAR(50) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    CONSTRAINT fk_class_course FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE CASCADE,
<<<<<<< HEAD
    CONSTRAINT fk_class_tutor FOREIGN KEY (tutor_id) REFERENCES university_staff(staff_id) ON DELETE CASCADE,
=======
    CONSTRAINT fk_class_tutor FOREIGN KEY (tutor_id) REFERENCES university_staff(user_id) ON DELETE SET NULL,
>>>>>>> bfc592d (quick fix and save local change before rebase)
    INDEX idx_class_course (course_id),
    INDEX idx_class_tutor (tutor_id)
);

<<<<<<< HEAD
-- Many-to-one student-class registrations (updated to link with class instead of course)
=======
>>>>>>> bfc592d (quick fix and save local change before rebase)
CREATE TABLE IF NOT EXISTS course_registration (
    registration_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id      BIGINT NOT NULL,
    class_id        BIGINT NOT NULL,
    registered_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_reg_student_class UNIQUE (student_id, class_id),
    CONSTRAINT fk_reg_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_reg_class  FOREIGN KEY (class_id)  REFERENCES class(class_id)   ON DELETE CASCADE
<<<<<<< HEAD
);
=======
);
>>>>>>> bfc592d (quick fix and save local change before rebase)
