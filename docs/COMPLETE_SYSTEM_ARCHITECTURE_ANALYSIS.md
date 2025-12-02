# COMPLETE SYSTEM ARCHITECTURE ANALYSIS
## HCMUT-TSS Full Stack Class Diagram Analysis

**Document Purpose:** Comprehensive architecture analysis including all layers (Entity, Service, Controller, Repository, DTO)  
**Generated:** November 28, 2025  
**Analysis Scope:** Complete Spring Boot application architecture

---

## Executive Summary

You're absolutely correct! My previous analysis was focused only on the entity layer. This updated analysis covers the complete system architecture including:

- **21 Entity classes** (domain model)
- **21 Repository interfaces** (data access layer) 
- **17 Service classes** (business logic layer)
- **16 Controller classes** (API layer)
- **43+ DTO classes** (data transfer layer)
- **3 Mapper classes** (transformation layer)
- **Configuration classes** (infrastructure layer)

---

## LAYER 1: CONTROLLER LAYER (REST API)

### Purpose: HTTP API endpoints and request handling

**Controllers Identified (16 classes):**

```
AuthController - Authentication operations
UserController - User profile management  
StudentController - Student-specific operations
StaffController - Staff-specific operations
UserSyncController - User synchronization with external systems
CourseController - Course management APIs
CourseRegistrationController - Course enrollment APIs
ClassController - Class management APIs  
SessionController - Session operations
SessionEnrollmentController - Session enrollment management
MaterialController - Learning materials APIs
ForumController - Forum and discussion APIs
NotificationController - Notification management APIs
EvaluationController - Assessment APIs
FeedbackController - Feedback collection APIs
AdminController - Administrative operations
```

### Controller Architecture Pattern:
```
@RestController
├── @RequestMapping("/api/...")
├── @PreAuthorize("hasAuthority('ROLE')")  // Security
├── @AuthenticationPrincipal TssUserPrincipal  // User context
├── Service dependencies (via @RequiredArgsConstructor)
└── ResponseEntity<DTO> methods  // Structured responses
```

### Example - ForumController Structure:
```
ForumController
├── Dependencies:
│   └── ForumService (injected)
├── Security Annotations:
│   ├── @PreAuthorize("hasAnyAuthority('STAFF')") on createForum()
│   └── Public access on read operations
├── Endpoint Methods:
│   ├── POST /api/forums (createForum)
│   ├── GET /api/forums (getAllForums) 
│   ├── GET /api/forums/{id} (getForumById)
│   ├── DELETE /api/forums/{id} (deleteForum)
│   ├── POST /api/forums/{id}/join (joinForum)
│   ├── POST /api/forums/posts (createPost)
│   ├── POST /api/forums/comments (createComment)
│   └── POST /api/forums/*/vote (voting operations)
└── Response Types:
    ├── ForumResponse
    ├── PostResponse  
    └── CommentResponse
```

---

## LAYER 2: SERVICE LAYER (Business Logic)

### Purpose: Business logic implementation and transaction management

**Services Identified (17 classes):**

```
UserService - Core user operations and external data sync
UserProfileService - Profile management operations
TssUserOAuth2UserService - OAuth2 authentication handling
UserProfilePersistenceService - Profile data persistence
SessionService - Session lifecycle and management
SessionRegistrationService - Session enrollment business logic
NotificationService - Notification creation and delivery
MaterialService - Learning material management
ForumService - Complete forum system business logic
FeedbackService - Feedback collection and processing
EvaluationService - Assessment and evaluation logic
CourseService - Course management operations
CourseRegistrationService - Course enrollment logic
CourseCreationService - Course creation workflows
ClassService - Class management operations
AdminService - Administrative business logic
ActivityLogService - System activity tracking
```

### Service Architecture Pattern:
```
@Service
├── @RequiredArgsConstructor (dependency injection)
├── @Transactional methods (data consistency)
├── Repository dependencies (data access)
├── Cross-service dependencies (business workflows)
├── External service integration (WebClient)
└── DTO mapping (data transformation)
```

### Example - ForumService Dependencies:
```
ForumService
├── Repository Dependencies (8 repositories):
│   ├── ForumRepository
│   ├── ForumMemberRepository  
│   ├── ForumPostRepository
│   ├── ForumCommentRepository
│   ├── ForumVoteRepository
│   ├── PostTagRepository
│   ├── UserRepository
│   └── UniversityStaffRepository
├── Service Dependencies:
│   └── UserProfilePersistenceService
├── Business Methods:
│   ├── Forum Management (create, delete, search)
│   ├── Membership Management (join, leave, validate)
│   ├── Post Management (create, view, search)
│   ├── Comment Management (create, accept)
│   └── Voting System (vote posts/comments)
└── Transaction Management:
    ├── @Transactional on write operations
    └── @Transactional(readOnly = true) on read operations
```

