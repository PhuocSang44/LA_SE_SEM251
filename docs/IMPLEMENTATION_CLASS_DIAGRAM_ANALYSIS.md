# IMPLEMENTATION CLASS DIAGRAM ANALYSIS
## HCMUT-TSS System - Simplified Implementation Details

**Document Purpose:** Implementation perspective class diagram - tóm gọn attributes và methods  
**Generated:** November 28, 2025  
**Analysis Type:** Implementation View (attributes, methods, types only)

---

## DOMAIN 1: USER MANAGEMENT

### User <<Entity>>
**Attributes:**
- userId: Integer (private)
- email: String (private)
- firstName: String (private)
- middleName: String (private)
- lastName: String (private)
- userType: UserType (private)
- status: UserStatus (private)

### Student <<Entity>>
**Attributes:**
- userId: Integer (private)
- user: User (private)
- studentId: String (private)
- department: Department (private)
- major: String (private)
- academicLevel: String (private)

### UniversityStaff <<Entity>>
**Attributes:**
- userId: Integer (private)
- user: User (private)
- staffId: String (private)
- department: Department (private)
- position: String (private)
- role: String (private)

### Department <<Entity>>
**Attributes:**
- departmentId: Integer (private)
- departmentName: String (private)

### UserService <<Service>>
**Dependencies:**
- userRepository: UserRepository (private)
- studentRepository: StudentRepository (private)
- universityStaffRepository: UniversityStaffRepository (private)
- departmentRepository: DepartmentRepository (private)
- datacoreWebClient: WebClient (private)
- fromDatacoreMapper: FromDatacoreMapper (private)
- userProfilePersistenceService: UserProfilePersistenceService (private)

**Methods:**
+ getAndStoreUserFromDatacore(principal: TssUserPrincipal): User
+ getUserFromDatabase(principal: TssUserPrincipal): Optional<User>
+ updateStaffProfile(userId: Integer, request: UpdateStaffRequest): void
+ updateStudentProfile(userId: Integer, request: UpdateStudentRequest): void
- createStudent(dto: RecvDatacoreDto, user: User, department: Department): void
- createStaff(dto: RecvDatacoreDto, user: User, department: Department): void

### UserRepository <<Repository>>
**Methods:**
+ findByEmail(email: String): Optional<User>
+ save(entity: User): User
+ findById(id: Integer): Optional<User>
+ findAll(): List<User>
+ delete(entity: User): void
+ count(): long
+ existsById(id: Integer): boolean

---

## DOMAIN 2: ACADEMIC STRUCTURE

### Course <<Entity>>
**Attributes:**
- courseId: Long (private)
- code: String (private)
- name: String (private)
- description: String (private)
- departmentName: String (private)
- department: Department (private)

### Class <<Entity>>
**Attributes:**
- classId: Long (private)
- course: Course (private)
- semester: String (private)
- tutor: UniversityStaff (private)
- createdAt: LocalDateTime (private)
- status: String (private)
- capacity: Integer (private)
- customName: String (private)
- enrolledCount: Integer (private)

### Session <<Entity>>
**Attributes:**
- sessionId: Long (private)
- clazz: Class (private)
- title: String (private)
- startTime: LocalDateTime (private)
- endTime: LocalDateTime (private)
- description: String (private)
- location: String (private)
- sessionType: String (private)
- maxStudents: Integer (private)
- currentStudents: Integer (private)
- status: String (private)
- createdAt: LocalDateTime (private)

### CourseService <<Service>>
**Dependencies:**
- courseRepository: CourseRepository (private)

**Methods:**
+ createCourse(req: CreateCourseRequest): Course
+ listCourses(query: String): List<Course>
+ findByCodeOrThrow(code: String): Course

### ClassService <<Service>>
**Dependencies:**
- classRepository: ClassRepository (private)
- courseRepository: CourseRepository (private)
- staffRepository: UniversityStaffRepository (private)
- userRepository: UserRepository (private)
- activityLogService: ActivityLogService (private)

