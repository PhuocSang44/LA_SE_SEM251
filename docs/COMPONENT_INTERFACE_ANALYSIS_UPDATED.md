# Component Interface Analysis - Updated Report
## HCMUT Tutoring Support System (TSS)

**Date:** November 27, 2025  
**Focus:** Forum and Notification Component Relationships

---

## Overview

This report analyzes how the newly added **Forum** and **Notification** components interact with existing system components in the TSS Backend application. The analysis maps component relationships based on the system architecture diagram.

---

## System Component Overview

Based on the architecture diagram, the TSS system consists of the following subsystems:

### User Management Subsystem
- **Authentication** (Component) - OAuth2/OIDC authentication via HCMUT-SSO
- **ProfileManagement** (Component) - User profile data management

### Course and Class Management Subsystem
- **Enrollment** (Component) - Course enrollment and registration
- **CoursesCatalog** (Component) - Course listing and catalog management

### Session Management Subsystem
- **Scheduling** (Component) - Session creation and scheduling
- **SessionParticipation** (Component) - Student session enrollment

### Resources Management Subsystem
- **MaterialSharing** (Component) - Course material upload/download
- **LibraryIntegration** (Component) - Integration with HCMUT-LIBRARY

### User Management Subsystem (NEW)
- **Forum** (Component) - NEW: Discussion forums for courses
- **Notification** (Component) - NEW: User notifications system

### External System Integration
- **HCMUT_SSO** - External SSO system for authentication
- **HCMUT_DATACORE** - External user profile and data storage
- **HCMUT_LIBRARY** - External library system integration

---

## Component Relationship Matrix

### Forum Component Relationships

| Requiring Component | Provides Component | Interface/Client Name | Relationship Type |
|-------------------|-------------------|---------------------|------------------|
| **Forum** | **Authentication** | TssUserPrincipal | Security/User Context |
| **Forum** | **ProfileManagement** (via HCMUT_DATACORE) | UserProfilePersistenceService | User Data Synchronization |
| **Forum** | **HCMUT_DATACORE** (External) | UserProfilePersistenceService | User Profile Sync |
| **Forum** | **HCMUT_SSO** (External) | OAuth2/OIDC | User Authentication |
| Frontend (Forum UI) | **Forum** | ForumController REST API | HTTP/REST Interface |

### Notification Component Relationships

| Requiring Component | Provides Component | Interface/Client Name | Relationship Type |
|-------------------|-------------------|---------------------|------------------|
| **Notification** | **Authentication** | TssUserPrincipal | Security/User Context |
| **Notification** | **ProfileManagement** (via HCMUT_DATACORE) | UserProfilePersistenceService | User Data Access |
| **Notification** | **HCMUT_SSO** (External) | OAuth2/OIDC | User Authentication |
| **Scheduling** (SessionService) | **Notification** | NotificationService.createNotification() | Service Method Call |
| Frontend (Notification Bell) | **Notification** | NotificationController REST API | HTTP/REST Interface |

### Cross-Component Dependencies (Forum → Other Components)

| Requiring Component | Provides Component | Interface/Client Name | Relationship Type |
|-------------------|-------------------|---------------------|------------------|
| **Forum** | User Database (shared) | UserRepository (JPA) | Data Access Layer |
| **Forum** | Staff Database (shared) | UniversityStaffRepository (JPA) | Data Access Layer |
| **Forum** | **Authentication** | @PreAuthorize("hasAnyAuthority('STAFF')") | Role-Based Access Control |

### Cross-Component Dependencies (Notification → Other Components)

| Requiring Component | Provides Component | Interface/Client Name | Relationship Type |
|-------------------|-------------------|---------------------|------------------|
| **Scheduling** | **Notification** | NotificationService | Internal Service Integration |
| **Notification** | User Database (shared) | UserRepository (JPA) | Data Access Layer |
| **SessionParticipation** (via Scheduling) | **Notification** | NotificationService | Indirect Integration |


---

## Detailed Component Interaction Analysis

### 1. Forum Component Interactions

#### 1.1 Forum → Authentication
**Interface Type:** Security Integration  
**Implementation:**
- ForumController uses `@AuthenticationPrincipal TssUserPrincipal` to access authenticated user
- ForumService validates user identity via `TssUserPrincipal.getEmail()`
- Authorization checks: `@PreAuthorize("hasAnyAuthority('STAFF')")` for forum creation

**Data Flow:**
```
User Request → OAuth2 Filter → TssUserPrincipal → ForumController → ForumService
```

