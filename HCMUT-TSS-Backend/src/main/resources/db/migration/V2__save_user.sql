CREATE TABLE IF NOT EXISTS department(
    departmentCode VARCHAR(20) PRIMARY KEY,
    departmentName VARCHAR(100) NOT NULL,
    CONSTRAINT uk_department_name UNIQUE (departmentName)
);

CREATE TABLE IF NOT EXISTS student(
    studentID INT PRIMARY KEY,
    userID INT NOT NULL,
    departmentCode VARCHAR(20) NOT NULL,
    major VARCHAR(100) NOT NULL,
    academicLevel VARCHAR(50),
    CONSTRAINT fk_student_user FOREIGN KEY (userID) REFERENCES user(userID) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_student_department FOREIGN KEY (departmentCode) REFERENCES department(departmentCode) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uk_student_user UNIQUE (userID)
);

CREATE TABLE IF NOT EXISTS UniversityStaff(
    staffID INT PRIMARY KEY,
    userID INT NOT NULL,
    departmentCode VARCHAR(20) NOT NULL,
    staffRole VARCHAR(100), -- "Professor", "Lecturer", "Assistant"
    staffType VARCHAR(50), -- "TUTOR", "COOPERATOR", "ADMINISTRATOR"
    CONSTRAINT fk_staff_user FOREIGN KEY (userID) REFERENCES user(userID) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_staff_department FOREIGN KEY (departmentCode) REFERENCES department(departmentCode) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uk_staff_user UNIQUE (userID)
);

CREATE TABLE IF NOT EXISTS course(
    courseID INT AUTO_INCREMENT PRIMARY KEY,
    courseName VARCHAR(100) NOT NULL,
    courseSyllabus TEXT,
    departmentCode VARCHAR(20) NOT NULL,
    credit INT NOT NULL,
    CONSTRAINT fk_course_department FOREIGN KEY (departmentCode) REFERENCES department(departmentCode) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uk_course_name UNIQUE (courseName)
);
CREATE TABLE IF NOT EXISTS prerequisite(
    courseID INT,
    prerequisiteID INT,
    PRIMARY KEY (courseID, prerequisiteID),
    CONSTRAINT fk_prerequisite_course FOREIGN KEY (courseID) REFERENCES course(courseID) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_prerequisite_prereq_course FOREIGN KEY (prerequisiteID) REFERENCES course(courseID) 
        ON DELETE CASCADE ON UPDATE CASCADE
);