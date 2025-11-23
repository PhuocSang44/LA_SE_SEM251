//Vuong
package org.minhtrinh.hcmuttssbackend.entity;

import jakarta.persistence.*;
import lombok.*;

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
    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code; // e.g., CSE101

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "department_name") // tam thoi 
    private String departmentName;
    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;
}