**Methods:**
+ createClass(request: CreateClassRequest, principal: TssUserPrincipal): ClassResponse
+ listClasses(query: String, userId: Integer, byTutor: boolean): List<ClassResponse>
+ getClassById(classId: Long): ClassResponse
+ updateClass(classId: Long, request: UpdateClassRequest, principal: TssUserPrincipal): ClassResponse
+ deleteClass(classId: Long, principal: TssUserPrincipal): void
+ getMyClasses(principal: TssUserPrincipal): List<ClassResponse>
+ listClassesBySemester(semester: String): List<ClassResponse>
- mapToResponse(classEntity: Class): ClassResponse
- getUserFromPrincipal(principal: TssUserPrincipal): User
- isUserTutor(userId: Integer): boolean

### SessionService <<Service>>
**Dependencies:**
- sessionRepository: jpaSessionRepository (private)
- classRepository: ClassRepository (private)
- staffRepository: UniversityStaffRepository (private)
- userRepository: UserRepository (private)
- studentRepository: StudentRepository (private)
- sessionRegistrationRepository: SessionRegistrationRepository (private)
- courseRegistrationRepository: CourseRegistrationRepository (private)
- activityLogService: ActivityLogService (private)
- notificationService: NotificationService (private)

**Methods:**
+ createSession(request: CreateSessionRequest, principal: TssUserPrincipal): SessionResponse
+ getallSessionsByClassID(classId: Long): List<SessionResponse>
+ getSessionById(sessionId: Long): SessionResponse
+ getAllSessions(): List<SessionResponse>
+ getMyEnrolledSessions(principal: TssUserPrincipal): List<SessionResponse>
+ deleteSession(sessionId: Long, principal: TssUserPrincipal): void
+ rescheduleSession(sessionId: Long, request: RescheduleRequest, principal: TssUserPrincipal): SessionRescheduleResponse
- getUserFromPrincipal(principal: TssUserPrincipal): User
- getUserIdFromPrincipal(principal: TssUserPrincipal): Integer
- mapToSessionResponse(session: Session): SessionResponse
- sendRescheduleNotifications(session: Session, enrollments: List<SessionEnrollment>): void

---

## DOMAIN 3: FORUM SYSTEM

### Forum <<Entity>>
**Attributes:**
- forumId: Long (private)
- title: String (private)
- description: String (private)
- forumType: ForumType (private)
- subject: String (private)
- creator: User (private)
- members: List<ForumMember> (private)
- posts: List<ForumPost> (private)
- createdAt: LocalDateTime (private)
- updatedAt: LocalDateTime (private)

### ForumPost <<Entity>>
**Attributes:**
- postId: Long (private)
- forum: Forum (private)
- author: User (private)
- title: String (private)
- content: String (private)
- views: Integer (private)
- hasAcceptedAnswer: Boolean (private)
- tags: List<PostTag> (private)
- comments: List<ForumComment> (private)
- votes: List<ForumVote> (private)
- createdAt: LocalDateTime (private)
- updatedAt: LocalDateTime (private)

### ForumMember <<Entity>>
**Attributes:**
- memberId: Long (private)
- forum: Forum (private)
- user: User (private)
- joinedAt: LocalDateTime (private)

### ForumComment <<Entity>>
**Attributes:**
- commentId: Long (private)
- post: ForumPost (private)
- author: User (private)
- content: String (private)
- isAccepted: Boolean (private)
- votes: List<ForumVote> (private)
- createdAt: LocalDateTime (private)
- updatedAt: LocalDateTime (private)

### ForumVote <<Entity>>
**Attributes:**
- voteId: Long (private)
- user: User (private)
- post: ForumPost (private)
- comment: ForumComment (private)
- voteType: VoteType (private)
- createdAt: LocalDateTime (private)

### PostTag <<Entity>>
**Attributes:**
- tagId: Long (private)
- post: ForumPost (private)
- tagName: String (private)

