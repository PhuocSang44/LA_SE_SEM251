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
    @Column(name = "staff_id")
    private String staffId;

    @OneToOne()
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne()
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;
}