#### 1.2 Forum → ProfileManagement (HCMUT_DATACORE)
**Interface Type:** User Data Synchronization  
**Implementation:**
- ForumService uses `UserProfilePersistenceService.ensureUserSubProfilePersisted(principal)`
- Ensures user profile exists in local database before forum operations
- Synchronizes user data from HCMUT-DATACORE system

**Dependencies:**
```java
// ForumService.java
private final UserProfilePersistenceService userProfilePersistenceService;

private User getUserFromPrincipal(TssUserPrincipal principal) {
    userProfilePersistenceService.ensureUserSubProfilePersisted(principal);
    return userRepository.findByEmail(principal.getEmail())
        .orElseThrow(() -> new RuntimeException("User not found"));
}
```

#### 1.3 Forum → User Database (Shared Resource)
**Interface Type:** Data Access Layer  
**Repositories Used:**
- `UserRepository` - Access user information
- `UniversityStaffRepository` - Validate tutor/staff role

**Purpose:**
- Retrieve user details for forum operations
- Determine user roles (tutor vs student)
- Map user data to response DTOs

---

### 2. Notification Component Interactions

#### 2.1 Notification → Authentication
**Interface Type:** Security Integration  
**Implementation:**
- NotificationController uses `@AuthenticationPrincipal TssUserPrincipal` 
- Notification ownership validated by user email/ID
- Only authenticated users can access their notifications

**Data Flow:**
```
User Request → OAuth2 Filter → TssUserPrincipal → NotificationController → NotificationService
```

#### 2.2 Scheduling → Notification (Integration)
**Interface Type:** Internal Service Method Call  
**Implementation:**
- SessionService (Scheduling component) creates notifications when:
  - New session is created
  - Session is updated (time/location change)
  - Session is cancelled

**Code Example:**
```java
// SessionService.java
private final NotificationService notificationService;

// When creating session
notificationService.createNotification(
    student,
    "New Session Created",
    message,
    "UPDATE",
    sessionId,
    classId
);

// When cancelling session
notificationService.createNotification(
    student,
    "Session Cancelled",
    message,
    "CANCELLATION",
    sessionId,
    classId
);
```

**Notification Types Triggered by Scheduling:**
- `UPDATE` - Session creation or modification
- `CANCELLATION` - Session cancelled by tutor

#### 2.3 Notification → User Database (Shared Resource)
**Interface Type:** Data Access Layer  
**Repositories Used:**
- `UserRepository` - Retrieve user for notification creation
- `NotificationRepository` - Store and retrieve notifications

**Purpose:**
- Create notifications for specific users
- Query notifications by user ID
- Track read/unread status

---

### 3. External System Integrations

#### 3.1 Forum/Notification → HCMUT_SSO
**Interface Type:** OAuth2/OIDC Authentication  
**Flow:**
1. User logs in via HCMUT-SSO-MIMIC
2. OAuth2 token generated with user claims
3. TssUserPrincipal created from OAuth2User
4. Principal passed to Forum/Notification controllers

**Shared Authentication:**
- Both Forum and Notification use the same authentication mechanism
- No direct API calls to SSO from these components
- Authentication handled by Spring Security filters

#### 3.2 Forum/Notification → HCMUT_DATACORE
**Interface Type:** User Profile Synchronization  
**Service:** UserProfilePersistenceService  
**Purpose:**
- Ensure user profile exists in local TSS database
- Sync user data (name, email, department) from HCMUT-DATACORE
- Create Student/UniversityStaff sub-profiles if missing

**When Triggered:**
- First time a user performs forum/notification operations
- On every authenticated request (checks if sync needed)

---

### 4. Component Independence Analysis

#### 4.1 Components NOT Interacting with Forum

| Component | Reason for No Interaction |
|-----------|---------------------------|
| **Enrollment** (CoursesCatalog) | Forum is course-agnostic; forums are created independently by tutors |
| **CoursesCatalog** | Forum doesn't depend on course catalog data |
| **SessionParticipation** | Direct interaction not needed; uses Notification indirectly |
| **MaterialSharing** | Separate resource management; no cross-dependency |
| **LibraryIntegration** | External library system; no forum integration |

#### 4.2 Components NOT Interacting with Notification

| Component | Reason for No Interaction |
|-----------|---------------------------|
| **Enrollment** | No enrollment notifications implemented yet |
| **CoursesCatalog** | Catalog browsing doesn't trigger notifications |
| **MaterialSharing** | Material upload/download doesn't notify users yet |
| **LibraryIntegration** | External system; no notification integration |
| **Forum** | Forum doesn't create notifications (yet - future enhancement opportunity) |

---

### 5. Potential Future Integrations

