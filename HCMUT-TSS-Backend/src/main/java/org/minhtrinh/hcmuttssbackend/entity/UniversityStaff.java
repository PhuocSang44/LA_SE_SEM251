package org.minhtrinh.hcmuttssbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "university_staff")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UniversityStaff {
    @Id
    @Column(name = "staffid")
    private Integer staffId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userid", nullable = false, foreignKey = @ForeignKey(name = "fk_staff_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_code", nullable = false, foreignKey = @ForeignKey(name = "fk_staff_department"))
    private Department department;

    @Column(name = "staff_role", length = 100)
    private String staffRole; // "Professor", "Lecturer", "Assistant"

    @Enumerated(EnumType.STRING)
    @Column(name = "staff_type", length = 50)
    private StaffType staffType;
}