### ForumService <<Service>>
**Dependencies:**
- forumRepository: ForumRepository (private)
- forumMemberRepository: ForumMemberRepository (private)
- forumPostRepository: ForumPostRepository (private)
- postTagRepository: PostTagRepository (private)
- forumCommentRepository: ForumCommentRepository (private)
- forumVoteRepository: ForumVoteRepository (private)
- userRepository: UserRepository (private)
- staffRepository: UniversityStaffRepository (private)
- userProfilePersistenceService: UserProfilePersistenceService (private)

**Methods:**
+ createForum(request: CreateForumRequest, principal: TssUserPrincipal): ForumResponse
+ deleteForum(forumId: Long, principal: TssUserPrincipal): void
+ getAllForums(forumType: ForumType, principal: TssUserPrincipal): List<ForumResponse>
+ getForumById(forumId: Long, principal: TssUserPrincipal): ForumResponse
+ searchForums(searchQuery: String, forumType: ForumType, principal: TssUserPrincipal): List<ForumResponse>
+ joinForum(forumId: Long, principal: TssUserPrincipal): void
+ leaveForum(forumId: Long, principal: TssUserPrincipal): void
+ isUserMemberOfForum(forumId: Long, userId: Integer): boolean
+ createPost(request: CreatePostRequest, principal: TssUserPrincipal): PostResponse
+ getPostsByForum(forumId: Long, principal: TssUserPrincipal): List<PostResponse>
+ getPostById(postId: Long, principal: TssUserPrincipal): PostResponse
+ searchPostsInForum(forumId: Long, searchQuery: String, principal: TssUserPrincipal): List<PostResponse>
+ createComment(request: CreateCommentRequest, principal: TssUserPrincipal): CommentResponse
+ getCommentsByPost(postId: Long, principal: TssUserPrincipal): List<CommentResponse>
+ acceptComment(commentId: Long, principal: TssUserPrincipal): CommentResponse
+ votePost(postId: Long, request: VoteRequest, principal: TssUserPrincipal): void
+ voteComment(commentId: Long, request: VoteRequest, principal: TssUserPrincipal): void
- getUserFromPrincipal(principal: TssUserPrincipal): User
- getUserIdFromPrincipal(principal: TssUserPrincipal): Integer
- isUserTutor(userId: Integer): boolean
- getUserRole(user: User): String
- mapToForumResponse(forum: Forum, currentUserId: Integer): ForumResponse
- mapToPostResponse(post: ForumPost, currentUserId: Integer): PostResponse
- mapToCommentResponse(comment: ForumComment, currentUserId: Integer): CommentResponse

### ForumController <<Controller>>
**Dependencies:**
- forumService: ForumService (private)

**Methods:**
+ createForum(request: CreateForumRequest, principal: TssUserPrincipal): ResponseEntity<ForumResponse>
+ getAllForums(forumType: ForumType, principal: TssUserPrincipal): ResponseEntity<List<ForumResponse>>
+ getForumById(forumId: Long, principal: TssUserPrincipal): ResponseEntity<ForumResponse>
+ deleteForum(forumId: Long, principal: TssUserPrincipal): ResponseEntity<Void>
+ searchForums(query: String, forumType: ForumType, principal: TssUserPrincipal): ResponseEntity<List<ForumResponse>>
+ joinForum(forumId: Long, principal: TssUserPrincipal): ResponseEntity<Void>
+ leaveForum(forumId: Long, principal: TssUserPrincipal): ResponseEntity<Void>
+ createPost(request: CreatePostRequest, principal: TssUserPrincipal): ResponseEntity<PostResponse>
+ getPostsByForum(forumId: Long, principal: TssUserPrincipal): ResponseEntity<List<PostResponse>>
+ getPostById(postId: Long, principal: TssUserPrincipal): ResponseEntity<PostResponse>
+ searchPostsInForum(forumId: Long, query: String, principal: TssUserPrincipal): ResponseEntity<List<PostResponse>>
+ createComment(request: CreateCommentRequest, principal: TssUserPrincipal): ResponseEntity<CommentResponse>
+ getCommentsByPost(postId: Long, principal: TssUserPrincipal): ResponseEntity<List<CommentResponse>>
+ acceptComment(commentId: Long, principal: TssUserPrincipal): ResponseEntity<CommentResponse>
+ votePost(postId: Long, request: VoteRequest, principal: TssUserPrincipal): ResponseEntity<Void>
+ voteComment(commentId: Long, request: VoteRequest, principal: TssUserPrincipal): ResponseEntity<Void>