### Service Cross-Dependencies Analysis:
```
Complex Service Interactions:
SessionService → NotificationService (session alerts)
SessionService → ActivityLogService (audit trail)
ForumService → UserProfilePersistenceService (user validation)
UserService → External Datacore Service (user sync)
All Services → Repository Layer (data access)
```

---

## LAYER 3: REPOSITORY LAYER (Data Access)

### Purpose: Data persistence abstraction using Spring Data JPA

**Repositories Identified (21 interfaces):**

```
UserRepository - User entity operations
StudentRepository - Student-specific queries  
UniversityStaffRepository - Staff-specific queries
DepartmentRepository - Department management
CourseRepository - Course data access
CourseRegistrationRepository - Course enrollment data
ClassRepository - Class entity operations
jpaSessionRepository - Session data management
SessionRegistrationRepository - Session enrollment data
MaterialRepository - Learning material storage
ForumRepository - Forum entity operations
ForumMemberRepository - Forum membership data
ForumPostRepository - Forum post operations
ForumCommentRepository - Comment data management
ForumVoteRepository - Voting system data
PostTagRepository - Post tagging system
NotificationRepository - Notification storage
ActivityLogRepository - System audit logs
EvaluationRepository - Assessment data
FeedbackRepository - Feedback storage
[Additional repositories for EvaluationItem, FeedbackRating]
```

### Repository Architecture Pattern:
```
@Repository
├── extends JpaRepository<Entity, ID>
├── Custom query methods (Spring Data naming)
├── @Query annotations (complex operations)
├── Native SQL queries (performance optimization)
└── Specification patterns (dynamic queries)
```

### Example - ForumRepository Methods:
```
ForumRepository extends JpaRepository<Forum, Long>
├── Automatic Methods (from JpaRepository):
│   ├── save(), findById(), findAll(), delete()
│   └── Standard CRUD operations
├── Named Query Methods:
│   ├── findByForumType(ForumType forumType)
│   ├── findByForumTypeAndSubjectContaining(...)
│   └── findByCreatorUserId(Integer userId)
└── Custom Queries:
    └── @Query("SELECT f FROM Forum f WHERE ...")
        searchForums(String query, ForumType type)
```

---

## LAYER 4: DTO LAYER (Data Transfer)

### Purpose: API request/response models and data transformation

**DTO Categories (43+ classes):**

**Request DTOs (API Input):**
```
CreateForumRequest - Forum creation parameters
CreatePostRequest - Post creation data
CreateCommentRequest - Comment submission
CreateSessionRequest - Session scheduling
CreateCourseRequest - Course definition
CreateClassRequest - Class setup
UpdateStudentRequest - Profile updates
UpdateStaffRequest - Staff profile changes
SubmitFeedbackRequest - Feedback submission
SubmitEvaluationRequest - Assessment data
VoteRequest - Voting operations
RescheduleRequest - Session rescheduling
```

**Response DTOs (API Output):**
```
ForumResponse - Complete forum information
PostResponse - Post details with metadata
CommentResponse - Comment with voting stats
SessionResponse - Session details with enrollment
CourseResponse - Course information
ClassResponse - Class details
UserResponse - User profile data
NotificationResponse - Notification details
ActivityLogResponse - System activity records
CourseRegistrationResponse - Enrollment status
SessionRescheduleResponse - Rescheduling results
```

**External Integration DTOs:**
```
RecvDatacoreDto - External user service data
LibraryItemResponse - Library service integration
ToFEUserDto - Frontend user representation
```

### DTO Architecture Pattern:
```
DTO Classes
├── Record types (immutable data)
├── Builder pattern (complex construction)
├── Validation annotations (input validation)
├── JsonProperty annotations (serialization)
└── Documentation annotations
```

---

## LAYER 5: ENTITY LAYER (Domain Model)

### Purpose: Core domain entities with business logic

**Entity Classes (21 classes) - Previously Analyzed:**

