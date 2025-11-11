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
    @Column(name = "studentid")
    private Integer studentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userid", nullable = false, foreignKey = @ForeignKey(name = "fk_student_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_code", nullable = false, foreignKey = @ForeignKey(name = "fk_student_department"))
    private Department department;

    @Column(name = "major", nullable = false, length = 100)
    private String major;

    @Column(name = "academic_level", length = 50)
    private String academicLevel;
}