### ForumRepository <<Repository>>
**Methods:**
+ findByForumType(forumType: ForumType): List<Forum>
+ findByForumTypeAndSubjectContaining(forumType: ForumType, subject: String): List<Forum>
+ findByCreatorUserId(userId: Integer): List<Forum>
+ searchForums(searchQuery: String, forumType: ForumType): List<Forum>
+ save(entity: Forum): Forum
+ findById(id: Long): Optional<Forum>
+ findAll(): List<Forum>
+ delete(entity: Forum): void
+ count(): long
+ existsById(id: Long): boolean

---

## DOMAIN 4: MATERIAL MANAGEMENT

### Material <<Entity>>
**Attributes:**
- id: Long (private)
- course: Course (private)
- ownerId: String (private)
- title: String (private)
- description: String (private)
- sourceType: MaterialSourceType (private)
- libraryItemId: Long (private)
- filePath: String (private)
- originalName: String (private)
- contentType: String (private)
- sizeBytes: Long (private)
- externalUrl: String (private)
- createdAt: LocalDateTime (private)
- updatedAt: LocalDateTime (private)

### MaterialService <<Service>>
**Dependencies:**
- materialRepository: MaterialRepository (private)
- courseRepository: CourseRepository (private)
- libraryClient: LibraryClient (private)
- uploadDir: String (private)

**Methods:**
+ getMaterialsByCourse(courseId: Long): List<MaterialResponse>
+ getMaterial(materialId: Long): MaterialResponse
+ uploadFile(courseId: Long, ownerId: String, title: String, description: String, file: MultipartFile): MaterialResponse
+ addLibraryReference(courseId: Long, ownerId: String, title: String, description: String, libraryItemId: Long): MaterialResponse
+ addExternalUrl(courseId: Long, ownerId: String, title: String, description: String, externalUrl: String): MaterialResponse
+ deleteMaterial(materialId: Long): void
+ downloadFile(materialId: Long): FileDownloadResource
- buildStoredFileName(originalName: String): String
- mapToResponse(material: Material): MaterialResponse

### MaterialController <<Controller>>
**Dependencies:**
- materialService: MaterialService (private)

**Methods:**
+ getMaterialsByCourse(courseId: Long): ResponseEntity<List<MaterialResponse>>
+ getMaterial(materialId: Long): ResponseEntity<MaterialResponse>
+ uploadFile(courseId: Long, ownerId: String, title: String, description: String, file: MultipartFile): ResponseEntity<MaterialResponse>
+ addLibraryReference(request: AddLibraryReferenceRequest): ResponseEntity<MaterialResponse>
+ addExternalUrl(request: AddExternalMaterialRequest): ResponseEntity<MaterialResponse>
+ deleteMaterial(materialId: Long): ResponseEntity<Void>
+ downloadFile(materialId: Long): ResponseEntity<Resource>

---

## DOMAIN 5: NOTIFICATION SYSTEM

### Notification <<Entity>>
**Attributes:**
- notificationId: Long (private)
- user: User (private)
- title: String (private)
- message: String (private)
- type: String (private)
- isRead: Boolean (private)
- sessionId: Long (private)
- classId: Long (private)
- createdAt: LocalDateTime (private)
- readAt: LocalDateTime (private)

### NotificationService <<Service>>
**Dependencies:**
- notificationRepository: NotificationRepository (private)
- userRepository: UserRepository (private)

**Methods:**
+ getUserNotifications(principal: TssUserPrincipal): List<NotificationResponse>
+ getUnreadNotifications(principal: TssUserPrincipal): List<NotificationResponse>
+ getUnreadCount(principal: TssUserPrincipal): Long
+ markAsRead(notificationId: Long, principal: TssUserPrincipal): void
+ markAllAsRead(principal: TssUserPrincipal): void
+ createNotification(user: User, title: String, message: String, type: String, sessionId: Long, classId: Long): void
- mapToResponse(notification: Notification): NotificationResponse