```
Core Domain Entities:
├── User Management: User, Student, UniversityStaff, Department
├── Academic Structure: Course, Class, Session  
├── Enrollment: CourseRegistration, SessionEnrollment
├── Forum System: Forum, ForumMember, ForumPost, ForumComment, ForumVote, PostTag
├── Assessment: Evaluation, EvaluationItem, Feedback, FeedbackRating
└── System: Material, Notification, ActivityLog
```

---

## LAYER 6: MAPPER LAYER (Data Transformation)

### Purpose: Entity-DTO mapping and data conversion

**Mapper Classes (3 identified):**

```
FromDatacoreMapper - External service to entity mapping
├── MapStruct-based implementation
├── RecvDatacoreDto → User entity conversion
├── RecvDatacoreDto → Student entity conversion  
├── RecvDatacoreDto → UniversityStaff conversion
└── Custom mapping logic for enums

ToFEUserMapper - Entity to frontend DTO mapping  
├── User entity → ToFEUserDto conversion
├── Role-based information filtering
└── Frontend-specific data formatting

CourseRegistrationMapper - Specialized enrollment mapping
├── CourseRegistration entity → Response DTO
├── Enrollment status calculation
└── Academic progress representation
```

### Mapper Architecture Pattern:
```
@Mapper(componentModel = "spring")
├── @Mapping annotations (field mappings)
├── @Named methods (custom conversion logic)
├── Automatic type conversion (matching field names)
└── Spring dependency injection integration
```

---

## LAYER 7: CONFIGURATION LAYER (Infrastructure)

### Purpose: Application configuration and cross-cutting concerns

**Configuration Classes:**

```
SecurityConfig - OAuth2, CORS, authentication
├── SecurityFilterChain configuration
├── OAuth2 client registration
├── CORS policy definition
├── Role-based access control
└── Authentication success handlers

WebClientConfig - External service communication
├── WebClient bean configuration
├── HTTP client settings
├── Service endpoint configuration
└── Error handling setup

PasswordConfig - Password encoding (SSO service)
├── BCrypt encoder configuration
└── Password policy enforcement
```

---

## COMPLETE ARCHITECTURE FLOW ANALYSIS

### 1. Full Request Flow Example (Forum Creation):

```
1. HTTP Request: POST /api/forums
   └── ForumController.createForum()

2. Security Layer:
   ├── OAuth2 authentication validation
   ├── @PreAuthorize("hasAnyAuthority('STAFF')") check
   └── TssUserPrincipal injection

3. Controller Processing:
   ├── @RequestBody CreateForumRequest validation
   ├── Principal authentication verification
   └── ForumService.createForum() delegation

4. Service Layer (ForumService):
   ├── UserRepository.findByEmail() - user validation
   ├── UniversityStaffRepository.existsById() - permission check
   ├── ForumRepository.save() - forum creation
   ├── ForumMemberRepository.save() - creator auto-membership
   └── Response DTO mapping

5. Data Layer:
   ├── @Transactional boundary management
   ├── JPA entity persistence
   ├── Database constraint validation
   └── Audit trail creation

6. Response Processing:
   ├── Entity → ForumResponse DTO mapping
   ├── HTTP 201 Created status
   └── JSON serialization
```

### 2. Cross-Service Integration Example:

```
Session Notification Flow:
SessionService.rescheduleSession()
├── Session entity modification
├── SessionRegistrationRepository.findBySession() - get enrolled students
├── For each enrolled student:
│   └── NotificationService.createNotification()
│       ├── Notification entity creation
│       ├── NotificationRepository.save()
│       └── Real-time notification (future: WebSocket)
└── ActivityLogService.logActivity() - audit trail
```

### 3. External Service Integration:

```
User Synchronization Flow:
UserService.getAndStoreUserFromDatacore()
├── UserRepository.findByEmail() - check local existence
├── If not exists:
│   ├── WebClient call to HCMUT-DATACORE-MIMIC
│   ├── RecvDatacoreDto response processing
│   ├── FromDatacoreMapper.toUser() conversion
│   ├── UserRepository.save() - local persistence
│   └── UserProfilePersistenceService.persistSubProfile()
│       ├── Role determination (Student/Staff)
│       ├── Department assignment
│       └── Profile completion
└── Return User entity
```

---

## DESIGN PATTERNS IDENTIFIED

### 1. Architectural Patterns:

```
Layered Architecture:
Controller → Service → Repository → Database
├── Clear separation of concerns
├── Dependency injection between layers
├── Unidirectional dependencies
└── Transaction boundary management

Repository Pattern:
├── Data access abstraction
├── Query encapsulation  
├── Technology independence
└── Testability improvement

DTO Pattern:
├── API boundary definition
├── Data transfer optimization
├── Version compatibility
└── Security filtering
```

