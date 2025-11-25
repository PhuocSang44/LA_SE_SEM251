package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.Forum;
import org.minhtrinh.hcmuttssbackend.entity.ForumType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumRepository extends JpaRepository<Forum, Long> {
    
    List<Forum> findByForumType(ForumType forumType);
    
    List<Forum> findByForumTypeAndSubjectContaining(ForumType forumType, String subject);
    
    List<Forum> findByCreatorUserId(Integer userId);
    
    @Query("SELECT f FROM Forum f WHERE " +
           "(f.title LIKE %:searchQuery% OR f.description LIKE %:searchQuery% OR f.subject LIKE %:searchQuery%) " +
           "AND (:forumType IS NULL OR f.forumType = :forumType)")
    List<Forum> searchForums(@Param("searchQuery") String searchQuery, @Param("forumType") ForumType forumType);
}