#### 5.1 Forum → MaterialSharing (Proposed)
**Use Case:** Attach course materials to forum posts  
**Interface:** MaterialService API  
**Implementation:**
```java
// Proposed enhancement
PostResponse createPost(CreatePostRequest request) {
    // ...existing code...
    if (request.materialId() != null) {
        Material material = materialService.getMaterialById(request.materialId());
        post.setAttachedMaterial(material);
    }
}
```

#### 5.2 Forum → Notification (Proposed)
**Use Case:** Notify forum members when new posts/answers are added  
**Interface:** NotificationService.createNotification()  
**Notification Types:**
- `NEW_POST` - New question posted in joined forum
- `NEW_ANSWER` - Answer posted to user's question
- `ACCEPTED_ANSWER` - User's answer accepted by question author

#### 5.3 Enrollment → Notification (Proposed)
**Use Case:** Notify students when enrollment succeeds/fails  
**Interface:** NotificationService.createNotification()  
**Notification Types:**
- `ENROLLMENT_SUCCESS` - Successfully enrolled in class
- `ENROLLMENT_FAILED` - Enrollment failed (class full, prerequisites not met)

#### 5.4 MaterialSharing → Notification (Proposed)
**Use Case:** Notify enrolled students when new materials are uploaded  
**Interface:** NotificationService.createNotification()  
**Notification Types:**
- `NEW_MATERIAL` - New material uploaded to course

---

## REST API Interface Summary

### Forum Component API Endpoints

| Endpoint | Method | Purpose | Dependencies |
|----------|--------|---------|--------------|
| `/api/forums` | POST | Create forum | Authentication, ProfileManagement |
| `/api/forums` | GET | List all forums | Authentication |
| `/api/forums/{id}` | GET | Get forum details | Authentication |
| `/api/forums/{id}` | DELETE | Delete forum | Authentication, Owner check |
| `/api/forums/search` | GET | Search forums | Authentication |
| `/api/forums/{id}/join` | POST | Join forum | Authentication |
| `/api/forums/{id}/leave` | DELETE | Leave forum | Authentication |
| `/api/forums/posts` | POST | Create post | Authentication, Membership check |
| `/api/forums/{forumId}/posts` | GET | Get posts | Authentication |
| `/api/forums/posts/{postId}` | GET | Get post details | Authentication |
| `/api/forums/posts/{postId}` | PUT | Update post | Authentication, Author check |
| `/api/forums/posts/{postId}` | DELETE | Delete post | Authentication, Author check |
| `/api/forums/posts/{postId}/comments` | POST | Add comment | Authentication |
| `/api/forums/posts/{postId}/comments` | GET | Get comments | Authentication |
| `/api/forums/comments/{id}` | PUT | Update comment | Authentication, Author check |
| `/api/forums/comments/{id}` | DELETE | Delete comment | Authentication, Author check |
| `/api/forums/comments/{id}/accept` | POST | Accept answer | Authentication, Post author check |
| `/api/forums/posts/{id}/vote` | POST | Vote on post | Authentication |
| `/api/forums/comments/{id}/vote` | POST | Vote on comment | Authentication |

### Notification Component API Endpoints

| Endpoint | Method | Purpose | Dependencies |
|----------|--------|---------|--------------|
| `/api/notifications` | GET | Get all user notifications | Authentication |
| `/api/notifications/unread` | GET | Get unread notifications | Authentication |
| `/api/notifications/unread/count` | GET | Get unread count | Authentication |
| `/api/notifications/{id}/read` | PATCH | Mark notification as read | Authentication, Owner check |
| `/api/notifications/read-all` | PATCH | Mark all as read | Authentication |

---

## Database Relationship Diagram

### Forum Component Tables

```
┌─────────────────┐
│     forums      │
│─────────────────│
│ forum_id (PK)   │
│ creator_user_id │───┐
│ title           │   │
│ description     │   │
│ forum_type      │   │
│ subject         │   │
└─────────────────┘   │
                      │
        ┌─────────────┼──────────────┐
        │             │              │
        ▼             │              ▼
┌──────────────┐      │      ┌──────────────┐
│forum_members │      │      │ forum_posts  │
│──────────────│      │      │──────────────│
│ member_id    │      │      │ post_id (PK) │
│ forum_id (FK)│      │      │ forum_id (FK)│
│ user_id (FK) │──────┼──────│author_user_id│
└──────────────┘      │      │ title        │
                      │      │ content      │
                      │      └──────────────┘
                      │              │
                      │              ▼
                      │      ┌──────────────┐
                      │      │  post_tags   │
                      │      │──────────────│
                      │      │ tag_id (PK)  │
                      │      │ post_id (FK) │
                      │      │ tag_name     │
                      │      └──────────────┘
                      │
                      ▼
              ┌─────────────┐
              │    user     │ (Shared Table)
              │─────────────│
              │ user_id (PK)│
              │ email       │
              │ first_name  │
              │ last_name   │
              └─────────────┘
                      │
                      ▼
              ┌──────────────────┐
              │university_staff  │ (Shared Table)
              │──────────────────│
              │ staff_id (PK=FK) │
              │ department       │
              └──────────────────┘
```

