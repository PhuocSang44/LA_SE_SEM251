package org.minhtrinh.hcmuttssbackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "post_tags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tag_id")
    private Long tagId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private ForumPost post;

    @Column(name = "tag_name", nullable = false, length = 50)
    private String tagName;
}
