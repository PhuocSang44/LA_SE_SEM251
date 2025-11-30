package org.minhtrinh.hcmuttssbackend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.forum.*;
import org.minhtrinh.hcmuttssbackend.entity.*;
import org.minhtrinh.hcmuttssbackend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ForumService {

    private final ForumRepository forumRepository;
    private final ForumMemberRepository forumMemberRepository;
    private final ForumPostRepository forumPostRepository;
    private final PostTagRepository postTagRepository;
    private final ForumCommentRepository forumCommentRepository;
    private final ForumVoteRepository forumVoteRepository;
    private final UserProfilePersistenceService userProfilePersistenceService;
    private final UserProfileService userProfileService;

    // ===================== FORUM MANAGEMENT =====================

    @Transactional
    public ForumResponse createForum(CreateForumRequest request, TssUserPrincipal principal) {
        User user = getUserFromPrincipal(principal);
        
        // Only tutors can create
        if (!isUserTutor(user.getUserId())) {
            throw new RuntimeException("Only tutors can create forums");
        }

        Forum forum = Forum.builder()
                .title(request.title())
                .description(request.description())
                .forumType(request.forumType())
                .subject(request.subject())
                .creator(user)
                .build();

        forum = forumRepository.save(forum);
        log.info("Forum created: {} by user {}", forum.getForumId(), user.getUserId());

        // Automatically add creator as member
        ForumMember creatorMember = ForumMember.builder()
                .forum(forum)
                .user(user)
                .build();
        forumMemberRepository.save(creatorMember);
        log.info("Creator {} auto-joined forum {}", user.getUserId(), forum.getForumId());

        return mapToForumResponse(forum, user.getUserId());
    }

    @Transactional
    public void deleteForum(Long forumId, TssUserPrincipal principal) {
        User user = getUserFromPrincipal(principal);
        Forum forum = forumRepository.findById(forumId)
                .orElseThrow(() -> new RuntimeException("Forum not found"));
        
        // Only the creator can delete the forum
        if (!forum.getCreator().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Only the forum creator can delete this forum");
        }
        
        forumRepository.delete(forum);
        log.info("Forum {} deleted by user {}", forumId, user.getUserId());
    }

    @Transactional(readOnly = true)
    public List<ForumResponse> getAllForums(ForumType forumType, TssUserPrincipal principal) {
        Integer userId = getUserIdFromPrincipal(principal);
        List<Forum> forums;

        if (forumType != null) {
            forums = forumRepository.findByForumType(forumType);
        } else {
            forums = forumRepository.findAll();
        }

        return forums.stream()
                .map(forum -> mapToForumResponse(forum, userId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ForumResponse getForumById(Long forumId, TssUserPrincipal principal) {
        Integer userId = getUserIdFromPrincipal(principal);
        Forum forum = forumRepository.findById(forumId)
                .orElseThrow(() -> new RuntimeException("Forum not found"));
        
        return mapToForumResponse(forum, userId);
    }

    @Transactional(readOnly = true)
    public List<ForumResponse> searchForums(String searchQuery, ForumType forumType, TssUserPrincipal principal) {
        Integer userId = getUserIdFromPrincipal(principal);
        List<Forum> forums = forumRepository.searchForums(searchQuery, forumType);
        
        return forums.stream()
                .map(forum -> mapToForumResponse(forum, userId))
                .collect(Collectors.toList());
    }

    // ===================== FORUM MEMBERSHIP =====================

    @Transactional
    public void joinForum(Long forumId, TssUserPrincipal principal) {
        User user = getUserFromPrincipal(principal);
        Forum forum = forumRepository.findById(forumId)
                .orElseThrow(() -> new RuntimeException("Forum not found"));

        if (forumMemberRepository.existsByForumForumIdAndUserUserId(forumId, user.getUserId())) {
            throw new RuntimeException("User already joined this forum");
        }

        ForumMember member = ForumMember.builder()
                .forum(forum)
                .user(user)
                .build();

        forumMemberRepository.save(member);
        log.info("User {} joined forum {}", user.getUserId(), forumId);
    }

    @Transactional
    public void leaveForum(Long forumId, TssUserPrincipal principal) {
        User user = getUserFromPrincipal(principal);
        
        if (!forumMemberRepository.existsByForumForumIdAndUserUserId(forumId, user.getUserId())) {
            throw new RuntimeException("User is not a member of this forum");
        }

        forumMemberRepository.deleteByForumForumIdAndUserUserId(forumId, user.getUserId());
        log.info("User {} left forum {}", user.getUserId(), forumId);
    }

    @Transactional(readOnly = true)
    public boolean isUserMemberOfForum(Long forumId, Integer userId) {
        return forumMemberRepository.existsByForumForumIdAndUserUserId(forumId, userId);
    }

    // ===================== POST MANAGEMENT =====================

    @Transactional
    public PostResponse createPost(CreatePostRequest request, TssUserPrincipal principal) {
        User user = getUserFromPrincipal(principal);
        
        Forum forum = forumRepository.findById(request.forumId())
                .orElseThrow(() -> new RuntimeException("Forum not found"));
        
        log.info("Attempting to create post in forum {} by user {}", request.forumId(), user.getUserId());
        
        // Check if user is a member of the forum OR is the forum creator
        boolean isMember = isUserMemberOfForum(request.forumId(), user.getUserId());
        boolean isCreator = forum.getCreator().getUserId().equals(user.getUserId());
        log.info("User {} membership check for forum {}: isMember={}, isCreator={}", 
                user.getUserId(), request.forumId(), isMember, isCreator);
        
        if (!isMember && !isCreator) {
            throw new RuntimeException("User must be a member to post in this forum");
        }

        ForumPost post = ForumPost.builder()
                .forum(forum)
                .author(user)
                .title(request.title())
                .content(request.content())
                .build();

        ForumPost savedPost = forumPostRepository.save(post);

        // Save tags (batch insert)
        if (request.tags() != null && !request.tags().isEmpty()) {
            List<PostTag> tagsToSave = request.tags().stream()
                .map(tagName -> PostTag.builder()
                    .post(savedPost)
                    .tagName(tagName.toLowerCase())
                    .build())
                .collect(Collectors.toList());

            postTagRepository.saveAll(tagsToSave);
        }

        log.info("Post created: {} in forum {} by user {}", savedPost.getPostId(), forum.getForumId(), user.getUserId());
        return mapToPostResponse(savedPost, user.getUserId());
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getPostsByForum(Long forumId, TssUserPrincipal principal) {
        Integer userId = getUserIdFromPrincipal(principal);
        List<ForumPost> posts = forumPostRepository.findByForumForumIdOrderByCreatedAtDesc(forumId);
        
        return posts.stream()
                .map(post -> mapToPostResponse(post, userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public PostResponse getPostById(Long postId, TssUserPrincipal principal) {
        Integer userId = getUserIdFromPrincipal(principal);
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Increment view count
        forumPostRepository.incrementViews(postId);
        
        return mapToPostResponse(post, userId);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> searchPostsInForum(Long forumId, String searchQuery, TssUserPrincipal principal) {
        Integer userId = getUserIdFromPrincipal(principal);
        List<ForumPost> posts = forumPostRepository.searchPostsInForum(forumId, searchQuery);
        
        return posts.stream()
                .map(post -> mapToPostResponse(post, userId))
                .collect(Collectors.toList());
    }

    // ===================== COMMENT MANAGEMENT =====================

    @Transactional
    public CommentResponse createComment(CreateCommentRequest request, TssUserPrincipal principal) {
        User user = getUserFromPrincipal(principal);
        
        ForumPost post = forumPostRepository.findById(request.postId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check if user is a member of the forum
        if (!isUserMemberOfForum(post.getForum().getForumId(), user.getUserId())) {
            throw new RuntimeException("User must be a member to comment in this forum");
        }

        ForumComment comment = ForumComment.builder()
                .post(post)
                .author(user)
                .content(request.content())
                .build();

        comment = forumCommentRepository.save(comment);
        log.info("Comment created: {} on post {} by user {}", comment.getCommentId(), post.getPostId(), user.getUserId());
        
        return mapToCommentResponse(comment, user.getUserId());
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByPost(Long postId, TssUserPrincipal principal) {
        Integer userId = getUserIdFromPrincipal(principal);
        List<ForumComment> comments = forumCommentRepository.findByPostPostIdOrderByCreatedAtAsc(postId);
        
        return comments.stream()
                .map(comment -> mapToCommentResponse(comment, userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse acceptComment(Long commentId, TssUserPrincipal principal) {
        User user = getUserFromPrincipal(principal);
        
        ForumComment comment = forumCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        ForumPost post = comment.getPost();
        
        // Only post author can accept comments
        if (!post.getAuthor().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Only post author can accept answers");
        }

        // Unaccept any previously accepted comments
        List<ForumComment> acceptedComments = forumCommentRepository.findAcceptedCommentsByPostId(post.getPostId());
        for (ForumComment ac : acceptedComments) {
            ac.setIsAccepted(false);
            forumCommentRepository.save(ac);
        }

        // Accept this comment
        comment.setIsAccepted(true);
        post.setHasAcceptedAnswer(true);
        forumCommentRepository.save(comment);
        forumPostRepository.save(post);

        log.info("Comment {} accepted for post {}", commentId, post.getPostId());
        return mapToCommentResponse(comment, user.getUserId());
    }

    // ===================== VOTING SYSTEM =====================

    @Transactional
    public void votePost(Long postId, VoteRequest request, TssUserPrincipal principal) {
        User user = getUserFromPrincipal(principal);
        
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        var existingVote = forumVoteRepository.findByUserUserIdAndPostPostId(user.getUserId(), postId);

        if (existingVote.isPresent()) {
            ForumVote vote = existingVote.get();
            if (vote.getVoteType() == request.voteType()) {
                // Same vote - remove it (toggle)
                forumVoteRepository.delete(vote);
                log.info("User {} removed vote on post {}", user.getUserId(), postId);
            } else {
                // Different vote - update it
                vote.setVoteType(request.voteType());
                forumVoteRepository.save(vote);
                log.info("User {} changed vote to {} on post {}", user.getUserId(), request.voteType(), postId);
            }
        } else {
            // New vote
            ForumVote vote = ForumVote.builder()
                    .user(user)
                    .post(post)
                    .voteType(request.voteType())
                    .build();
            forumVoteRepository.save(vote);
            log.info("User {} voted {} on post {}", user.getUserId(), request.voteType(), postId);
        }
    }

    @Transactional
    public void voteComment(Long commentId, VoteRequest request, TssUserPrincipal principal) {
        User user = getUserFromPrincipal(principal);
        
        ForumComment comment = forumCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        var existingVote = forumVoteRepository.findByUserUserIdAndCommentCommentId(user.getUserId(), commentId);

        if (existingVote.isPresent()) {
            ForumVote vote = existingVote.get();
            if (vote.getVoteType() == request.voteType()) {
                forumVoteRepository.delete(vote);
                log.info("User {} removed vote on comment {}", user.getUserId(), commentId);
            } else {
                // Different vote
                vote.setVoteType(request.voteType());
                forumVoteRepository.save(vote);
                log.info("User {} changed vote to {} on comment {}", user.getUserId(), request.voteType(), commentId);
            }
        } else {
            // New vote
            ForumVote vote = ForumVote.builder()
                    .user(user)
                    .comment(comment)
                    .voteType(request.voteType())
                    .build();
            forumVoteRepository.save(vote);
            log.info("User {} voted {} on comment {}", user.getUserId(), request.voteType(), commentId);
        }
    }

    // ===================== HELPER METHODS =====================

    private User getUserFromPrincipal(TssUserPrincipal principal) {
        if (principal == null) {
            throw new RuntimeException("User must be authenticated");
        }
        userProfilePersistenceService.ensureUserSubProfilePersisted(principal);
        return userProfileService.getUserByEmail(principal.getEmail());
    }

    private Integer getUserIdFromPrincipal(TssUserPrincipal principal) {
        if (principal == null) return null;
        try {
            return userProfileService.getUserByEmail(principal.getEmail()).getUserId();
        } catch (RuntimeException ex) {
            return null;
        }
    }

    private boolean isUserTutor(Integer userId) {
        try {
            userProfileService.getTutorByUserId(userId);
            return true;
        } catch (RuntimeException ex) {
            return false;
        }
    }

    private String getUserRole(User user) {
        try {
            userProfileService.getTutorByUserId(user.getUserId());
            return "tutor";
        } catch (RuntimeException ex) {
            // fall through to student
        }
        return "student";
    }

    private ForumResponse mapToForumResponse(Forum forum, Integer currentUserId) {
        Long memberCount = forumMemberRepository.countMembersByForumId(forum.getForumId());
        Long postCount = forumPostRepository.countPostsByForumId(forum.getForumId());
        Boolean isJoined = currentUserId != null && 
                          forumMemberRepository.existsByForumForumIdAndUserUserId(forum.getForumId(), currentUserId);

        String creatorRole = getUserRole(forum.getCreator());

        return new ForumResponse(
                forum.getForumId(),
                forum.getTitle(),
                forum.getDescription(),
                forum.getForumType(),
                forum.getSubject(),
                forum.getCreator().getUserId(),
                forum.getCreator().getFirstName() + " " + forum.getCreator().getLastName(),
                creatorRole,
                memberCount,
                postCount,
                isJoined,
                forum.getCreatedAt(),
                forum.getUpdatedAt()
        );
    }

    private PostResponse mapToPostResponse(ForumPost post, Integer currentUserId) {
        Long voteScore = forumVoteRepository.getPostVoteScore(post.getPostId());
        if (voteScore == null) voteScore = 0L;
        
        Long commentCount = forumCommentRepository.countCommentsByPostId(post.getPostId());
        
        List<String> tags = postTagRepository.findByPostPostId(post.getPostId())
                .stream()
                .map(PostTag::getTagName)
                .collect(Collectors.toList());

        String userVote = null;
        if (currentUserId != null) {
            var vote = forumVoteRepository.findByUserUserIdAndPostPostId(currentUserId, post.getPostId());
            if (vote.isPresent()) {
                userVote = vote.get().getVoteType().name().toLowerCase();
            }
        }

        String authorRole = getUserRole(post.getAuthor());

        return new PostResponse(
                post.getPostId(),
                post.getForum().getForumId(),
                post.getForum().getTitle(),
                post.getAuthor().getUserId(),
                post.getAuthor().getFirstName() + " " + post.getAuthor().getLastName(),
                authorRole,
                post.getTitle(),
                post.getContent(),
                post.getViews(),
                voteScore,
                commentCount,
                post.getHasAcceptedAnswer(),
                tags,
                userVote,
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }

    private CommentResponse mapToCommentResponse(ForumComment comment, Integer currentUserId) {
        Long voteScore = forumVoteRepository.getCommentVoteScore(comment.getCommentId());
        if (voteScore == null) voteScore = 0L;

        String userVote = null;
        if (currentUserId != null) {
            var vote = forumVoteRepository.findByUserUserIdAndCommentCommentId(currentUserId, comment.getCommentId());
            if (vote.isPresent()) {
                userVote = vote.get().getVoteType().name().toLowerCase();
            }
        }

        String authorRole = getUserRole(comment.getAuthor());

        return new CommentResponse(
                comment.getCommentId(),
                comment.getPost().getPostId(),
                comment.getAuthor().getUserId(),
                comment.getAuthor().getFirstName() + " " + comment.getAuthor().getLastName(),
                authorRole,
                comment.getContent(),
                voteScore,
                comment.getIsAccepted(),
                userVote,
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }
}
