package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.ForumVote;
import org.minhtrinh.hcmuttssbackend.entity.VoteType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ForumVoteRepository extends JpaRepository<ForumVote, Long> {
    
    Optional<ForumVote> findByUserUserIdAndPostPostId(Integer userId, Long postId);
    
    Optional<ForumVote> findByUserUserIdAndCommentCommentId(Integer userId, Long commentId);
    
    void deleteByUserUserIdAndPostPostId(Integer userId, Long postId);
    
    void deleteByUserUserIdAndCommentCommentId(Integer userId, Long commentId);
    
    @Query("SELECT COUNT(fv) - " +
           "(SELECT COUNT(fv2) FROM ForumVote fv2 WHERE fv2.post.postId = :postId AND fv2.voteType = 'DOWN') " +
           "FROM ForumVote fv WHERE fv.post.postId = :postId AND fv.voteType = 'UP'")
    Long getPostVoteScore(@Param("postId") Long postId);
    
    @Query("SELECT COUNT(fv) - " +
           "(SELECT COUNT(fv2) FROM ForumVote fv2 WHERE fv2.comment.commentId = :commentId AND fv2.voteType = 'DOWN') " +
           "FROM ForumVote fv WHERE fv.comment.commentId = :commentId AND fv.voteType = 'UP'")
    Long getCommentVoteScore(@Param("commentId") Long commentId);
}
