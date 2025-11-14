package org.minhtrinh.hcmuttssbackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "university_staff")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UniversityStaff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "staff_id")
    private Long staffId;

    // Link to application user by id; we avoid FK at DB-level for compatibility
    @Column(name = "user_id", nullable = false, unique = true)
    private Integer userId;

    @Column(name = "official_id", nullable = false, unique = true)
    private Long officialId;

    @Column(name = "position_title")
    private String positionTitle; // e.g., Professor, Lecturer

    @Column(name = "department_name", nullable = false)
    private String departmentName;
}