### Notification Component Tables

```
┌──────────────────┐
│   notification   │
│──────────────────│
│notification_id PK│
│ user_id (FK)     │───┐
│ title            │   │
│ message          │   │
│ type             │   │
│ is_read          │   │
│ session_id       │   │
│ class_id         │   │
│ created_at       │   │
│ read_at          │   │
└──────────────────┘   │
                       │
                       ▼
               ┌─────────────┐
               │    user     │ (Shared Table)
               │─────────────│
               │ user_id (PK)│
               │ email       │
               └─────────────┘
```

---

## Service Layer Dependency Graph

### Forum Component Dependencies

```
ForumController
    │
    ▼
ForumService
    ├── ForumRepository
    ├── ForumMemberRepository
    ├── ForumPostRepository
    ├── PostTagRepository
    ├── ForumCommentRepository
    ├── ForumVoteRepository
    ├── UserRepository (Shared)
    ├── UniversityStaffRepository (Shared)
    └── UserProfilePersistenceService (Shared)
            │
            ▼
        HCMUT-DATACORE (External API)
```

### Notification Component Dependencies

```
NotificationController
    │
    ▼
NotificationService
    ├── NotificationRepository
    └── UserRepository (Shared)

SessionService (Scheduling Component)
    │
    └── NotificationService.createNotification()
            │
            ▼
        NotificationRepository
```

---

## Shared Resources Between Components

### Shared Database Tables

| Table Name | Used By Components | Purpose |
|-----------|-------------------|---------|
| `user` | Forum, Notification, Scheduling, Enrollment, ProfileManagement | User identity and basic info |
| `university_staff` | Forum, Scheduling, Enrollment | Tutor/staff role validation |
| `student` | Notification (via Scheduling), Enrollment | Student-specific data |

### Shared Services

| Service Name | Used By Components | Purpose |
|-------------|-------------------|---------|
| UserProfilePersistenceService | Forum, Scheduling, Enrollment, ProfileManagement | User profile sync with HCMUT-DATACORE |
| NotificationService | Scheduling, (Future: Forum, Enrollment, MaterialSharing) | Create and manage notifications |

### Shared Security Context

| Security Component | Used By Components | Purpose |
|-------------------|-------------------|---------|
| TssUserPrincipal | All TSS Components | Authenticated user context |
| OAuth2 Configuration | All TSS Components | SSO authentication |
| @PreAuthorize | Forum, Scheduling, Enrollment | Role-based authorization |

---

## Integration Sequence Diagrams

### Forum Creation Flow

```
User → Frontend → ForumController → ForumService → Repositories → Database
                         │                │
                         │                └──→ UserProfilePersistenceService
                         │                            │
                         │                            └──→ HCMUT-DATACORE (sync user)
                         │
                         └──→ TssUserPrincipal (authentication)
                                    │
                                    └──→ HCMUT-SSO (validated)
```

### Session Cancellation with Notification Flow

```
Tutor → Frontend → SessionController → SessionService → SessionRepository
                                            │                    │
                                            │                    └──→ Delete Session
                                            │
                                            └──→ NotificationService.createNotification()
                                                        │
                                                        └──→ NotificationRepository
                                                                    │
                                                                    └──→ Insert Notification

Student → Frontend → NotificationController → NotificationService → NotificationRepository
                                                                              │
                                                                              └──→ Query Unread
```

---

## Authorization Matrix

### Forum Component Authorization

| Operation | Required Authentication | Role Requirement | Additional Checks |
|-----------|------------------------|------------------|-------------------|
| Create Forum | Yes | STAFF (Tutor) | None |
| View Forums | Yes | Any | None |
| Join Forum | Yes | Any | Not already member |
| Leave Forum | Yes | Any | Is member, not creator |
| Delete Forum | Yes | Any | Must be forum creator |
| Create Post | Yes | Any | Must be forum member OR creator |
| Edit Post | Yes | Any | Must be post author |
| Delete Post | Yes | Any | Must be post author |
| Add Comment | Yes | Any | None |
| Edit Comment | Yes | Any | Must be comment author |
| Delete Comment | Yes | Any | Must be comment author |
| Vote | Yes | Any | None |
| Accept Answer | Yes | Any | Must be post author |

### Notification Component Authorization

