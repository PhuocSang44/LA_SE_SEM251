package org.minhtrinh.hcmuttssbackend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "session",
       indexes = { @Index(name = "idx_session_class", columnList = "class_id") },
       uniqueConstraints = { @UniqueConstraint(columnNames = { "class_id", "start_time" }) })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Long sessionId;

    // Link back to the class (course instance)
    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
        private Class clazz;

    @Column(name="session_title", length = 255, nullable = false)
    private String title;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = true)
    private LocalDateTime endTime;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "location", length = 255)
    private String location; // e.g., "Room 101" or "Zoom: xyz"

    @Column(name = "session_type", length = 50)
    private String sessionType; // e.g., LECTURE, LAB, TUTORIAL

    @Column(name = "max_students")
    @Builder.Default
    private Integer maxStudents = 30; // optional per-session capacity, defaults to 30

    @Column(name = "current_students")
    @Builder.Default
    private Integer currentStudents = 0; // tracked attendance for this specific session

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "SCHEDULED"; // SCHEDULED (default), ACTIVE, CANCELLED, COMPLETED

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}