### 2. Spring Patterns:

```
Dependency Injection:
├── Constructor injection (@RequiredArgsConstructor)
├── Field injection avoidance
├── Interface-based dependencies
└── Configuration externalization

Transaction Management:
├── Declarative transactions (@Transactional)
├── Rollback on runtime exceptions
├── Read-only optimization
└── Isolation level management

Security Integration:
├── Method-level security (@PreAuthorize)
├── Principal propagation
├── Role-based access control
└── OAuth2 token validation
```

### 3. Domain Patterns:

```
Aggregate Pattern:
├── Forum aggregate (Forum + Posts + Comments + Votes)
├── User aggregate (User + Student/Staff + Profile)
├── Course aggregate (Course + Classes + Sessions)
└── Evaluation aggregate (Evaluation + Items + Ratings)

Event-Driven Potential:
├── Notification triggers (session changes)
├── Activity logging (user actions)
├── Audit trail maintenance
└── Real-time updates (forum activities)
```

---

## TECHNOLOGY STACK INTEGRATION

### Spring Framework Components:
```
Spring Boot - Application framework
├── Auto-configuration
├── Embedded server (Tomcat)
├── Actuator endpoints
└── Profile management

Spring Security - Authentication & Authorization
├── OAuth2 client support
├── JWT token processing
├── Method-level security
└── CORS handling

Spring Data JPA - Data access
├── Repository abstraction
├── Query generation
├── Transaction management
└── Database schema management

Spring Web - REST API
├── Controller framework
├── Request mapping
├── Exception handling
└── Content negotiation

Spring WebFlux - Reactive HTTP client
├── Non-blocking service calls
├── Backpressure handling
└── External service integration
```

### Persistence Technologies:
```
JPA/Hibernate - ORM Framework
├── Entity relationship mapping
├── Lazy/eager loading strategies
├── Cascade operations
└── Query optimization

MySQL - Relational Database
├── ACID transaction support
├── Referential integrity
├── Performance indexing
└── Backup and recovery

Flyway - Database Migration
├── Version control for schema
├── Incremental updates
├── Rollback capabilities
└── Environment consistency
```

---

## ARCHITECTURAL RECOMMENDATIONS

### 1. For UML Class Diagrams:

**Create Multiple Diagram Types:**
```
1. Domain Model Diagram (Entities only)
   ├── Focus on business concepts
   ├── Entity relationships and cardinalities
   └── Target: Business stakeholders

2. Service Architecture Diagram (Services + Dependencies)
   ├── Service layer structure
   ├── Cross-service dependencies
   └── Target: Technical architects

3. Complete System Diagram (All layers)
   ├── Full architectural view
   ├── Layer interactions
   └── Target: Development teams

4. Feature-Specific Diagrams (e.g., Forum System)
   ├── Deep dive into complex features
   ├── Complete flow visualization
   └── Target: Feature developers
```

### 2. Include Additional Components:

**Infrastructure Elements:**
```
├── Configuration classes
├── Security configuration
├── External service integration
├── Database relationships
└── Caching mechanisms (if present)
```

**Cross-Cutting Concerns:**
```
├── Transaction boundaries
├── Security annotations
├── Validation rules
├── Error handling
└── Logging and monitoring
```

### 3. Documentation Strategy:

**Layered Documentation:**
```
1. High-level architecture overview
2. Layer-specific detailed documentation  
3. Feature-specific implementation guides
4. Integration and deployment documentation
```

---

## CONCLUSION

The HCMUT-TSS system demonstrates a well-structured Spring Boot architecture with:

- **Clear layer separation** (Controller → Service → Repository → Entity)
- **Comprehensive feature coverage** (Academic management, Forum system, Assessment, Notifications)
- **External service integration** (Microservice architecture)
- **Security integration** (OAuth2, role-based access)
- **Data consistency** (Transaction management)
- **API design** (RESTful endpoints with proper DTOs)

This complete analysis provides the foundation for creating accurate UML class diagrams that represent both the domain model and the complete application architecture. The system shows mature software engineering practices and comprehensive business logic implementation across all identified features.

---

**Next Steps:**
1. Create layered UML class diagrams based on this analysis
2. Include service dependencies and controller relationships  
3. Document cross-cutting concerns and configuration
4. Provide implementation guidance for new features