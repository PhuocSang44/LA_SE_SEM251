//Vuong
package org.minhtrinh.hcmuttssbackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "class")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Class {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "class_id")
    private Long classId;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "semester", nullable = false)
    private String semester; // e.g., "Fall 2024", "Spring 2025"

    @ManyToOne
    @JoinColumn(name = "tutor_id", nullable = false)
    private UniversityStaff tutor;

    @Column(name = "created_at", nullable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "status")
    private String status; // e.g. ACTIVE, INACTIVE, CANCELLED, COMPLETED
    @Column(name = "capacity")
    private Integer capacity; // maximum number of students, null = unlimited
    
    @Column(name = "custom_name", length = 255, nullable = true)
    private String customName;

    @Column(name = "enrolled_count")
    @Builder.Default
    private Integer enrolledCount = 0; // current number of enrolled students

}