### NotificationController <<Controller>>
**Dependencies:**
- notificationService: NotificationService (private)

**Methods:**
+ getUserNotifications(principal: TssUserPrincipal): ResponseEntity<List<NotificationResponse>>
+ getUnreadNotifications(principal: TssUserPrincipal): ResponseEntity<List<NotificationResponse>>
+ getUnreadCount(principal: TssUserPrincipal): ResponseEntity<Map<String, Long>>
+ markAsRead(notificationId: Long, principal: TssUserPrincipal): ResponseEntity<Void>
+ markAllAsRead(principal: TssUserPrincipal): ResponseEntity<Void>

---

## DOMAIN 6: EVALUATION SYSTEM

### Evaluation <<Entity>>
**Attributes:**
- evaluationId: Long (private)
- student: Student (private)
- course: Course (private)
- classEntity: Class (private)
- tutor: UniversityStaff (private)
- comment: String (private)
- createdAt: LocalDateTime (private)
- updatedAt: LocalDateTime (private)
- evaluationItems: List<EvaluationItem> (private)

### EvaluationItem <<Entity>>
**Attributes:**
- itemId: Long (private)
- evaluation: Evaluation (private)
- criteriaName: String (private)
- score: Double (private)
- maxScore: Double (private)
- comment: String (private)

### Feedback <<Entity>>
**Attributes:**
- feedbackId: Long (private)
- student: Student (private)
- course: Course (private)
- classEntity: Class (private)
- tutor: UniversityStaff (private)
- comment: String (private)
- createdAt: LocalDateTime (private)
- updatedAt: LocalDateTime (private)
- feedbackRatings: List<FeedbackRating> (private)

### FeedbackRating <<Entity>>
**Attributes:**
- ratingId: Long (private)
- feedback: Feedback (private)
- criteriaName: String (private)
- rating: Integer (private)
- maxRating: Integer (private)

### EvaluationService <<Service>>
**Dependencies:**
- evaluationRepository: EvaluationRepository (private)
- studentRepository: StudentRepository (private)
- courseRepository: CourseRepository (private)
- classRepository: ClassRepository (private)
- courseRegistrationRepository: CourseRegistrationRepository (private)
- userProfileService: UserProfileService (private)
- activityLogService: ActivityLogService (private)

**Methods:**
+ getTutorCourses(userEmail: String): List<TutorCourseResponse>
+ getEnrolledStudents(classId: Long, userEmail: String): List<EnrolledStudentResponse>
+ submitEvaluation(userEmail: String, request: SubmitEvaluationRequest): EvaluationResponse
+ getEvaluationsByStudent(studentId: Long, userEmail: String): List<EvaluationResponse>
+ getEvaluationsByTutor(userEmail: String): List<EvaluationResponse>
+ getEvaluationsByClass(classId: Long, userEmail: String): List<EvaluationResponse>
+ getEvaluationById(evaluationId: Long, userEmail: String): EvaluationResponse
- mapToResponse(evaluation: Evaluation): EvaluationResponse
- getVerifiedTutorByEmail(userEmail: String): UniversityStaff

### FeedbackService <<Service>>
**Dependencies:**
- feedbackRepository: FeedbackRepository (private)
- studentRepository: StudentRepository (private)
- courseRepository: CourseRepository (private)
- classRepository: ClassRepository (private)
- courseRegistrationRepository: CourseRegistrationRepository (private)
- userProfileService: UserProfileService (private)

**Methods:**
+ getStudentCourses(userEmail: String): List<EnrolledCourseResponse>
+ submitFeedback(userEmail: String, request: SubmitFeedbackRequest): FeedbackResponse
+ getFeedbacksByClass(classId: Long, userEmail: String): List<FeedbackResponse>
+ getFeedbacksByTutor(userEmail: String): List<FeedbackResponse>
+ getFeedbackById(feedbackId: Long, userEmail: String): FeedbackResponse
- mapToResponse(feedback: Feedback): FeedbackResponse
- getVerifiedStudentByEmail(userEmail: String): Student

