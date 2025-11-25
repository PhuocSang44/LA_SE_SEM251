package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.ForumComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumCommentRepository extends JpaRepository<ForumComment, Long> {
    
    List<ForumComment> findByPostPostId(Long postId);
    
    List<ForumComment> findByAuthorUserId(Integer userId);
    
    List<ForumComment> findByPostPostIdOrderByCreatedAtAsc(Long postId);
    
    @Query("SELECT COUNT(fc) FROM ForumComment fc WHERE fc.post.postId = :postId")
    Long countCommentsByPostId(@Param("postId") Long postId);
    
    @Query("SELECT fc FROM ForumComment fc WHERE fc.post.postId = :postId AND fc.isAccepted = true")
    List<ForumComment> findAcceptedCommentsByPostId(@Param("postId") Long postId);
}
