# SERVICE METHODS DESCRIPTION REPORT
## HCMUT Tutoring Support System - Service Methods by Sub-Class Diagram

**Document Version:** 1.0  
**Date:** December 2, 2025  
**Purpose:** Brief description of service methods organized by sub-class diagrams

---

## Sub-Diagram 1: User Management

### **UserService**

**Core user management business logic**

```
User getAndStoreUserFromDatacore(TssUserPrincipal principal): Creates/retrieves user from external datacore system

Optional<User> getUserFromDatabase(TssUserPrincipal principal): Finds existing user in local database by email

void updateStaffProfile(Integer userId, UpdateStaffRequest request): Updates university staff profile information

void updateStudentProfile(Integer userId, UpdateStudentRequest request): Updates student profile information

void createStudent(RecvDatacoreDto dto, User user, Department department): Creates student profile from datacore data

void createStaff(RecvDatacoreDto dto, User user, Department department): Creates staff profile from datacore data
```

---

### **UserProfileService**

**User profile data access operations**

```
User getUserByEmail(String email): Retrieves user by email address

UniversityStaff getTutorByUserId(Integer userId): Gets tutor details by user ID

Student getStudentByUserId(Integer userId): Gets student details by user ID

Student getStudentByStudentId(String studentId): Gets student by student ID number

UniversityStaff getTutorByEmail(String email): Gets tutor details by email
```

---

### **UserProfilePersistenceService**

**Sync user data with HCMUT_DATACORE**

```
void ensureUserSubProfilePersisted(TssUserPrincipal principal): Ensures user sub-profile exists in database

void persistSubProfileFromDto(User user, RecvDatacoreDto dto): Saves user sub-profile from datacore DTO
```

---

### **AdminService**

**Administrative operations for user management**

```
List<AdminUserResponse> getAllUsers(): Gets all users for admin view

void deleteUser(Integer userId, Integer adminUserId): Permanently deletes user account

void banUser(Integer userId, Integer adminUserId): Bans user account from system

void unbanUser(Integer userId, Integer adminUserId): Removes ban from user account

List<ActivityLogResponse> getAllActivityLogs(): Gets all system activity logs

boolean isUserAdmin(String email): Checks if user has admin privileges

boolean isSameUser(Integer targetUserId, String userEmail): Checks if target user matches current user

Integer getAdminUserIdByEmail(String email): Gets admin user ID by email

void logActivity(Integer userId, String action, String entityType, Long entityId, String description): Logs administrative action
```

---

## Sub-Diagram 2: Course and Class Management

### **CourseService**

**Course catalog business logic**

```
Course createCourse(CreateCourseRequest req): Creates new course in catalog

List<Course> listCourses(String q): Searches courses by query string

Course findByCodeOrThrow(String code): Finds course by code or throws exception
```

---

### **CourseCreationService**

**Course creation utilities**

```
Course createIfNotExists(String code, String name, Department dept, String deptName): Creates course if it doesn't already exist
```

---

### **ClassService**

**Class management and validation**

```
ClassResponse createClass(CreateClassRequest request, TssUserPrincipal principal): Creates new class for course

Optional<ClassResponse> getClassById(Long classId, TssUserPrincipal principal): Gets class details by ID

List<ClassResponse> getAllClasses(TssUserPrincipal principal): Gets all classes visible to user

List<ClassResponse> getClassesByCourse(String courseCode, TssUserPrincipal principal): Gets classes for specific course

List<ClassResponse> getClassesByTutor(TssUserPrincipal principal): Gets classes taught by tutor

void deleteClass(Long classId, TssUserPrincipal principal): Deletes class if user is owner

ClassResponse updateClass(Long classId, UpdateClassRequest req, TssUserPrincipal principal): Updates class details

User getUserFromPrincipal(TssUserPrincipal principal): Extracts user from security principal

Integer getUserIdFromPrincipal(TssUserPrincipal principal): Extracts user ID from principal

boolean isCreatedByRequester(Class c, Integer requesterUserId): Checks if user created the class

void validateClassOwnership(Class classEntity, Integer userId): Validates user owns the class

ClassResponse mapToResponse(Class classEntity): Maps entity to response DTO
```

