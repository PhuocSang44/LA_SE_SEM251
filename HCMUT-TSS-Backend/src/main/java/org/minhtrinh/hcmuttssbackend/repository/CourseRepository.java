package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Integer> {
    Optional<Course> findByCourseName(String courseName);
    List<Course> findByDepartment_DepartmentCode(String departmentCode);
    List<Course> findByCredit(Integer credit);
    
/**
 Finds all courses that have the specified course as a prerequisite.
 @param prereqId the ID of the prerequisite course
 @return a list of courses that require the given prerequisite
*/
@Query("SELECT c FROM Course c JOIN c.prerequisites p WHERE p.courseId = :prereqId")
List<Course> findByPrerequisite(@Param("prereqId") Integer prereqId);

/** Custom: Find courses without prerequisites
 @return a list of courses that have no prerequisites
*/
@Query("SELECT c FROM Course c WHERE c.prerequisites IS EMPTY")
List<Course> findCoursesWithoutPrerequisites();

/**
 Finds all courses whose names contain the specified keyword, ignoring case.
@param keyword the substring to search for in course names (case-insensitive)
@return a list of courses with names containing the keyword
 */
List<Course> findByCourseNameContainingIgnoreCase(String keyword);
}