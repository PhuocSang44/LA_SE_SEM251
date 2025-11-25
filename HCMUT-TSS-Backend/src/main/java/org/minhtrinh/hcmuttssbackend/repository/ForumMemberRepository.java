package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.ForumMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ForumMemberRepository extends JpaRepository<ForumMember, Long> {
    
    boolean existsByForumForumIdAndUserUserId(Long forumId, Integer userId);
    
    Optional<ForumMember> findByForumForumIdAndUserUserId(Long forumId, Integer userId);
    
    List<ForumMember> findByUserUserId(Integer userId);
    
    List<ForumMember> findByForumForumId(Long forumId);
    
    @Query("SELECT COUNT(fm) FROM ForumMember fm WHERE fm.forum.forumId = :forumId")
    Long countMembersByForumId(@Param("forumId") Long forumId);
    
    void deleteByForumForumIdAndUserUserId(Long forumId, Integer userId);
}