| Operation | Required Authentication | Role Requirement | Additional Checks |
|-----------|------------------------|------------------|-------------------|
| View Notifications | Yes | Any | User can only see own notifications |
| Mark as Read | Yes | Any | Notification must belong to user |
| Mark All as Read | Yes | Any | Only affects user's notifications |

---

## Cross-Component Communication Patterns

### Pattern 1: Direct Service Invocation (Scheduling → Notification)

**Type:** Synchronous Method Call  
**Example:**
```java
@Service
public class SessionService {
    private final NotificationService notificationService;
    
    public void cancelSession(Long sessionId, TssUserPrincipal principal) {
        // Cancel session logic
        session.setCancelled(true);
        sessionRepository.save(session);
        
        // Notify enrolled students
        List<User> enrolledStudents = getEnrolledStudents(sessionId);
        for (User student : enrolledStudents) {
            notificationService.createNotification(
                student,
                "Session Cancelled",
                message,
                "CANCELLATION",
                sessionId,
                classId
            );
        }
    }
}
```

**Characteristics:**
- Tight coupling between components
- Immediate notification creation
- Transactional consistency

### Pattern 2: Shared Data Access (Forum → User Database)

**Type:** Shared Repository Pattern  
**Example:**
```java
@Service
public class ForumService {
    private final UserRepository userRepository; // Shared with other components
    
    public ForumResponse createForum(CreateForumRequest request, TssUserPrincipal principal) {
        User creator = userRepository.findByEmail(principal.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        // Use creator for forum creation
    }
}
```

**Characteristics:**
- Loose coupling
- Shared data layer
- Consistent user data across components

### Pattern 3: External Service Synchronization (Forum → HCMUT_DATACORE)

**Type:** Service Facade Pattern  
**Example:**
```java
@Service
public class ForumService {
    private final UserProfilePersistenceService userProfilePersistenceService;
    
    private User getUserFromPrincipal(TssUserPrincipal principal) {
        // Ensure user profile synced from HCMUT-DATACORE
        userProfilePersistenceService.ensureUserSubProfilePersisted(principal);
        
        return userRepository.findByEmail(principal.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
```

**Characteristics:**
- External system abstraction
- Profile synchronization before operations
- Consistent with other components (Scheduling, Enrollment)

---

## Summary: Component Relationship Overview

### Forum Component Relationships
✅ **Uses (Requires):**
- Authentication (TssUserPrincipal, OAuth2)
- ProfileManagement (UserProfilePersistenceService)
- User Database (UserRepository, UniversityStaffRepository)
- HCMUT_SSO (External)
- HCMUT_DATACORE (External)

❌ **Does NOT Use:**
- Scheduling
- SessionParticipation
- Enrollment
- CoursesCatalog
- MaterialSharing
- LibraryIntegration
- Notification

### Notification Component Relationships
✅ **Uses (Requires):**
- Authentication (TssUserPrincipal, OAuth2)
- User Database (UserRepository)
- HCMUT_SSO (External)

✅ **Used By (Provides To):**
- Scheduling (SessionService creates notifications)

❌ **Does NOT Use:**
- ProfileManagement (directly)
- Enrollment
- SessionParticipation
- CoursesCatalog
- MaterialSharing
- LibraryIntegration
- Forum

---

## Future Enhancement Opportunities

### High Priority Integrations

1. **Forum → Notification Integration**
   - Notify forum members of new posts
   - Notify users when their questions receive answers
   - Notify users when their answers are accepted

2. **Enrollment → Notification Integration**
   - Notify students of successful/failed enrollments
   - Notify tutors when students enroll in their classes

3. **MaterialSharing → Notification Integration**
   - Notify enrolled students when new materials are uploaded
   - Notify students when material access is revoked

### Medium Priority Integrations

4. **Forum → CoursesCatalog Integration**
   - Link forums to specific courses
   - Auto-create course-specific forums

5. **Forum → MaterialSharing Integration**
   - Attach materials to forum posts
   - Reference library items in forum discussions

---

**Document Version:** 2.0  
**Last Updated:** November 27, 2025  
**Prepared by:** AI Assistant based on source code analysis and architecture diagram

- `DELETE /api/forums/{forumId}/leave` - Leave forum

**Authorization:**
- Forum Creation: `@PreAuthorize("hasAnyAuthority('STAFF')")`
- Forum Deletion: Creator validation in service layer
- Other operations: Authenticated users only

### 2. Forum Post Management Interface

| Requiring Component | Provides Component | Interface/Client Name | Relationship Type |
|-------------------|-------------------|---------------------|------------------|
| TSS Frontend (Forum Pages) | Forum Post Service | ForumController REST API | HTTP/REST API |
| ForumController | ForumService | Business Logic Interface | Internal Service Call |
| ForumService | ForumPostRepository | JPA Repository Interface | Data Persistence |
| ForumService | PostTagRepository | JPA Repository Interface | Data Persistence |
| ForumService | ForumMemberRepository | JPA Repository Interface | Membership Validation |