### EvaluationController <<Controller>>
**Dependencies:**
- evaluationService: EvaluationService (private)

**Methods:**
+ getTutorCourses(principal: TssUserPrincipal): ResponseEntity<List<TutorCourseResponse>>
+ getEnrolledStudents(classId: Long, principal: TssUserPrincipal): ResponseEntity<List<EnrolledStudentResponse>>
+ submitEvaluation(request: SubmitEvaluationRequest, principal: TssUserPrincipal): ResponseEntity<EvaluationResponse>
+ getEvaluationsByStudent(studentId: Long, principal: TssUserPrincipal): ResponseEntity<List<EvaluationResponse>>
+ getEvaluationsByTutor(principal: TssUserPrincipal): ResponseEntity<List<EvaluationResponse>>
+ getEvaluationsByClass(classId: Long, principal: TssUserPrincipal): ResponseEntity<List<EvaluationResponse>>
+ getEvaluationById(evaluationId: Long, principal: TssUserPrincipal): ResponseEntity<EvaluationResponse>

### FeedbackController <<Controller>>
**Dependencies:**
- feedbackService: FeedbackService (private)

**Methods:**
+ getStudentCourses(principal: TssUserPrincipal): ResponseEntity<List<EnrolledCourseResponse>>
+ submitFeedback(request: SubmitFeedbackRequest, principal: TssUserPrincipal): ResponseEntity<FeedbackResponse>
+ getFeedbacksByClass(classId: Long, principal: TssUserPrincipal): ResponseEntity<List<FeedbackResponse>>
+ getFeedbacksByTutor(principal: TssUserPrincipal): ResponseEntity<List<FeedbackResponse>>
+ getFeedbackById(feedbackId: Long, principal: TssUserPrincipal): ResponseEntity<FeedbackResponse>

---

## DOMAIN 7: ENUMS

### UserType <<Enum>>
**Values:**
- STUDENT
- TUTOR
- ADMINISTRATOR
- COOPERATOR

### UserStatus <<Enum>>
**Values:**
- ACTIVE
- BANNED

### ForumType <<Enum>>
**Values:**
- ACADEMIC
- CAREER

### MaterialSourceType <<Enum>>
**Values:**
- LOCAL_FILE
- LIBRARY_REF
- EXTERNAL_URL

### VoteType <<Enum>>
**Values:**
- UPVOTE
- DOWNVOTE

---

## DOMAIN 8: DTO CLASSES

### Request DTOs

#### CreateForumRequest <<DTO>>
**Attributes:**
- title: String
- description: String
- forumType: ForumType
- subject: String

#### CreatePostRequest <<DTO>>
**Attributes:**
- forumId: Long
- title: String
- content: String
- tags: List<String>

#### CreateCommentRequest <<DTO>>
**Attributes:**
- postId: Long
- content: String

#### VoteRequest <<DTO>>
**Attributes:**
- voteType: VoteType

#### CreateSessionRequest <<DTO>>
**Attributes:**
- classId: Long
- title: String
- startTime: LocalDateTime
- endTime: LocalDateTime
- description: String
- location: String
- sessionType: String
- maxStudents: Integer

#### CreateCourseRequest <<DTO>>
**Attributes:**
- code: String
- name: String
- description: String
- departmentName: String

#### CreateClassRequest <<DTO>>
**Attributes:**
- courseCode: String
- semester: String
- capacity: Integer
- customClassName: String

### Response DTOs

#### ForumResponse <<DTO>>
**Attributes:**
- forumId: Long
- title: String
- description: String
- forumType: ForumType
- subject: String
- creatorUserId: Integer
- creatorName: String
- creatorRole: String
- memberCount: Long
- postCount: Long
- isJoined: Boolean
- createdAt: LocalDateTime
- updatedAt: LocalDateTime

