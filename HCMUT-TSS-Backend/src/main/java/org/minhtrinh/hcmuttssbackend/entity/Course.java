package org.minhtrinh.hcmuttssbackend.entity;

import java.util.Set;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "course")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "courseid")
    private Integer courseId;

    @Column(name = "course_name", nullable = false, length = 100)
    private String courseName;

    @Column(name = "course_syllabus", columnDefinition = "TEXT")
    private String courseSyllabus;

    @Column(name = "credit", nullable = false)
    private Integer credit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_code", nullable = false, foreignKey = @ForeignKey(name = "fk_course_department"))
    private Department department;

    // Prerequisites this course requires
    @ManyToMany()
    @JoinTable(
        name = "prerequisite",
        joinColumns = @JoinColumn(name = "courseid", foreignKey = @ForeignKey(name = "fk_prerequisite_course")),
        inverseJoinColumns = @JoinColumn(name = "prerequisiteid", foreignKey = @ForeignKey(name = "fk_prerequisite_prerequisite_course"))
    )
    private Set<Course> prerequisites;

    // Courses that depend on this course
    @ManyToMany(mappedBy = "prerequisites")
    private Set<Course> dependentCourses;
}