**API Endpoints:**
- `POST /api/forums/posts` - Create post
- `GET /api/forums/{forumId}/posts` - Get posts by forum
- `GET /api/forums/posts/{postId}` - Get post details
- `PUT /api/forums/posts/{postId}` - Update post
- `DELETE /api/forums/posts/{postId}` - Delete post

**Business Rules:**
- Only forum members OR forum creators can create posts
- Post authors can edit/delete their own posts
- Tags are automatically associated with posts

### 3. Forum Comment Management Interface

| Requiring Component | Provides Component | Interface/Client Name | Relationship Type |
|-------------------|-------------------|---------------------|------------------|
| TSS Frontend (Post Detail Page) | Forum Comment Service | ForumController REST API | HTTP/REST API |
| ForumController | ForumService | Business Logic Interface | Internal Service Call |
| ForumService | ForumCommentRepository | JPA Repository Interface | Data Persistence |
| ForumService | ForumPostRepository | JPA Repository Interface | Post Validation |

**API Endpoints:**
- `POST /api/forums/posts/{postId}/comments` - Add comment
- `GET /api/forums/posts/{postId}/comments` - Get comments
- `PUT /api/forums/comments/{commentId}` - Update comment
- `DELETE /api/forums/comments/{commentId}` - Delete comment
- `POST /api/forums/comments/{commentId}/accept` - Mark as accepted answer

**Business Rules:**
- Comments can only be added to existing posts
- Comment authors can edit/delete their own comments
- Post authors can mark comments as accepted answers

### 4. Forum Vote Management Interface

| Requiring Component | Provides Component | Interface/Client Name | Relationship Type |
|-------------------|-------------------|---------------------|------------------|
| TSS Frontend (Post/Comment) | Forum Vote Service | ForumController REST API | HTTP/REST API |
| ForumController | ForumService | Business Logic Interface | Internal Service Call |
| ForumService | ForumVoteRepository | JPA Repository Interface | Data Persistence |

**API Endpoints:**
- `POST /api/forums/posts/{postId}/vote` - Vote on post
- `POST /api/forums/comments/{commentId}/vote` - Vote on comment

**Business Rules:**
- Users can upvote or downvote posts/comments
- Vote type: `UPVOTE` or `DOWNVOTE`
- One vote per user per post/comment (upsert logic)

---

## Notification System Interfaces

### 1. Notification Management Interface

| Requiring Component | Provides Component | Interface/Client Name | Relationship Type |
|-------------------|-------------------|---------------------|------------------|
| TSS Frontend (Notification Bell) | Notification Service | NotificationController REST API | HTTP/REST API |
| NotificationController | NotificationService | Business Logic Interface | Internal Service Call |
| NotificationService | NotificationRepository | JPA Repository Interface | Data Persistence |
| NotificationService | UserRepository | JPA Repository Interface | User Validation |

**API Endpoints:**
- `GET /api/notifications` - Get all user notifications
- `GET /api/notifications/unread` - Get unread notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PATCH /api/notifications/{id}/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all as read

**Authorization:**
- All endpoints require authentication
- Users can only access their own notifications
- Ownership validation in service layer

### 2. Notification Creation Interface

| Requiring Component | Provides Component | Interface/Client Name | Relationship Type |
|-------------------|-------------------|---------------------|------------------|
| Session Management Service | Notification Service | NotificationService.createNotification() | Internal Service Call |
| Any Backend Service | Notification Service | NotificationService.createNotification() | Internal Service Call |

**Method Signature:**
```java
void createNotification(
    User user,
    String title,
    String message,
    String type,
    Long sessionId,
    Long classId
)
```

**Notification Types:**
- `INFO` - General information
- `UPDATE` - Session update notification
- `CANCELLATION` - Session cancellation notification
- `REMINDER` - Session reminder (future use)

**Current Integrations:**
- **SessionService** creates notifications for:
  - Session updates (time/location changes)
  - Session cancellations
  
---

## Database Schema Interfaces

### Forum Database Tables (V8 Migration)

