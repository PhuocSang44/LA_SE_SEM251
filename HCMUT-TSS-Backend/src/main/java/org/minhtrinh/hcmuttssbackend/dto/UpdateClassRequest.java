
package org.minhtrinh.hcmuttssbackend.dto;

public record UpdateClassRequest(
                String courseCode,
                String courseName,
                String semester,
                Integer capacity
) {
        public String getCourseCode() {
                return courseCode();
        }

        public String getCourseName() {
                return courseName();
        }

        public String getSemester() {
                return semester();
        }

        public Integer getCapacity() {
                return capacity();
        }
}