---

### **CourseRegistrationService**

**Student enrollment logic**

```
EnrollmentResponse enrollInClass(EnrollmentRequest req, TssUserPrincipal principal): Enrolls student in class

CourseRegistrationResponse register(RegisterCourseRequest req, TssUserPrincipal principal): Registers student for course

List<CourseRegistrationResponse> listByStudentId(String studentId): Lists registrations for student

List<CourseRegistrationResponse> listMine(TssUserPrincipal principal): Lists current user's registrations

void exitClass(Long registrationId, TssUserPrincipal principal): Removes student from class enrollment

String resolveStudentId(RegisterCourseRequest req, TssUserPrincipal principal): Gets student ID from request or principal
```

---

## Sub-Diagram 3: Session Management

### **SessionService**

**Session scheduling and management**

```
void createSessionForClass(CreateSessionRequest request, TssUserPrincipal principal): Creates new session for class

void cancelSession(Long sessionId, TssUserPrincipal principal): Cancels session with notification

SessionRescheduleResponse rescheduleSession(RescheduleRequest request, TssUserPrincipal principal): Changes session time

void deleteSession(Long sessionId, TssUserPrincipal principal): Permanently deletes session

void cancelSessionByTutor(Long sessionId, TssUserPrincipal principal): Tutor cancellation with logging

List<SessionResponse> getallSessionsByUserID(TssUserPrincipal principal): Gets all sessions for user

List<SessionResponse> getallSessionsByClassID(Long classId): Gets all sessions for class

User getUserFromPrincipal(TssUserPrincipal principal): Extracts user from security principal

Integer getUserIdFromPrincipal(TssUserPrincipal principal): Extracts user ID from principal

SessionResponse mapToSessionResponse(Session session): Maps entity to response DTO
```

---

### **SessionRegistrationService**

**Session enrollment logic**

```
void registerStudentToSession(EnrollMentSessionRequest request, TssUserPrincipal principal): Enrolls student in session

void unregisterStudentFromSession(EnrollMentSessionRequest request, TssUserPrincipal principal): Removes student from session
```

---

## Sub-Diagram 4: Feedback Analytics

### **FeedbackService**

**Feedback handling and analytics**

```
List<EnrolledCourseResponse> getEnrolledCourses(String userEmail): Gets courses student is enrolled in

FeedbackResponse submitFeedback(String userEmail, SubmitFeedbackRequest request): Submits student feedback

List<FeedbackResponse> getStudentFeedback(String userEmail): Gets all feedback from student

List<FeedbackResponse> getCourseFeedback(Long courseId): Gets all feedback for course

List<FeedbackResponse> getClassFeedback(Long classId): Gets all feedback for class

List<FeedbackResponse> getPendingFeedback(): Gets feedback awaiting review

FeedbackResponse updateFeedbackStatus(Long feedbackId, String status): Updates feedback status

FeedbackResponse mapToResponse(Feedback feedback): Maps entity to response DTO
```

---

### **EvaluationService**

**Tutor evaluation management**

```
List<TutorCourseResponse> getTutorCourses(String userEmail): Gets courses taught by tutor

List<EnrolledStudentResponse> getEnrolledStudents(Long classId, String userEmail): Gets students in tutor's class

EvaluationResponse submitEvaluation(String userEmail, SubmitEvaluationRequest request): Submits tutor evaluation of student

List<EvaluationResponse> getStudentEvaluations(String studentId): Gets all evaluations for student

List<EvaluationResponse> getCourseEvaluations(Long courseId): Gets all evaluations for course

List<EvaluationResponse> getClassEvaluations(Long classId): Gets all evaluations for class

List<EvaluationResponse> getTutorEvaluations(String userEmail): Gets all evaluations by tutor

EvaluationResponse getStudentEvaluationForClass(String studentId, Long classId): Gets student's evaluation in specific class

EvaluationResponse mapToResponse(Evaluation evaluation): Maps entity to response DTO

UniversityStaff getVerifiedTutorByEmail(String userEmail): Gets verified tutor by email
```

---

## Sub-Diagram 5: Resources Management

