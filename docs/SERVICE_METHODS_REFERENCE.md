# SERVICE METHODS REFERENCE

## UserService

**Dependencies:**
- userRepository: UserRepository (private)
- studentRepository: StudentRepository (private)
- universityStaffRepository: UniversityStaffRepository (private)
- departmentRepository: DepartmentRepository (private)
- datacoreWebClient: WebClient (private)
- fromDatacoreMapper: FromDatacoreMapper (private)
- userProfilePersistenceService: UserProfilePersistenceService (private)

**Methods:**
```
+ getAndStoreUserFromDatacore(TssUserPrincipal principal): User
- createStudent(RecvDatacoreDto dto, User user, Department department): void
- createStaff(RecvDatacoreDto dto, User user, Department department): void
+ getUserFromDatabase(TssUserPrincipal principal): Optional<User>
+ updateStaffProfile(Integer userId, UpdateStaffRequest request): void
+ updateStudentProfile(Integer userId, UpdateStudentRequest request): void
```

---

## UserProfileService

**Dependencies:**
- userRepository: UserRepository (private)
- universityStaffRepository: UniversityStaffRepository (private)
- studentRepository: StudentRepository (private)

**Methods:**
```
+ getUserByEmail(String email): User
+ getTutorByUserId(Integer userId): UniversityStaff
+ getStudentByUserId(Integer userId): Student
+ getStudentByStudentId(String studentId): Student
+ getTutorByEmail(String email): UniversityStaff
```

---

## UserProfilePersistenceService

**Dependencies:**
- datacoreWebClient: WebClient (private)
- userRepository: UserRepository (private)
- studentRepository: StudentRepository (private)
- staffRepository: UniversityStaffRepository (private)
- departmentRepository: DepartmentRepository (private)

**Methods:**
```
+ ensureUserSubProfilePersisted(TssUserPrincipal principal): void
+ persistSubProfileFromDto(User user, RecvDatacoreDto dto): void
```

---

## CourseService

**Dependencies:**
- courseRepository: CourseRepository (private)

**Methods:**
```
+ createCourse(CreateCourseRequest req): Course
+ listCourses(String q): List<Course>
+ findByCodeOrThrow(String code): Course
```

---

## CourseCreationService

**Dependencies:**
- courseRepository: CourseRepository (private)

**Methods:**
```
+ createIfNotExists(String code, String name, Department dept, String deptName): Course
```

---

## ClassService

**Dependencies:**
- classRepository: ClassRepository (private)
- courseRepository: CourseRepository (private)
- staffRepository: UniversityStaffRepository (private)
- userRepository: UserRepository (private)
- userProfilePersistenceService: UserProfilePersistenceService (private)
- entityManager: EntityManager (private)
- courseCreationService: CourseCreationService (private)

**Methods:**
```
- getUserFromPrincipal(TssUserPrincipal principal): User
- getUserIdFromPrincipal(TssUserPrincipal principal): Integer
+ createClass(CreateClassRequest request, TssUserPrincipal principal): ClassResponse
+ getClassById(Long classId, TssUserPrincipal principal): Optional<ClassResponse>
+ getAllClasses(TssUserPrincipal principal): List<ClassResponse>
+ getClassesByCourse(String courseCode, TssUserPrincipal principal): List<ClassResponse>
- isCreatedByRequester(Class c, Integer requesterUserId): boolean
- validateClassOwnership(Class classEntity, Integer userId): void
+ getClassesByTutor(TssUserPrincipal principal): List<ClassResponse>
+ deleteClass(Long classId, TssUserPrincipal principal): void
+ updateClass(Long classId, UpdateClassRequest req, TssUserPrincipal principal): ClassResponse
- mapToResponse(Class classEntity): ClassResponse
```

---

## SessionService

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
```
- getUserFromPrincipal(TssUserPrincipal principal): User
- getUserIdFromPrincipal(TssUserPrincipal principal): Integer
+ createSessionForClass(CreateSessionRequest request, TssUserPrincipal principal): void
+ cancelSession(Long sessionId, TssUserPrincipal principal): void
+ rescheduleSession(RescheduleRequest request, TssUserPrincipal principal): SessionRescheduleResponse
+ deleteSession(Long sessionId, TssUserPrincipal principal): void
+ cancelSessionByTutor(Long sessionId, TssUserPrincipal principal): void
+ getallSessionsByUserID(TssUserPrincipal principal): List<SessionResponse>
+ getallSessionsByClassID(Long classId): List<SessionResponse>
- mapToSessionResponse(Session session): SessionResponse
```

