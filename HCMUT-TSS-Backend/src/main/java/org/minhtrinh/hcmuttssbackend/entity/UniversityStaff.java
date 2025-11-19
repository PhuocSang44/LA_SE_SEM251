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
    @Column(name = "user_id")
    private Integer userId;

    @MapsId
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "staff_id", unique = true)
    private String staffId;

    @ManyToOne()
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;
}
