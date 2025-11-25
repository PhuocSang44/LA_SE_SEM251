package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.ForumPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumPostRepository extends JpaRepository<ForumPost, Long> {
    
    List<ForumPost> findByForumForumId(Long forumId);
    
    List<ForumPost> findByAuthorUserId(Integer userId);
    
    List<ForumPost> findByForumForumIdOrderByCreatedAtDesc(Long forumId);
    
    @Query("SELECT fp FROM ForumPost fp WHERE fp.forum.forumId = :forumId " +
           "AND (fp.title LIKE %:searchQuery% OR fp.content LIKE %:searchQuery%)")
    List<ForumPost> searchPostsInForum(@Param("forumId") Long forumId, @Param("searchQuery") String searchQuery);
    
    @Query("SELECT COUNT(fp) FROM ForumPost fp WHERE fp.forum.forumId = :forumId")
    Long countPostsByForumId(@Param("forumId") Long forumId);
    
    @Modifying
    @Query("UPDATE ForumPost fp SET fp.views = fp.views + 1 WHERE fp.postId = :postId")
    void incrementViews(@Param("postId") Long postId);
}