---

## CourseRegistrationService

**Dependencies:**
- classRepository: ClassRepository (private)
- registrationRepository: CourseRegistrationRepository (private)
- userRepository: UserRepository (private)
- studentRepository: StudentRepository (private)
- mapper: CourseRegistrationMapper (private)

**Methods:**
```
+ enrollInClass(EnrollmentRequest req, TssUserPrincipal principal): EnrollmentResponse
+ register(RegisterCourseRequest req, TssUserPrincipal principal): CourseRegistrationResponse
- resolveStudentId(RegisterCourseRequest req, TssUserPrincipal principal): String
+ listByStudentId(String studentId): List<CourseRegistrationResponse>
+ listMine(TssUserPrincipal principal): List<CourseRegistrationResponse>
+ exitClass(Long registrationId, TssUserPrincipal principal): void
```

---

## SessionRegistrationService

**Dependencies:**
- sessionRepository: jpaSessionRepository (private)
- sessionRegistrationRepository: SessionRegistrationRepository (private)
- userRepository: UserRepository (private)
- studentRepository: StudentRepository (private)
- activityLogService: ActivityLogService (private)

**Methods:**
```
+ registerStudentToSession(EnrollMentSessionRequest request, TssUserPrincipal principal): void
+ unregisterStudentFromSession(EnrollMentSessionRequest request, TssUserPrincipal principal): void
```

---

## ForumService

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
```
+ createForum(CreateForumRequest request, TssUserPrincipal principal): ForumResponse
+ deleteForum(Long forumId, TssUserPrincipal principal): void
+ getAllForums(ForumType forumType, TssUserPrincipal principal): List<ForumResponse>
+ getForumById(Long forumId, TssUserPrincipal principal): ForumResponse
+ searchForums(String searchQuery, ForumType forumType, TssUserPrincipal principal): List<ForumResponse>
+ joinForum(Long forumId, TssUserPrincipal principal): void
+ leaveForum(Long forumId, TssUserPrincipal principal): void
+ isUserMemberOfForum(Long forumId, Integer userId): boolean
+ createPost(CreatePostRequest request, TssUserPrincipal principal): PostResponse
+ getPostsByForum(Long forumId, TssUserPrincipal principal): List<PostResponse>
+ getPostById(Long postId, TssUserPrincipal principal): PostResponse
+ searchPostsInForum(Long forumId, String searchQuery, TssUserPrincipal principal): List<PostResponse>
+ createComment(CreateCommentRequest request, TssUserPrincipal principal): CommentResponse
+ getCommentsByPost(Long postId, TssUserPrincipal principal): List<CommentResponse>
+ acceptComment(Long commentId, TssUserPrincipal principal): CommentResponse
+ votePost(Long postId, VoteRequest request, TssUserPrincipal principal): void
+ voteComment(Long commentId, VoteRequest request, TssUserPrincipal principal): void
- getUserFromPrincipal(TssUserPrincipal principal): User
- getUserIdFromPrincipal(TssUserPrincipal principal): Integer
- isUserTutor(Integer userId): boolean
- getUserRole(User user): String
- mapToForumResponse(Forum forum, Integer currentUserId): ForumResponse
- mapToPostResponse(ForumPost post, Integer currentUserId): PostResponse
- mapToCommentResponse(ForumComment comment, Integer currentUserId): CommentResponse
```

---

## MaterialService

**Dependencies:**
- materialRepository: MaterialRepository (private)
- courseRepository: CourseRepository (private)
- materialsDir: String (private) [@Value]

**Methods:**
```
+ getMaterialsByCourse(Long courseId): List<MaterialResponse>
+ addExternalUrl(Long courseId, String ownerId, String title, String description, String externalUrl): MaterialResponse
+ uploadFile(Long courseId, String ownerId, String title, String description, MultipartFile file): MaterialResponse
+ addLibraryReference(Long courseId, String ownerId, Long libraryItemId, String title, String description): MaterialResponse
+ downloadFile(Long materialId): FileDownloadResource
+ deleteMaterial(Long materialId, String requesterId): void
- resolveStorageDir(): Path
- buildStoredFileName(String originalName): String
- mapToResponse(Material material): MaterialResponse
```

