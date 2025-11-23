package org.minhtrinh.hcmuttssbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {
    @Id
    @Column(name = "user_id")
    private Integer userId;

    @MapsId                           
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "student_id", unique = true, nullable = false)
    private String studentId;

    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "major")
    private String major;

    @Column(name = "academic_level")
    private String academicLevel;
}