| Table Name | Primary Key | Foreign Keys | Purpose |
|-----------|------------|-------------|---------|
| `forums` | forum_id (BIGINT) | creator_user_id → user(user_id) | Store forum metadata |
| `forum_members` | member_id (BIGINT) | forum_id → forums, user_id → user | Track forum membership |
| `forum_posts` | post_id (BIGINT) | forum_id → forums, author_user_id → user | Store forum posts/questions |
| `post_tags` | tag_id (BIGINT) | post_id → forum_posts | Categorize posts with tags |
| `forum_comments` | comment_id (BIGINT) | post_id → forum_posts, author_user_id → user, parent_comment_id → forum_comments | Store answers/replies |
| `forum_votes` | vote_id (BIGINT) | post_id → forum_posts, comment_id → forum_comments, user_id → user | Track upvotes/downvotes |

**Cascade Rules:**
- Forum deletion → Cascades to members, posts, comments, votes
- Post deletion → Cascades to tags, comments, votes
- Comment deletion → Cascades to child comments, votes

### Notification Database Table (V9 Migration)

| Table Name | Primary Key | Foreign Keys | Purpose |
|-----------|------------|-------------|---------|
| `notification` | notification_id (BIGINT) | user_id → user(user_id) | Store user notifications |

**Indexes:**
- `idx_notification_user` on user_id
- `idx_notification_read` on is_read
- `idx_notification_created` on created_at

**Cascade Rules:**
- User deletion → Cascades to all user notifications

---

## Data Transfer Object (DTO) Interfaces

### Forum DTOs

| DTO Name | Direction | Purpose | Fields |
|---------|-----------|---------|--------|
| CreateForumRequest | Frontend → Backend | Create new forum | title, description, forumType, subject |
| ForumResponse | Backend → Frontend | Forum data with metadata | forumId, title, description, forumType, subject, creatorUserId, creatorName, memberCount, postCount, isJoined, createdAt |
| CreatePostRequest | Frontend → Backend | Create new post | forumId, title, content, tags[] |
| PostResponse | Backend → Frontend | Post data with metrics | postId, forumId, authorUserId, authorName, title, content, tags[], views, upvotes, downvotes, commentCount, hasAcceptedAnswer, createdAt, updatedAt |
| CreateCommentRequest | Frontend → Backend | Add comment to post | postId, content |
| CommentResponse | Backend → Frontend | Comment data | commentId, postId, authorUserId, authorName, content, isAcceptedAnswer, upvotes, downvotes, parentCommentId, createdAt, updatedAt |
| VoteRequest | Frontend → Backend | Vote on post/comment | voteType (UPVOTE/DOWNVOTE) |

### Notification DTOs

| DTO Name | Direction | Purpose | Fields |
|---------|-----------|---------|--------|
| NotificationResponse | Backend → Frontend | Notification data | notificationId, title, message, type, isRead, sessionId, classId, createdAt, readAt |

---

## Authentication & Authorization Flow

### Forum Feature Authorization Matrix

| Operation | Required Role | Additional Checks |
|-----------|--------------|------------------|
| Create Forum | STAFF (Tutor) | None |
| Delete Forum | Authenticated | Must be forum creator |
| Join Forum | Authenticated | None |
| Leave Forum | Authenticated | Cannot leave if creator |
| Create Post | Authenticated | Must be member OR creator of forum |
| Edit Post | Authenticated | Must be post author |
| Delete Post | Authenticated | Must be post author |
| Add Comment | Authenticated | None |
| Edit Comment | Authenticated | Must be comment author |
| Delete Comment | Authenticated | Must be comment author |
| Vote | Authenticated | None |
| Accept Answer | Authenticated | Must be post author |

### Notification Authorization Matrix

| Operation | Required Role | Additional Checks |
|-----------|--------------|------------------|
| Get Notifications | Authenticated | User can only see own notifications |
| Mark as Read | Authenticated | Notification must belong to user |
| Mark All as Read | Authenticated | Only affects user's own notifications |

---

## Service Layer Dependencies

### ForumService Dependencies

```
ForumService
├── ForumRepository (JPA)
├── ForumMemberRepository (JPA)
├── ForumPostRepository (JPA)
├── PostTagRepository (JPA)
├── ForumCommentRepository (JPA)
├── ForumVoteRepository (JPA)
├── UserRepository (JPA)
├── UniversityStaffRepository (JPA)
└── UserProfilePersistenceService (Internal)
```

### NotificationService Dependencies

```
NotificationService
├── NotificationRepository (JPA)
└── UserRepository (JPA)
```

### Cross-Service Integration

```
SessionService
└── NotificationService.createNotification()
    └── Triggers notifications for session updates/cancellations
```

---

## Transaction Management

### Forum Feature Transactions

| Service Method | Transaction Type | Reason |
|---------------|-----------------|--------|
| createForum() | @Transactional | Creates forum + auto-joins creator |
| deleteForum() | @Transactional | Cascading deletes |
| joinForum() | @Transactional | Creates membership record |
| leaveForum() | @Transactional | Deletes membership record |
| createPost() | @Transactional | Creates post + tags atomically |
| createComment() | @Transactional | Creates comment + updates counts |
| votePost/Comment() | @Transactional | Upsert vote + update counts |

