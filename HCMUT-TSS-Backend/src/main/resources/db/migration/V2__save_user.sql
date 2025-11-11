CREATE TABLE IF NOT EXISTS department(
    department_code VARCHAR(20) PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    CONSTRAINT uk_department_name UNIQUE (department_name)
);

CREATE TABLE IF NOT EXISTS student(
    studentid INT PRIMARY KEY,
    userid INT NOT NULL,
    department_code VARCHAR(20) NOT NULL,
    major VARCHAR(100) NOT NULL,
    academic_level VARCHAR(50),
    CONSTRAINT fk_student_user FOREIGN KEY (userid) REFERENCES user(userid) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_student_department FOREIGN KEY (department_code) REFERENCES department(department_code) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uk_student_user UNIQUE (userid)
);

CREATE TABLE IF NOT EXISTS university_staff(
    staffid INT PRIMARY KEY,
    userid INT NOT NULL,
    department_code VARCHAR(20) NOT NULL,
    staff_role VARCHAR(100), -- "Professor", "Lecturer", "Assistant"
    staff_type VARCHAR(50), -- "TUTOR", "COOPERATOR", "ADMINISTRATOR"
    CONSTRAINT fk_staff_user FOREIGN KEY (userid) REFERENCES user(userid) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_staff_department FOREIGN KEY (department_code) REFERENCES department(department_code) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uk_staff_user UNIQUE (userid)
);

CREATE TABLE IF NOT EXISTS course(
    courseid INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    course_syllabus TEXT,
    department_code VARCHAR(20) NOT NULL,
    credit INT NOT NULL,
    CONSTRAINT fk_course_department FOREIGN KEY (department_code) REFERENCES department(department_code) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uk_course_name UNIQUE (course_name)
);

CREATE TABLE IF NOT EXISTS prerequisite(
    courseid INT,
    prerequisiteid INT,
    PRIMARY KEY (courseid, prerequisiteid),
    CONSTRAINT fk_prerequisite_course FOREIGN KEY (courseid) REFERENCES course(courseid) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_prerequisite_prereq_course FOREIGN KEY (prerequisiteid) REFERENCES course(courseid) 
        ON DELETE CASCADE ON UPDATE CASCADE
);