### **MaterialService**

**Material management and library integration**

```
List<MaterialResponse> getMaterialsByCourse(Long courseId): Gets all materials for course

MaterialResponse addExternalUrl(Long courseId, String ownerId, String title, String description, String externalUrl): Adds external URL material

MaterialResponse uploadFile(Long courseId, String ownerId, String title, String description, MultipartFile file): Uploads file material

MaterialResponse addLibraryReference(Long courseId, String ownerId, Long libraryItemId, String title, String description): Links library item as material

FileDownloadResource downloadFile(Long materialId): Downloads material file

void deleteMaterial(Long materialId, String requesterId): Deletes material if user is owner

Path resolveStorageDir(): Gets storage directory path

String buildStoredFileName(String originalName): Generates unique filename for storage

MaterialResponse mapToResponse(Material material): Maps entity to response DTO
```

---

## Sub-Diagram 6: Forum Component

### **ForumService**

**Forum management and discussion platform**

```
ForumResponse createForum(CreateForumRequest request, TssUserPrincipal principal): Creates new discussion forum

void deleteForum(Long forumId, TssUserPrincipal principal): Deletes forum if user is creator

List<ForumResponse> getAllForums(ForumType forumType, TssUserPrincipal principal): Gets all forums by type

ForumResponse getForumById(Long forumId, TssUserPrincipal principal): Gets forum details by ID

List<ForumResponse> searchForums(String searchQuery, ForumType forumType, TssUserPrincipal principal): Searches forums by query

void joinForum(Long forumId, TssUserPrincipal principal): Adds user to forum membership

void leaveForum(Long forumId, TssUserPrincipal principal): Removes user from forum membership

boolean isUserMemberOfForum(Long forumId, Integer userId): Checks if user is forum member

PostResponse createPost(CreatePostRequest request, TssUserPrincipal principal): Creates new forum post

List<PostResponse> getPostsByForum(Long forumId, TssUserPrincipal principal): Gets all posts in forum

PostResponse getPostById(Long postId, TssUserPrincipal principal): Gets post details by ID

List<PostResponse> searchPostsInForum(Long forumId, String searchQuery, TssUserPrincipal principal): Searches posts in forum

CommentResponse createComment(CreateCommentRequest request, TssUserPrincipal principal): Creates comment on post

List<CommentResponse> getCommentsByPost(Long postId, TssUserPrincipal principal): Gets all comments for post

CommentResponse acceptComment(Long commentId, TssUserPrincipal principal): Marks comment as accepted answer

void votePost(Long postId, VoteRequest request, TssUserPrincipal principal): Votes up/down on post

void voteComment(Long commentId, VoteRequest request, TssUserPrincipal principal): Votes up/down on comment

User getUserFromPrincipal(TssUserPrincipal principal): Extracts user from security principal

Integer getUserIdFromPrincipal(TssUserPrincipal principal): Extracts user ID from principal

boolean isUserTutor(Integer userId): Checks if user has tutor role

String getUserRole(User user): Gets user's role string

ForumResponse mapToForumResponse(Forum forum, Integer currentUserId): Maps forum entity to response DTO

PostResponse mapToPostResponse(ForumPost post, Integer currentUserId): Maps post entity to response DTO

CommentResponse mapToCommentResponse(ForumComment comment, Integer currentUserId): Maps comment entity to response DTO
```

---

## Method Signature Legend

**Java Method Format:**
- `ReturnType methodName(ParameterType parameterName)`: Method description
- `void methodName()`: Methods with no return value
- `List<Type> methodName()`: Methods returning collections
- `Optional<Type> methodName()`: Methods that may return null
- `boolean methodName()`: Methods returning true/false

**Parameter Types:**
- `TssUserPrincipal`: Security context with user information
- `Request objects`: DTOs containing input data
- `String/Integer/Long`: Primitive data types
- `MultipartFile`: File upload object

**Access Modifiers:**
- All listed methods are public unless noted
- Private methods are internal helper methods

---

**Document Version:** 1.0  
**Total Services:** 13  
**Total Methods:** 78 (public methods with descriptions)  
**Last Updated:** December 2, 2025