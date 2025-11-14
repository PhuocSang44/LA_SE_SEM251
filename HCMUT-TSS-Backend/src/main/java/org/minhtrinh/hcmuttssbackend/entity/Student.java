package org.minhtrinh.hcmuttssbackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    private Long studentId;

    // Link to application user by id; we avoid FK at DB-level for compatibility
    @Column(name = "user_id", nullable = false, unique = true)
    private Integer userId;

    @Column(name = "official_id", nullable = false, unique = true)
    private Long officialId;

    @Column(name = "department_name", nullable = false)
    private String departmentName;

    @Column(name = "program")
    private String program; // e.g., Computer Science

    @Column(name = "academic_level")
    private String academicLevel; // e.g., Undergraduate/Graduate
}