---

## NotificationService

**Dependencies:**
- notificationRepository: NotificationRepository (private)
- userRepository: UserRepository (private)

**Methods:**
```
+ getUserNotifications(TssUserPrincipal principal): List<NotificationResponse>
+ getUnreadNotifications(TssUserPrincipal principal): List<NotificationResponse>
+ getUnreadCount(TssUserPrincipal principal): Long
+ markAsRead(Long notificationId, TssUserPrincipal principal): void
+ markAllAsRead(TssUserPrincipal principal): void
+ createNotification(User user, String title, String message, String type, Long sessionId, Long classId): void
- mapToResponse(Notification notification): NotificationResponse
```

---

## EvaluationService

**Dependencies:**
- evaluationRepository: EvaluationRepository (private)
- studentRepository: StudentRepository (private)
- courseRepository: CourseRepository (private)
- classRepository: ClassRepository (private)
- courseRegistrationRepository: CourseRegistrationRepository (private)
- userProfileService: UserProfileService (private)
- activityLogService: ActivityLogService (private)

**Methods:**
```
+ getTutorCourses(String userEmail): List<TutorCourseResponse>
+ getEnrolledStudents(Long classId, String userEmail): List<EnrolledStudentResponse>
+ submitEvaluation(String userEmail, SubmitEvaluationRequest request): EvaluationResponse
+ getStudentEvaluations(String studentId): List<EvaluationResponse>
+ getCourseEvaluations(Long courseId): List<EvaluationResponse>
+ getClassEvaluations(Long classId): List<EvaluationResponse>
+ getTutorEvaluations(String userEmail): List<EvaluationResponse>
+ getStudentEvaluationForClass(String studentId, Long classId): EvaluationResponse
- mapToResponse(Evaluation evaluation): EvaluationResponse
- getVerifiedTutorByEmail(String userEmail): UniversityStaff
```

---

## FeedbackService

**Dependencies:**
- feedbackRepository: FeedbackRepository (private)
- courseRepository: CourseRepository (private)
- classRepository: ClassRepository (private)
- courseRegistrationRepository: CourseRegistrationRepository (private)
- activityLogService: ActivityLogService (private)
- userProfileService: UserProfileService (private)

**Methods:**
```
+ getEnrolledCourses(String userEmail): List<EnrolledCourseResponse>
+ submitFeedback(String userEmail, SubmitFeedbackRequest request): FeedbackResponse
+ getStudentFeedback(String userEmail): List<FeedbackResponse>
+ getCourseFeedback(Long courseId): List<FeedbackResponse>
+ getClassFeedback(Long classId): List<FeedbackResponse>
+ getPendingFeedback(): List<FeedbackResponse>
+ updateFeedbackStatus(Long feedbackId, String status): FeedbackResponse
- mapToResponse(Feedback feedback): FeedbackResponse
```

---

## AdminService

**Dependencies:**
- userRepository: UserRepository (private)
- studentRepository: StudentRepository (private)
- universityStaffRepository: UniversityStaffRepository (private)
- activityLogService: ActivityLogService (private)

**Methods:**
```
+ getAllUsers(): List<AdminUserResponse>
+ deleteUser(Integer userId, Integer adminUserId): void
+ banUser(Integer userId, Integer adminUserId): void
+ unbanUser(Integer userId, Integer adminUserId): void
+ getAllActivityLogs(): List<ActivityLogResponse>
- logActivity(Integer userId, String action, String entityType, Long entityId, String description): void
+ isUserAdmin(String email): boolean
+ isSameUser(Integer targetUserId, String userEmail): boolean
+ getAdminUserIdByEmail(String email): Integer
```

---

## ActivityLogService

**Dependencies:**
- activityLogRepository: ActivityLogRepository (private)
- applicationContext: ApplicationContext (private)

**Methods:**
```
+ saveLog(ActivityLog log): ActivityLog
+ saveLogRequiresNew(ActivityLog log): ActivityLog
+ findAll(): List<ActivityLog>
+ safeSave(ActivityLog log): void
```

---

**Note:** 
- `+` = public method
- `-` = private method
- `@Value` = injected from configuration properties