### Notification Transactions

| Service Method | Transaction Type | Reason |
|---------------|-----------------|--------|
| createNotification() | None | Single insert operation |
| markAsRead() | @Transactional | Updates read status + timestamp |
| markAllAsRead() | @Transactional | Bulk update operation |

---

## Security Considerations

### Forum Feature Security

1. **Authorization Enforcement:**
   - Controller level: `@PreAuthorize` for role-based access
   - Service level: Owner/membership validation

2. **Data Isolation:**
   - Users can only interact with forums they're members of (for posts)
   - Creators have additional privileges

3. **Input Validation:**
   - DTO validation with Spring Validation
   - Business logic validation in service layer

### Notification Security

1. **Authorization Enforcement:**
   - All endpoints require authentication
   - Service layer validates notification ownership

2. **Data Isolation:**
   - Repository queries filtered by user
   - Cross-user access prevented in service layer

3. **Sensitive Data:**
   - Notifications may contain session/class references
   - Access controlled through user association

---

## Performance Considerations

### Forum Feature

1. **Database Indexes:**
   - Foreign key indexes on all relationship tables
   - Composite unique index on forum_members(forum_id, user_id)

2. **Query Optimization:**
   - Read-only transactions for queries
   - Selective field loading with DTOs

3. **Caching Opportunities:**
   - Forum metadata (title, description)
   - Member counts, post counts
   - User profile data from UserProfilePersistenceService

### Notification System

1. **Database Indexes:**
   - `idx_notification_user` - Fast user notification lookup
   - `idx_notification_read` - Fast unread filtering
   - `idx_notification_created` - Ordered retrieval

2. **Query Optimization:**
   - Unread count query optimized with COUNT
   - Bulk update for mark-all-as-read

3. **Scaling Considerations:**
   - Notifications table can grow large
   - Consider archival strategy for old read notifications
   - Potential for real-time push notifications (future)

---

## Integration Points Summary

### External System Integrations

| TSS Component | External System | Interface Type | Purpose |
|--------------|----------------|---------------|---------|
| Forum Management | HCMUT-DATACORE | HTTP REST API | User profile synchronization |
| Notification Management | HCMUT-DATACORE | HTTP REST API | User profile synchronization |
| All Backend Components | HCMUT-SSO-MIMIC | OAuth2/OIDC | Authentication |

### Internal System Integrations

| Source Component | Target Component | Interface Type | Purpose |
|-----------------|-----------------|---------------|---------|
| SessionService | NotificationService | Java Method Call | Create session-related notifications |
| ForumController | ForumService | Java Method Call | Business logic execution |
| NotificationController | NotificationService | Java Method Call | Business logic execution |
| All Services | Repositories | Spring Data JPA | Data persistence |

---

## Future Enhancement Opportunities

### Forum Feature

1. **Real-time Updates:**
   - WebSocket integration for live post/comment updates
   - Notification when answers are posted

2. **Rich Content:**
   - File attachment support via Material Management
   - Code snippet formatting
   - Image embedding

3. **Moderation:**
   - Report inappropriate content
   - Admin moderation interface
   - Content flagging system

4. **Search Enhancement:**
   - Full-text search across posts/comments
   - Advanced filtering (by tags, date, author)
   - Elasticsearch integration

### Notification System

1. **Real-time Delivery:**
   - WebSocket/SSE for instant notifications
   - Push notification support (web/mobile)

2. **Notification Preferences:**
   - User settings for notification types
   - Email digest options
   - Do-not-disturb periods

3. **Rich Notifications:**
   - Action buttons in notifications
   - Deep linking to relevant pages
   - Inline preview of content

4. **Analytics:**
   - Notification delivery tracking
   - Read/action rates
   - User engagement metrics

---

## Conclusion

The Forum and Notification features are well-integrated into the TSS backend architecture, following established patterns:

- **Consistent Interface Design:** REST APIs with standard CRUD operations
- **Security First:** Authentication and authorization at multiple layers
- **Data Integrity:** Proper foreign key constraints and cascading rules
- **Service Separation:** Clear boundaries between controllers, services, and repositories
- **Extensibility:** Designed for future enhancements without breaking changes

Both features maintain compatibility with the existing authentication system (TssUserPrincipal) and user data synchronization (UserProfilePersistenceService), ensuring seamless integration with the overall TSS ecosystem.

---

**Document Version:** 2.0  
**Last Updated:** November 27, 2025  
**Prepared by:** AI Assistant based on source code analysis
