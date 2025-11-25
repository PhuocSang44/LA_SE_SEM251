# Forum Feature Implementation Guide

## Overview
This document provides a comprehensive guide for the forum feature implementation in the HCMUT-TSS system. The forum feature allows students and tutors to create discussion forums, post questions, provide answers, and vote on content.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [API Endpoints](#api-endpoints)
6. [Testing Guide](#testing-guide)
7. [Deployment Steps](#deployment-steps)

---

## Architecture Overview

The forum feature follows a three-tier architecture:

### 1. **Database Layer**
- MySQL database with 6 new tables for forum functionality
- Foreign key relationships to existing `USER` table
- Indexes for performance optimization

### 2. **Backend Layer (Spring Boot)**
- **Entities**: JPA entities with bidirectional relationships
- **Repositories**: Spring Data JPA repositories with custom queries
- **Services**: Business logic layer with permission checks
- **Controllers**: RESTful API endpoints
- **DTOs**: Data transfer objects for request/response

### 3. **Frontend Layer (React + TypeScript)**
- **Types**: TypeScript interfaces for type safety
- **API Client**: Axios-based client for backend communication
- **Pages**: React components for UI
- **Routing**: React Router for navigation
- **Authentication**: Integration with existing OAuth2 SSO

---

## Database Schema

### Migration: `V8__create_forum_tables.sql`

```sql
-- Forums table
CREATE TABLE forums (
    forum_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    forum_type ENUM('ACADEMIC', 'CAREER') NOT NULL,
    subject VARCHAR(100),
    creator_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_user_id) REFERENCES USER(user_id) ON DELETE CASCADE
);

-- Forum members (join table)
CREATE TABLE forum_members (
    forum_member_id INT AUTO_INCREMENT PRIMARY KEY,
    forum_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (forum_id) REFERENCES forums(forum_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_member (forum_id, user_id)
);

-- Forum posts (questions)
CREATE TABLE forum_posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    forum_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_user_id INT NOT NULL,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (forum_id) REFERENCES forums(forum_id) ON DELETE CASCADE,
    FOREIGN KEY (author_user_id) REFERENCES USER(user_id) ON DELETE CASCADE
);

-- Post tags
CREATE TABLE post_tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (post_id) REFERENCES forum_posts(post_id) ON DELETE CASCADE
);

-- Forum comments (answers)
CREATE TABLE forum_comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    author_user_id INT NOT NULL,
    content TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (author_user_id) REFERENCES USER(user_id) ON DELETE CASCADE
);

-- Forum votes
CREATE TABLE forum_votes (
    vote_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NULL,
    comment_id INT NULL,
    vote_type ENUM('UP', 'DOWN') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES forum_posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES forum_comments(comment_id) ON DELETE CASCADE,
    CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL)),
    UNIQUE KEY unique_post_vote (user_id, post_id),
    UNIQUE KEY unique_comment_vote (user_id, comment_id)
);

-- Performance indexes
CREATE INDEX idx_forums_type ON forums(forum_type);
CREATE INDEX idx_forums_creator ON forums(creator_user_id);
CREATE INDEX idx_posts_forum ON forum_posts(forum_id);
CREATE INDEX idx_posts_author ON forum_posts(author_user_id);
CREATE INDEX idx_comments_post ON forum_comments(post_id);
CREATE INDEX idx_comments_author ON forum_comments(author_user_id);
CREATE INDEX idx_votes_user ON forum_votes(user_id);
CREATE INDEX idx_tags_post ON post_tags(post_id);
```

### Key Design Decisions

1. **Forum Types**: ENUM for ACADEMIC and CAREER forums
2. **Vote Types**: ENUM for UP and DOWN votes
3. **Unique Constraints**: Prevent duplicate memberships and votes
4. **Cascading Deletes**: Automatically clean up related data
5. **Polymorphic Voting**: Single votes table for both posts and comments
6. **Accepted Answers**: Boolean flag on comments for accepted answers

---

## Backend Implementation

### 1. Entities

#### `Forum.java`
```java
@Entity
@Table(name = "forums")
public class Forum {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "forum_id")
    private Integer forumId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "forum_type", nullable = false)
    private ForumType forumType;

    @Column(name = "subject", length = 100)
    private String subject;

    @Column(name = "creator_user_id", nullable = false)
    private Integer creatorUserId;

    @OneToMany(mappedBy = "forum", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ForumMember> members = new HashSet<>();

    @OneToMany(mappedBy = "forum", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ForumPost> posts = new HashSet<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

### 2. Repositories

Custom query examples:

```java
public interface ForumRepository extends JpaRepository<Forum, Integer> {
    List<Forum> findByForumType(ForumType forumType);
    
    @Query("SELECT f FROM Forum f WHERE " +
           "LOWER(f.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(f.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Forum> searchForums(@Param("keyword") String keyword);
    
    @Query("SELECT COUNT(fm) FROM ForumMember fm WHERE fm.forum.forumId = :forumId")
    Long countMembersByForumId(@Param("forumId") Integer forumId);
}
```

### 3. Services

#### `ForumService.java`

Key business logic:

```java
// Forum creation - Tutors only
public ForumResponse createForum(CreateForumRequest request, Integer userId) {
    // Verify user is a tutor
    if (!staffRepository.existsById(userId)) {
        throw new IllegalStateException("Only tutors can create forums");
    }
    // Create and save forum
    Forum forum = new Forum();
    forum.setTitle(request.title());
    forum.setDescription(request.description());
    forum.setForumType(request.forumType());
    forum.setSubject(request.subject());
    forum.setCreatorUserId(userId);
    forum.setCreatedAt(LocalDateTime.now());
    forum.setUpdatedAt(LocalDateTime.now());
    
    Forum savedForum = forumRepository.save(forum);
    // Auto-join creator
    joinForum(savedForum.getForumId(), userId);
    
    return toForumResponse(savedForum, userId);
}

// Vote toggling logic
public void voteOnPost(Integer postId, VoteRequest request, Integer userId) {
    ForumPost post = forumPostRepository.findById(postId)
        .orElseThrow(() -> new IllegalArgumentException("Post not found"));
    
    Optional<ForumVote> existingVote = forumVoteRepository
        .findByUserUserIdAndPostPostId(userId, postId);
    
    if (existingVote.isPresent()) {
        if (existingVote.get().getVoteType() == request.voteType()) {
            // Remove vote if same type
            forumVoteRepository.delete(existingVote.get());
        } else {
            // Update vote if different type
            existingVote.get().setVoteType(request.voteType());
            forumVoteRepository.save(existingVote.get());
        }
    } else {
        // Create new vote
        ForumVote vote = new ForumVote();
        vote.setUser(userRepository.findById(userId).orElseThrow());
        vote.setPost(post);
        vote.setVoteType(request.voteType());
        vote.setCreatedAt(LocalDateTime.now());
        forumVoteRepository.save(vote);
    }
}
```

### 4. Controllers

```java
@RestController
@RequestMapping("/api/forums")
@RequiredArgsConstructor
public class ForumController {
    
    @PostMapping
    @PreAuthorize("hasAnyAuthority('STAFF')")
    public ResponseEntity<ForumResponse> createForum(
        @RequestBody CreateForumRequest request,
        @AuthenticationPrincipal TssUserPrincipal principal
    ) {
        ForumResponse response = forumService.createForum(request, principal.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    public ResponseEntity<List<ForumResponse>> getAllForums(
        @RequestParam(required = false) ForumType forumType,
        @AuthenticationPrincipal TssUserPrincipal principal
    ) {
        List<ForumResponse> forums = forumService.getAllForums(forumType, principal.getUserId());
        return ResponseEntity.ok(forums);
    }
    
    // ... more endpoints
}
```

### 5. Security Configuration

Updated `SecurityConfig.java` to allow forum endpoints:

```java
.csrf(csrf -> csrf
    .ignoringRequestMatchers("/api/admin/**", "/api/forums/**")
)
```

---

## Frontend Implementation

### 1. TypeScript Types

```typescript
// src/types/forum.ts
export interface Forum {
  forumId: number;
  title: string;
  description: string;
  forumType: ForumType;
  subject?: string;
  creatorUserId: number;
  creatorName: string;
  memberCount: number;
  postCount: number;
  isJoined: boolean;
  createdAt: string;
}

export interface Post {
  postId: number;
  forumId: number;
  title: string;
  content: string;
  authorUserId: number;
  authorName: string;
  tags: string[];
  viewCount: number;
  voteScore: number;
  commentCount: number;
  hasAcceptedAnswer: boolean;
  userVote?: VoteType;
  createdAt: string;
}
```

### 2. API Client

```typescript
// src/api/forumApi.ts
import { api } from '@/lib/api';

export const forumApi = {
  createForum: async (data: CreateForumRequest): Promise<Forum> => {
    const response = await api.post('/forums', data);
    return response.data;
  },
  
  getAllForums: async (forumType?: ForumType): Promise<Forum[]> => {
    const response = await api.get('/forums', {
      params: { forumType }
    });
    return response.data;
  },
  
  // ... more methods
};
```

### 3. Pages

#### TutorHub.tsx
- Entry point for forum feature
- Displays Academic and Career forum categories
- Shows statistics and navigation

#### ForumList.tsx
- Lists all forums in a category
- Search and filter functionality
- Join/Leave forum buttons
- "Create Forum" button for tutors

#### ForumDetail.tsx
- Displays posts in a forum
- Search and sort functionality (newest, popular, unanswered)
- "Ask Question" button for members

#### CreatePost.tsx
- Form to create a new question
- Title, content, and tag inputs
- Tag limit: 5 tags maximum

#### PostDetail.tsx
- Question display with voting
- Comments/answers list
- Accept answer functionality (for post author)
- New answer form

#### CreateForum.tsx
- Tutor-only forum creation
- Form with title, description, type, and subject

### 4. Routing

Updated `App.tsx`:

```typescript
// Standard Protected Routes (All authenticated users)
<Route element={<ProtectedRoute />}>
  <Route path="/tutor-hub" element={<TutorHub />} />
  <Route path="/forums/:forumType" element={<ForumList />} />
  <Route path="/forums/detail/:forumId" element={<ForumDetail />} />
  <Route path="/forums/:forumId/posts/create" element={<CreatePost />} />
  <Route path="/forums/posts/:postId" element={<PostDetail />} />
</Route>

// Tutor-only routes
<Route element={<ProtectedRoute allowedRoles={['tutor']} />}>
  <Route path="/forums/create" element={<CreateForum />} />
</Route>
```

### 5. Navigation

Updated `Navbar.tsx`:

```typescript
{
  path: "/tutor-hub",
  label: { en: "Forums", vi: "Diễn đàn" },
  roles: ['administrator', 'tutor', 'student', 'cooperator']
}
```

---

## API Endpoints

### Forums

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/forums` | Tutor | Create new forum |
| GET | `/api/forums` | All | Get all forums (optional filter by type) |
| GET | `/api/forums/{id}` | All | Get forum details |
| POST | `/api/forums/{id}/join` | All | Join a forum |
| DELETE | `/api/forums/{id}/leave` | All | Leave a forum |

### Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/forums/posts` | Members | Create new post |
| GET | `/api/forums/{forumId}/posts` | All | Get all posts in forum |
| GET | `/api/forums/posts/{postId}` | All | Get post details |
| POST | `/api/forums/posts/{postId}/vote` | All | Vote on post |

### Comments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/forums/posts/{postId}/comments` | All | Add comment/answer |
| GET | `/api/forums/posts/{postId}/comments` | All | Get all comments |
| POST | `/api/forums/comments/{commentId}/vote` | All | Vote on comment |
| POST | `/api/forums/comments/{commentId}/accept` | Author | Accept answer |

---

## Testing Guide

### 1. Database Migration

Run the backend to execute Flyway migration:

```bash
cd HCMUT-TSS-Backend
./mvnw.cmd spring-boot:run
```

Verify tables created:

```sql
SHOW TABLES LIKE 'forum%';
```

### 2. Backend Testing

#### Test Forum Creation (Tutor Only)

```bash
# Login as tutor and get session cookie
# Then:
curl -X POST http://localhost:8080/api/forums \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Java Programming",
    "description": "Discuss Java programming topics",
    "forumType": "ACADEMIC",
    "subject": "Computer Science"
  }'
```

#### Test Forum Listing

```bash
curl -X GET "http://localhost:8080/api/forums?forumType=ACADEMIC" \
  -b cookies.txt
```

#### Test Join Forum

```bash
curl -X POST http://localhost:8080/api/forums/1/join \
  -b cookies.txt
```

#### Test Create Post (Members Only)

```bash
curl -X POST http://localhost:8080/api/forums/posts \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "forumId": 1,
    "title": "How to use Spring Boot?",
    "content": "I am new to Spring Boot...",
    "tags": ["spring-boot", "java", "beginner"]
  }'
```

#### Test Voting

```bash
# Upvote
curl -X POST http://localhost:8080/api/forums/posts/1/vote \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"voteType": "UP"}'

# Click again to remove vote
curl -X POST http://localhost:8080/api/forums/posts/1/vote \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"voteType": "UP"}'
```

### 3. Frontend Testing

#### Start Frontend

```bash
cd HCMUT-TSS-Frontend
npm run dev
```

#### Test Workflow

1. **Login** as a tutor or student
2. **Navigate** to Forums in navbar
3. **View** Academic and Career categories
4. **Click** Academic to see forums
5. **Create Forum** (tutors only) - test form validation
6. **Join Forum** - verify membership
7. **Ask Question** - test post creation with tags
8. **View Post** - verify voting and comment features
9. **Vote** on posts and comments
10. **Add Answer** - test comment creation
11. **Accept Answer** (as post author) - verify only author can accept

### 4. Edge Cases to Test

- [ ] Non-tutor trying to create forum (should fail)
- [ ] Non-member trying to post (should fail)
- [ ] Voting multiple times (should toggle)
- [ ] Accepting multiple answers (should only allow one)
- [ ] Non-author trying to accept answer (should fail)
- [ ] Adding more than 5 tags (should prevent)
- [ ] Searching forums with special characters
- [ ] Leaving forum with active posts
- [ ] Deleting accepted answer

---

## Deployment Steps

### 1. Database Migration

Ensure MySQL is running and accessible:

```bash
# Check connection
mysql -u root -p -h localhost -P 10000

# Verify migration will run
USE tss_database;
SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;
```

### 2. Backend Deployment

```bash
cd HCMUT-TSS-Backend

# Build the application
./mvnw.cmd clean package -DskipTests

# Run the application
./mvnw.cmd spring-boot:run
```

Check logs for migration success:

```
Flyway: Successfully validated 8 migrations
Flyway: Migrating schema `tss_database` to version "8 - create forum tables"
Flyway: Successfully applied 1 migration
```

### 3. Frontend Deployment

```bash
cd HCMUT-TSS-Frontend

# Install dependencies (if needed)
npm install

# Build for production
npm run build

# Run development server
npm run dev
```

### 4. Verification Checklist

- [ ] All 6 forum tables created in database
- [ ] Backend starts without errors
- [ ] `/api/forums` endpoints accessible
- [ ] Frontend builds successfully
- [ ] Navigation to /tutor-hub works
- [ ] Forum creation works for tutors
- [ ] Forum joining works for all users
- [ ] Post creation works for members
- [ ] Voting system functions correctly
- [ ] Comment acceptance works for authors

---

## Troubleshooting

### Common Issues

#### 1. Migration Not Running

**Problem**: Flyway doesn't execute V8 migration

**Solution**:
```sql
-- Check migration history
SELECT * FROM flyway_schema_history;

-- If V8 is missing, verify file location:
-- Should be in: src/main/resources/db/migration/V8__create_forum_tables.sql
```

#### 2. CSRF Token Errors

**Problem**: POST requests fail with 403 Forbidden

**Solution**: Verify SecurityConfig includes:
```java
.csrf(csrf -> csrf
    .ignoringRequestMatchers("/api/admin/**", "/api/forums/**")
)
```

#### 3. User ID Not Found

**Problem**: `user.userId` is undefined in frontend

**Solution**: Ensure backend ToFEUserDto includes userId and TssUserPrincipal is updated

#### 4. Only Tutors Can Create Posts

**Problem**: Students can't create posts

**Solution**: Check membership:
```java
// Should allow all members, not just tutors
if (!forumMemberRepository.existsByForumForumIdAndUserUserId(forumId, userId)) {
    throw new IllegalStateException("User must be a member to create posts");
}
```

---

## Performance Considerations

### 1. Database Indexes

All performance-critical queries have indexes:

```sql
-- Search forums
CREATE INDEX idx_forums_type ON forums(forum_type);

-- Get user's posts
CREATE INDEX idx_posts_author ON forum_posts(author_user_id);

-- Calculate vote scores
CREATE INDEX idx_votes_user ON forum_votes(user_id);
```

### 2. Query Optimization

Use custom queries to avoid N+1 problems:

```java
@Query("SELECT f FROM Forum f LEFT JOIN FETCH f.members WHERE f.forumId = :id")
Forum findByIdWithMembers(@Param("id") Integer id);
```

### 3. Frontend Optimization

- Use React.memo for expensive components
- Implement pagination for large lists
- Cache API responses when appropriate

---

## Security Considerations

### 1. Authorization Checks

Every operation verifies user permissions:

```java
// Forum creation - tutors only
if (!staffRepository.existsById(userId)) {
    throw new IllegalStateException("Only tutors can create forums");
}

// Post creation - members only
if (!forumMemberRepository.existsByForumForumIdAndUserUserId(forumId, userId)) {
    throw new IllegalStateException("User must be a member");
}

// Accept answer - author only
if (!post.getAuthorUserId().equals(userId)) {
    throw new IllegalStateException("Only post author can accept answers");
}
```

### 2. Input Validation

All DTOs use validation annotations:

```java
public record CreateForumRequest(
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    String title,
    
    @NotNull(message = "Forum type is required")
    ForumType forumType
) {}
```

### 3. XSS Protection

Frontend sanitizes user input before rendering.

---

## Future Enhancements

### Potential Features

1. **Notifications**: Email/push notifications for replies and votes
2. **Rich Text Editor**: Markdown or WYSIWYG editor for posts
3. **File Attachments**: Allow uploading images and documents
4. **Moderation**: Report posts, ban users, pin important threads
5. **Reputation System**: Award points for helpful contributions
6. **Advanced Search**: Full-text search with Elasticsearch
7. **Analytics**: Track popular topics and user engagement
8. **Mobile App**: React Native mobile application

### Scalability

For high traffic:

1. **Caching**: Use Redis for frequently accessed data
2. **CDN**: Serve static assets via CDN
3. **Load Balancing**: Multiple backend instances
4. **Database Replication**: Read replicas for queries
5. **Microservices**: Separate forum service from main app

---

## Support and Maintenance

### Monitoring

Track these metrics:

- Forum creation rate
- Post creation rate
- Average response time
- Vote distribution
- User engagement

### Backup Strategy

Regular backups of forum data:

```bash
# Backup forum tables
mysqldump -u root -p tss_database \
  forums forum_members forum_posts post_tags forum_comments forum_votes \
  > forum_backup_$(date +%Y%m%d).sql
```

### Update Process

When updating forum feature:

1. Create new migration (V9, V10, etc.)
2. Update entities and DTOs
3. Update services and controllers
4. Update frontend types and API client
5. Test thoroughly before deployment
6. Document changes in this guide

---

## Conclusion

The forum feature is now fully integrated into the HCMUT-TSS system. Users can create forums, post questions, provide answers, and vote on content. The implementation follows best practices for security, performance, and maintainability.

For questions or issues, refer to the troubleshooting section or contact the development team.

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintainer**: Development Team