#### PostResponse <<DTO>>
**Attributes:**
- postId: Long
- forumId: Long
- forumTitle: String
- authorUserId: Integer
- authorName: String
- authorRole: String
- title: String
- content: String
- views: Integer
- voteScore: Long
- commentCount: Long
- hasAcceptedAnswer: Boolean
- tags: List<String>
- userVote: String
- createdAt: LocalDateTime
- updatedAt: LocalDateTime

#### NotificationResponse <<DTO>>
**Attributes:**
- notificationId: Long
- title: String
- message: String
- type: String
- isRead: Boolean
- sessionId: Long
- classId: Long
- createdAt: LocalDateTime
- readAt: LocalDateTime

#### SessionResponse <<DTO>>
**Attributes:**
- sessionId: Long
- classId: Long
- sessionTitle: String
- startTime: String
- endTime: String
- location: String
- sessionType: String
- capacity: Integer
- description: String
- status: String

#### MaterialResponse <<DTO>>
**Attributes:**
- id: Long
- courseId: Long
- title: String
- description: String
- sourceType: MaterialSourceType
- originalName: String
- contentType: String
- sizeBytes: Long
- externalUrl: String
- ownerId: String
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
- downloadUrl: String

## DOMAIN 9: CONFIGURATION

### SecurityConfig <<Configuration>>
**Attributes:**
- frontendUrl: String (private)
- tssUserOAuth2UserService: TssUserOAuth2UserService (private)

**Methods:**
+ securityFilterChain(http: HttpSecurity, authenticationSuccessHandler: AuthenticationSuccessHandler, clientRegistrationRepository: ClientRegistrationRepository): SecurityFilterChain
+ authenticationSuccessHandler(): AuthenticationSuccessHandler
+ corsConfigurationSource(): CorsConfigurationSource

### WebClientConfig <<Configuration>>
**Methods:**
+ datacoreWebClient(datacoreUrl: String): WebClient
+ libraryWebClient(libraryUrl: String): WebClient

---

# CONCLUSION

This implementation analysis provides a comprehensive overview of the TSS backend system's class structure across 9 domains:

1. **User Management**: Core authentication and user profile management
2. **Academic Structure**: Course, class, and session management
3. **Forum System**: Discussion forums with posts, comments, and voting
4. **Material Management**: File uploads and external resource linking
5. **Notification System**: User notification management
6. **Evaluation System**: Student evaluation and feedback mechanisms
7. **Enums**: System constants and value types
8. **DTOs**: Data transfer objects for API communication
9. **Configuration**: Security and service integration setup

Each domain follows Spring Boot best practices with clear separation of concerns between Entity, Repository, Service, and Controller layers. The system demonstrates comprehensive business logic implementation with proper dependency injection, transaction management, and security integration.

---

## ARCHITECTURAL INSIGHTS FOR UML DIAGRAMS

### 1. Class Relationships
- **Composition**: Entity relationships with `cascade = CascadeType.ALL, orphanRemoval = true`
- **Association**: Service dependencies injected via constructor
- **Inheritance**: Not used in domain model (composition over inheritance)
- **Dependency**: Controller → Service → Repository chains

### 2. Method Visibility
- **Public (+)**: Service business methods, Controller endpoints, Repository interfaces
- **Private (-)**: Helper methods, internal logic, mapping methods
- **Protected (#)**: Lifecycle methods (`@PrePersist`, `@PreUpdate`)

### 3. Stereotypes to Use
- **<<entity>>**: JPA entities
- **<<service>>**: Service classes
- **<<controller>>**: REST controllers
- **<<repository>>**: Data access interfaces
- **<<dto>>**: Data transfer objects
- **<<enum>>**: Enumeration classes
- **<<configuration>>**: Spring configuration classes

### 4. Annotations to Show
- **@Transactional**: On service methods
- **@PreAuthorize**: On secured controller methods
- **@Query**: On custom repository methods
- **@Entity**: On domain entities
- **@RestController**: On API controllers

This comprehensive implementation analysis provides all the details needed to create accurate UML class diagrams showing the complete implementation structure including detailed method signatures, attributes, types, and annotations.