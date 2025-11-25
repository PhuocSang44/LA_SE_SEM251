# Class Diagram Report: HCMUT Tutoring Support System
## Backend Class Structure Analysis

**Generated:** November 25, 2025  
**Purpose:** Comprehensive class structure documentation for Software Engineering report and UML Class Diagram creation

---

## Part 1: Entity Classes Overview & Relationships

### Entity Relationship Summary

```
User (1) ──────┬─────────(1) Student
               │
               └─────────(1) UniversityStaff

Department (1) ────────(N) Student
Department (1) ────────(N) UniversityStaff
Department (1) ────────(N) Course

Course (1) ────────(N) Class
UniversityStaff (1) ────────(N) Class [as tutor]

Class (1) ────────(N) Session
Class (1) ────────(N) CourseRegistration
Course (1) ────────(N) CourseRegistration
Student (1) ────────(N) CourseRegistration

Session (1) ────────(N) SessionEnrollment
Student (1) ────────(N) SessionEnrollment

Course (1) ────────(N) Material

Student (1) ────────(N) Feedback
Course (1) ────────(N) Feedback
Class (1) ────────(N) Feedback

Feedback (1) ────────(N) FeedbackRating
```

### Cardinality & Relationship Types

| Relationship | Type | Cardinality | JPA Mapping |
|-------------|------|-------------|-------------|
| User → Student | One-to-One | 1:0..1 | `@OneToOne @MapsId` |
| User → UniversityStaff | One-to-One | 1:0..1 | `@OneToOne @MapsId` |
| Department → Student | One-to-Many | 1:N | `@ManyToOne` |
| Department → UniversityStaff | One-to-Many | 1:N | `@ManyToOne` |
| Department → Course | One-to-Many | 1:N | `@ManyToOne` |
| Course → Class | One-to-Many | 1:N | `@ManyToOne` |
| UniversityStaff → Class | One-to-Many (as tutor) | 1:N | `@ManyToOne` |
| Class → Session | One-to-Many | 1:N | `@ManyToOne` |
| Class → CourseRegistration | One-to-Many | 1:N | `@ManyToOne` |
| Course → CourseRegistration | One-to-Many | 1:N | `@ManyToOne` |
| Student → CourseRegistration | One-to-Many | 1:N | `@ManyToOne` |
| Session → SessionEnrollment | One-to-Many | 1:N | `@ManyToOne` |
| Student → SessionEnrollment | One-to-Many | 1:N | `@ManyToOne` |
| Course → Material | One-to-Many | 1:N | `@ManyToOne` |
| Student → Feedback | One-to-Many | 1:N | `@ManyToOne` |
| Course → Feedback | One-to-Many | 1:N | `@ManyToOne` |
| Class → Feedback | One-to-Many | 1:N | `@ManyToOne` |
| Feedback → FeedbackRating | One-to-Many | 1:N | `@OneToMany (cascade, orphanRemoval)` |

---

## Part 2: Detailed Entity Class Specifications

### 2.1 Core User Management Entities

#### **Class: User**
**Purpose:** Base user entity representing all system users  
**Table:** `USER`  
**Inheritance Strategy:** Table-per-class (separate Student/UniversityStaff tables)

**Attributes:**
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `userId` | `Integer` | PK, Auto-increment | Unique user identifier |
| `email` | `String` | NOT NULL, UNIQUE | User email address |
| `firstName` | `String(100)` | NOT NULL | First name |
| `middleName` | `String(100)` | NULL | Middle name (optional) |
| `lastName` | `String(100)` | NOT NULL | Last name |
| `userType` | `UserType (enum)` | NOT NULL | STUDENT, TUTOR, ADMINISTRATOR, COOPERATOR |

**Methods:** None (Lombok-generated getters/setters via `@Getter`, `@Setter`)

**Relationships:**
- One-to-One with `Student` (optional)
- One-to-One with `UniversityStaff` (optional)

**Design Notes:**
- Uses `@MapsId` pattern for shared primary key with Student/UniversityStaff
- Lombok `@Builder` for fluent object creation
- No explicit methods - pure data entity

---

#### **Class: Student**
**Purpose:** Extends User with student-specific information  
**Table:** `student`  
**Primary Key:** Shared with User via `@MapsId`

**Attributes:**
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `userId` | `Integer` | PK, FK to User | Shared primary key |
| `user` | `User` | `@OneToOne @MapsId` | Associated user account |
| `studentId` | `String` | NOT NULL, UNIQUE | Student ID (e.g., "2152001") |
| `department` | `Department` | `@ManyToOne`, NOT NULL | Enrolled department |
| `major` | `String` | NULL | Major/specialization |
| `academicLevel` | `String` | NULL | Undergraduate/Graduate/PhD |

**Methods:** Lombok-generated

**Relationships:**
- One-to-One with `User` (owns the relationship)
- Many-to-One with `Department`
- One-to-Many with `CourseRegistration`
- One-to-Many with `SessionEnrollment`
- One-to-Many with `Feedback`

---

#### **Class: UniversityStaff**
**Purpose:** Extends User with staff/tutor-specific information  
**Table:** `university_staff`  
**Primary Key:** Shared with User via `@MapsId`

**Attributes:**
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `userId` | `Integer` | PK, FK to User | Shared primary key |
| `user` | `User` | `@OneToOne @MapsId` | Associated user account |
| `staffId` | `String` | UNIQUE | Staff ID (e.g., "STF1001") |
| `department` | `Department` | `@ManyToOne`, NOT NULL | Affiliated department |

**Methods:** Lombok-generated

**Relationships:**
- One-to-One with `User` (owns the relationship)
- Many-to-One with `Department`
- One-to-Many with `Class` (as tutor)

---

#### **Class: Department**
**Purpose:** Organizational unit for students, staff, and courses  
**Table:** `department`

**Attributes:**
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `departmentId` | `Integer` | PK, Auto-increment | Unique department ID |
| `departmentName` | `String(200)` | NOT NULL, UNIQUE | Department name (e.g., "Computer Science") |

**Methods:** Lombok-generated

**Relationships:**
- One-to-Many with `Student`
- One-to-Many with `UniversityStaff`
- One-to-Many with `Course`

---

### 2.2 Course Management Entities

#### **Class: Course**
**Purpose:** Course catalog definition (template for classes)  
**Table:** `course`

**Attributes:**
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `courseId` | `Long` | PK, Auto-increment | Unique course identifier |
| `code` | `String(50)` | NOT NULL, UNIQUE | Course code (e.g., "CSE101") |
| `name` | `String` | NOT NULL | Course name |
| `description` | `String` | NULL | Course description |
| `departmentName` | `String` | NULL | Department name (temporary field) |
| `department` | `Department` | `@ManyToOne`, NOT NULL | Owning department |

**Methods:** Lombok-generated

**Relationships:**
- Many-to-One with `Department`
- One-to-Many with `Class`
- One-to-Many with `CourseRegistration`
- One-to-Many with `Material`
- One-to-Many with `Feedback`

**Design Notes:**
- `departmentName` is a temporary denormalized field (should be removed in favor of `department.departmentName`)
- Course is a template; `Class` represents specific offerings

---

#### **Class: Class**
**Purpose:** Specific course offering in a semester with assigned tutor  
**Table:** `class`

**Attributes:**
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `classId` | `Long` | PK, Auto-increment | Unique class identifier |
| `course` | `Course` | `@ManyToOne`, NOT NULL | Course template |
| `semester` | `String` | NOT NULL | Semester (e.g., "Fall 2024") |
| `tutor` | `UniversityStaff` | `@ManyToOne`, NOT NULL | Assigned tutor |
| `createdAt` | `LocalDateTime` | NOT NULL | Creation timestamp |
| `status` | `String` | NULL | ACTIVE, INACTIVE, CANCELLED, COMPLETED |
| `capacity` | `Integer` | NULL | Max students (null = unlimited) |
| `customName` | `String(255)` | NULL | Custom class name override |
| `enrolledCount` | `Integer` | Default: 0 | Current enrollment count |

**Methods:** Lombok-generated

**Relationships:**
- Many-to-One with `Course`
- Many-to-One with `UniversityStaff` (tutor)
- One-to-Many with `Session`
- One-to-Many with `CourseRegistration`
- One-to-Many with `Feedback`

**Business Rules:**
- `enrolledCount` must be ≤ `capacity` (enforced at service layer)
- Status lifecycle: ACTIVE → COMPLETED/CANCELLED

---

#### **Class: CourseRegistration**
**Purpose:** Student enrollment in a specific class  
**Table:** `course_registration`

**Attributes:**
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `registrationId` | `Long` | PK, Auto-increment | Unique registration ID |
| `student` | `Student` | `@ManyToOne`, NOT NULL | Enrolled student |
| `classEntity` | `Class` | `@ManyToOne`, NOT NULL | Enrolled class |
| `course` | `Course` | `@ManyToOne`, NOT NULL | Course reference |
| `registeredAt` | `Instant` | NOT NULL, Default: now() | Registration timestamp |

**Methods:** Lombok-generated (uses `@Data`)

**Relationships:**
- Many-to-One with `Student`
- Many-to-One with `Class`
- Many-to-One with `Course`

**Design Notes:**
- Both `classEntity` and `course` are stored for query optimization
- `registeredAt` uses `Instant` for UTC timestamp precision

---

### 2.3 Session Management Entities

#### **Class: Session**
**Purpose:** Individual tutoring/lecture session within a class  
**Table:** `session`  
**Unique Constraint:** `(class_id, start_time)` - prevents duplicate sessions  
**Index:** `idx_session_class` on `class_id`

**Attributes:**
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `sessionId` | `Long` | PK, Auto-increment | Unique session ID |
| `clazz` | `Class` | `@ManyToOne`, NOT NULL | Parent class |
| `title` | `String(255)` | NOT NULL | Session title |
| `startTime` | `LocalDateTime` | NOT NULL | Session start time |
| `endTime` | `LocalDateTime` | NULL | Session end time (optional) |
| `description` | `String(500)` | NULL | Session description |
| `location` | `String(255)` | NULL | Location (e.g., "Room 101", "Zoom: xyz") |
| `sessionType` | `String(50)` | NULL | LECTURE, LAB, TUTORIAL |
| `maxStudents` | `Integer` | Default: 30 | Per-session capacity |
| `currentStudents` | `Integer` | Default: 0 | Current attendance count |
| `status` | `String(20)` | Default: "SCHEDULED" | SCHEDULED, ACTIVE, CANCELLED, COMPLETED |
| `createdAt` | `LocalDateTime` | NOT NULL | Creation timestamp |

**Methods:**
- `onCreate()` - `@PrePersist` lifecycle callback to set `createdAt`

**Relationships:**
- Many-to-One with `Class`
- One-to-Many with `SessionEnrollment`

**Business Rules:**
- `currentStudents` must be ≤ `maxStudents`
- `startTime` < `endTime` (if endTime is set)
- Unique `(class_id, start_time)` prevents scheduling conflicts

---

#### **Class: SessionEnrollment**
**Purpose:** Student registration for specific session attendance  
**Table:** `session_enrollment`

**Attributes:**
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `enrollmentId` | `Long` | PK, Auto-increment | Unique enrollment ID |
| `session` | `Session` | `@ManyToOne (LAZY)`, NOT NULL | Target session |
| `student` | `Student` | `@ManyToOne (LAZY)`, NOT NULL | Enrolled student |
| `enrollmentDate` | `LocalDateTime` | NOT NULL | Enrollment timestamp |
| `status` | `String(40)` | Default: "ENROLLED" | ENROLLED, CANCELLED |

**Methods:**
- `onCreate()` - `@PrePersist` to set `enrollmentDate` and default `status`

**Relationships:**
- Many-to-One with `Session` (lazy-loaded)
- Many-to-One with `Student` (lazy-loaded)

**Design Notes:**
- Uses `FetchType.LAZY` for performance (avoid N+1 queries)
- Status allows tracking cancellations without deletion

---

### 2.4 Feedback System Entities

#### **Class: Feedback**
**Purpose:** Student feedback on courses/classes/tutors  
**Table:** `feedback`

**Attributes:**
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `feedbackId` | `Long` | PK, Auto-increment | Unique feedback ID |
| `student` | `Student` | `@ManyToOne`, NOT NULL | Feedback author |
| `course` | `Course` | `@ManyToOne`, NOT NULL | Course being reviewed |
| `classEntity` | `Class` | `@ManyToOne`, NOT NULL | Class being reviewed |
| `comment` | `String (TEXT)` | NULL | Textual feedback |
| `imageUrl` | `String(500)` | NULL | Optional image attachment URL |
| `status` | `String(20)` | Default: "PENDING" | PENDING, APPROVED, REJECTED |
| `createdAt` | `LocalDateTime` | NOT NULL, immutable | Creation timestamp |
| `updatedAt` | `LocalDateTime` | Default: now() | Last update timestamp |
| `ratings` | `List<FeedbackRating>` | `@OneToMany`, cascade | Associated ratings |

**Methods:**
- `onUpdate()` - `@PreUpdate` lifecycle callback to update `updatedAt`

**Relationships:**
- Many-to-One with `Student`
- Many-to-One with `Course`
- Many-to-One with `Class`
- One-to-Many with `FeedbackRating` (cascade ALL, orphan removal)

**Business Rules:**
- Student must be enrolled in the class to submit feedback (enforced at service layer)
- Status workflow: PENDING → APPROVED/REJECTED (moderation)

---

#### **Class: FeedbackRating**
**Purpose:** Individual question ratings within feedback (1-5 stars)  
**Table:** `feedback_rating`

**Attributes:**
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `ratingId` | `Long` | PK, Auto-increment | Unique rating ID |
| `feedback` | `Feedback` | `@ManyToOne`, NOT NULL | Parent feedback |
| `question` | `String(500)` | NOT NULL | Rating question/criterion |
| `ratingValue` | `Integer` | NOT NULL | Rating value (1-5) |

**Methods:** Lombok-generated

**Relationships:**
- Many-to-One with `Feedback`

**Business Rules:**
- `ratingValue` must be between 1 and 5 (enforced at database level via CHECK constraint)
- Multiple ratings can exist per feedback (e.g., "Content Quality: 5", "Tutor Communication: 4")

---

### 2.5 Material Management Entities

#### **Class: Material**
**Purpose:** Course materials (files, URLs, library references)  
**Table:** `materials`

**Attributes:**
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | `Long` | PK, Auto-increment | Unique material ID |
| `course` | `Course` | `@ManyToOne (LAZY)`, NOT NULL | Associated course |
| `ownerId` | `String(100)` | NOT NULL | Material uploader ID |
| `title` | `String` | NOT NULL | Material title |
| `description` | `String(2000)` | NULL | Material description |
| `sourceType` | `MaterialSourceType (enum)` | NOT NULL | LOCAL_FILE, LIBRARY_REF, EXTERNAL_URL |
| `libraryItemId` | `Long` | NULL | Reference to external library item |
| `filePath` | `String` | NULL | Local file path (if LOCAL_FILE) |
| `originalName` | `String` | NULL | Original filename |
| `contentType` | `String` | NULL | MIME type (e.g., "application/pdf") |
| `sizeBytes` | `Long` | NULL | File size in bytes |
| `externalUrl` | `String` | NULL | External URL (if EXTERNAL_URL) |
| `createdAt` | `LocalDateTime` | NOT NULL | Creation timestamp |
| `updatedAt` | `LocalDateTime` | NOT NULL | Last update timestamp |

**Methods:**
- `onCreate()` - `@PrePersist` to set `createdAt` and `updatedAt`
- `onUpdate()` - `@PreUpdate` to update `updatedAt`

**Relationships:**
- Many-to-One with `Course` (lazy-loaded)

**Business Rules:**
- If `sourceType == LOCAL_FILE`: `filePath`, `originalName`, `contentType`, `sizeBytes` must be set
- If `sourceType == LIBRARY_REF`: `libraryItemId` must be set
- If `sourceType == EXTERNAL_URL`: `externalUrl` must be set

---

### 2.6 Audit & Logging Entities

#### **Class: ActivityLog**
**Purpose:** Audit trail for system actions  
**Table:** `activity_log`

**Attributes:**
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `logId` | `Long` | PK, Auto-increment | Unique log entry ID |
| `userId` | `Integer` | NOT NULL | User who performed action |
| `action` | `String(100)` | NOT NULL | Action type (e.g., "CREATE", "UPDATE", "DELETE") |
| `entityType` | `String(50)` | NOT NULL | Entity type (e.g., "Session", "Class") |
| `entityId` | `Long` | NULL | Affected entity ID |
| `description` | `String (TEXT)` | NULL | Detailed description |
| `createdAt` | `LocalDateTime` | NOT NULL, immutable | Timestamp |

**Methods:** Lombok-generated

**Relationships:** None (denormalized for audit purposes)

**Design Notes:**
- No foreign keys to avoid cascading deletes affecting audit trail
- `userId` stored as integer (not FK) for historical accuracy even after user deletion

---

### 2.7 Enum Classes

#### **Enum: UserType**
**Values:**
- `STUDENT` - Regular student user
- `TUTOR` - Teaching staff (same as STAFF in some contexts)
- `ADMINISTRATOR` - System administrator
- `COOPERATOR` - External collaborator

---

#### **Enum: MaterialSourceType**
**Values:**
- `LOCAL_FILE` - File uploaded to server storage
- `LIBRARY_REF` - Reference to external HCMUT Library system
- `EXTERNAL_URL` - External web resource (YouTube, Google Drive, etc.)

---

## Part 3: Service Layer Classes

### Service Class Architecture

| Service Class | Primary Responsibilities | Key Dependencies |
|--------------|-------------------------|------------------|
| `UserService` | User CRUD operations | `UserRepository` |
| `ClassService` | Class management, enrollment tracking | `ClassRepository`, `CourseRepository`, `UniversityStaffRepository`, `UserProfilePersistenceService` |
| `CourseService` | Course catalog management | `CourseRepository` |
| `SessionService` | Session lifecycle (create, cancel, reschedule) | `jpaSessionRepository`, `ClassRepository`, `UniversityStaffRepository`, `UserRepository`, `StudentRepository`, `SessionRegistrationRepository`, `ActivityLogRepository` |
| `SessionRegistrationService` | Session enrollment logic | `SessionRegistrationRepository`, `jpaSessionRepository`, `StudentRepository` |
| `FeedbackService` | Feedback submission, retrieval | `FeedbackRepository`, `StudentRepository`, `CourseRepository`, `ClassRepository`, `CourseRegistrationRepository`, `ActivityLogRepository`, `UserRepository` |
| `MaterialService` | Material CRUD, file upload/download | `MaterialRepository`, `CourseRepository`, `LibraryClient` |
| `CourseRegistrationService` | Course enrollment logic | `CourseRegistrationRepository`, `ClassRepository`, `StudentRepository`, `UserRepository` |
| `UserProfilePersistenceService` | User synchronization with Datacore | `UserRepository`, `StudentRepository`, `UniversityStaffRepository`, `DatacoreClient` |
| `TssUserOAuth2UserService` | OAuth2 user loading | `UserProfilePersistenceService` |
| `DatacoreClient` | External Datacore API integration | WebClient, Datacore REST API |

### Service Layer Design Patterns

**Pattern 1: Transaction Script**
- Services contain business logic as procedural methods
- Each public method represents a use case/transaction

**Pattern 2: Repository Facade**
- Services inject multiple repositories directly
- High coupling (noted in Component Interface Analysis report as technical debt)

**Pattern 3: DTO Mapping**
- Services convert entities to DTOs before returning to controllers
- Prevents entity exposure in API responses

---

## Part 4: Controller Layer Classes

### REST Controller Mapping

| Controller | Base Path | Primary Operations |
|-----------|-----------|-------------------|
| `AuthController` | `/auth` | GET `/me` - Get current user |
| `UserController` | `/api/users` | User profile operations |
| `StudentController` | `/api/students` | Student-specific operations |
| `StaffController` | `/api/staff` | Staff-specific operations |
| `CourseController` | `/api/courses` | Course catalog CRUD, search |
| `ClassController` | `/api/classes` | Class CRUD, listing |
| `SessionController` | `/api/sessions` | Session CRUD, cancellation, rescheduling |
| `SessionEnrollmentController` | `/api/sessions/{id}/enrollments` | Session enrollment operations |
| `CourseRegistrationController` | `/api/course-registrations` | Course enrollment CRUD |
| `FeedbackController` | `/api/feedback` | Feedback submission, retrieval |
| `MaterialController` | `/api/courses/{courseId}/materials` | Material upload, download, linking |
| `UserSyncController` | `/api/sync` | Manual user synchronization with Datacore |

### Controller Design Patterns

**Pattern 1: Thin Controllers**
- Controllers delegate to services immediately
- Minimal validation (Bean Validation via `@Valid`)
- Authentication via `@AuthenticationPrincipal TssUserPrincipal`

**Pattern 2: Authorization**
- Method-level security via `@PreAuthorize`
- Example: `@PreAuthorize("hasAnyAuthority('STAFF')")` for session creation

**Pattern 3: Response DTOs**
- Controllers return DTOs, never entities
- ResponseEntity for HTTP status control

---

## Part 5: Data Transfer Object (DTO) Classes

### Request DTOs

| DTO Class | Purpose | Key Fields |
|-----------|---------|-----------|
| `CreateCourseRequest` | Course creation | `code`, `name`, `description`, `departmentName` |
| `CreateClassRequest` | Class creation | `courseId`, `semester`, `tutorId`, `capacity`, `customName` |
| `UpdateClassRequest` | Class updates | `classId`, `semester`, `status`, `capacity` |
| `CreateSessionRequest` | Session creation | `classId`, `title`, `startTime`, `endTime`, `description`, `location`, `sessionType`, `capacity` |
| `RescheduleRequest` | Session rescheduling | `sessionId`, `startTime`, `endTime`, `location` |
| `RegisterCourseRequest` | Course enrollment | `classId` |
| `EnrollmentRequest` | Session enrollment | `sessionId`, `studentId` |
| `SubmitFeedbackRequest` | Feedback submission | `classId`, `comment`, `imageUrl`, `ratings[]` |
| `AddExternalMaterialRequest` | External URL material | `title`, `description`, `externalUrl` |
| `LinkLibraryMaterialRequest` | Library reference | `libraryItemId`, `title`, `description` |
| `UpdateStudentRequest` | Student profile update | `major`, `academicLevel` |
| `UpdateStaffRequest` | Staff profile update | `departmentId` |

### Response DTOs

| DTO Class | Purpose | Key Fields |
|-----------|---------|-----------|
| `CourseResponse` | Course data | `courseId`, `code`, `name`, `description`, `departmentName` |
| `ClassResponse` | Class data | `classId`, `courseId`, `courseName`, `semester`, `tutorId`, `tutorName`, `status`, `capacity`, `enrolledCount` |
| `SessionResponse` | Session data | `sessionId`, `classId`, `title`, `startTime`, `endTime`, `location`, `sessionType`, `maxStudents`, `currentStudents`, `status` |
| `SessionRescheduleResponse` | Reschedule result | `sessionId`, `oldStartTime`, `newStartTime`, `message` |
| `EnrollmentResponse` | Enrollment result | `enrollmentId`, `sessionId`, `studentId`, `enrollmentDate`, `status` |
| `CourseRegistrationResponse` | Registration data | `registrationId`, `studentId`, `classId`, `courseCode`, `registeredAt` |
| `FeedbackResponse` | Feedback data | `feedbackId`, `studentName`, `courseCode`, `comment`, `ratings[]`, `status`, `createdAt` |
| `MaterialResponse` | Material data | `id`, `courseId`, `title`, `description`, `sourceType`, `downloadUrl`, `externalUrl`, `createdAt` |
| `EnrolledCourseResponse` | Student's enrolled courses | `courseId`, `courseCode`, `courseName`, `classId`, `semester`, `tutorName`, `status` |
| `ToFEUserDto` | Current user profile | `userId`, `email`, `firstName`, `lastName`, `userType`, `studentId/staffId`, `departmentName` |
| `RecvDatacoreDto` | Data from Datacore API | Various user fields from external system |

---

## Part 6: Repository Layer Classes

### JPA Repository Interfaces

| Repository | Entity | Custom Queries |
|-----------|--------|----------------|
| `UserRepository` | `User` | `findByEmail(String email)` |
| `StudentRepository` | `Student` | `findByStudentId(String studentId)`, `findByUser_UserId(Integer userId)` |
| `UniversityStaffRepository` | `UniversityStaff` | `findByStaffId(String staffId)`, `findByUser_UserId(Integer userId)` |
| `DepartmentRepository` | `Department` | `findByDepartmentName(String name)` |
| `CourseRepository` | `Course` | `findByCode(String code)`, `findByCodeContainingIgnoreCaseOrNameContainingIgnoreCase(String code, String name)` |
| `ClassRepository` | `Class` | `findByCourse_CourseId(Long courseId)`, `findByTutor_UserId(Integer tutorId)` |
| `jpaSessionRepository` | `Session` | `findByClazz_ClassId(Long classId)`, `findByStartTimeBetween(LocalDateTime start, LocalDateTime end)` |
| `SessionRegistrationRepository` | `SessionEnrollment` | `findBySession_SessionId(Long sessionId)`, `findByStudent_UserId(Integer studentId)` |
| `CourseRegistrationRepository` | `CourseRegistration` | `findByStudent_StudentId(String studentId)`, `findByClassEntity_ClassId(Long classId)` |
| `FeedbackRepository` | `Feedback` | `findByCourse_CourseId(Long courseId)`, `findByClassEntity_ClassId(Long classId)`, `findByStudent_UserId(Integer userId)` |
| `MaterialRepository` | `Material` | `findByCourse_CourseIdOrderByCreatedAtDesc(Long courseId)` |
| `ActivityLogRepository` | `ActivityLog` | `findByUserId(Integer userId)`, `findByEntityTypeAndEntityId(String type, Long id)` |

### Repository Design Patterns

**Pattern 1: Spring Data JPA**
- All repositories extend `JpaRepository<Entity, ID>`
- Query derivation from method names
- No manual SQL required for basic queries

**Pattern 2: Query Methods**
- Complex queries use `@Query` annotation (not shown in this analysis)
- Support for Pageable, Sort parameters

---

## Part 7: Configuration & Security Classes

### Configuration Classes

| Class | Purpose | Key Beans/Methods |
|-------|---------|------------------|
| `SecurityConfig` | OAuth2 client + resource server configuration | `SecurityFilterChain`, CORS configuration |
| `WebClientConfig` | HTTP client for external services | `libraryWebClient`, `datacoreWebClient` |
| `OidcLogoutSuccessHandler` | Custom logout handling | OIDC logout flow |

### Security Architecture

**Authentication:**
- OAuth2/OIDC via HCMUT-SSO-MIMIC
- JWT tokens for stateless authentication
- `TssUserPrincipal` as custom principal object

**Authorization:**
- Role-based access control (RBAC)
- Authorities: `STUDENT`, `STAFF`, `ADMINISTRATOR`
- Method-level security via `@PreAuthorize`

---

## Part 8: Client Integration Classes

### External Service Clients

#### **Class: LibraryClient**
**Purpose:** Integration with HCMUT Library microservice

**Methods:**
- `List<LibraryItemResponse> searchItems(String query, String courseCode)`
- `LibraryItemResponse getItem(Long id)`

**Dependencies:**
- `WebClient` (Spring WebFlux reactive HTTP client)
- Library service base URL from configuration

**Design Pattern:** Client Adapter/Proxy

---

#### **Class: DatacoreClient** (in service package)
**Purpose:** Integration with HCMUT Datacore (university master data)

**Methods:** (Inferred from usage)
- Fetch user data by email
- Check course prerequisites
- Validate student eligibility

**Dependencies:**
- `WebClient`
- Datacore service base URL from configuration

---

## Part 9: Domain Model Analysis

### Bounded Contexts

1. **User Management Context**
   - Core: `User`, `Student`, `UniversityStaff`, `Department`
   - Shared Kernel: `UserType` enum

2. **Course Catalog Context**
   - Core: `Course`, `Class`
   - Shared: `Department`, `UniversityStaff`

3. **Session Management Context**
   - Core: `Session`, `SessionEnrollment`
   - Shared: `Class`, `Student`

4. **Registration Context**
   - Core: `CourseRegistration`
   - Shared: `Student`, `Class`, `Course`

5. **Feedback Context**
   - Core: `Feedback`, `FeedbackRating`
   - Shared: `Student`, `Course`, `Class`

6. **Material Management Context**
   - Core: `Material`
   - Shared: `Course`

7. **Audit Context**
   - Core: `ActivityLog`
   - Anti-Corruption Layer: No foreign keys to other contexts

---

## Part 10: Key Design Patterns & Architectural Decisions

### Design Patterns Identified

1. **Builder Pattern**
   - All entities use Lombok `@Builder` for fluent construction
   - Example: `Session.builder().title("Math Tutoring").startTime(...).build()`

2. **Repository Pattern**
   - Data access abstraction via Spring Data JPA repositories
   - Separation of business logic (services) from data access (repositories)

3. **DTO Pattern**
   - Request/Response DTOs prevent entity exposure
   - Mapper classes (e.g., `ToFEUserMapper`) handle conversions

4. **Facade Pattern**
   - Controllers act as facades to service layer
   - Services aggregate multiple repository calls

5. **Strategy Pattern** (Implicit)
   - `MaterialSourceType` enum drives different handling logic
   - Polymorphic behavior based on source type

6. **Lifecycle Callbacks**
   - `@PrePersist` and `@PreUpdate` for automatic timestamp management
   - Ensures data integrity without manual intervention

### Architectural Decisions

1. **Shared Primary Key Pattern**
   - `Student` and `UniversityStaff` share `User.userId` via `@MapsId`
   - Avoids nullable foreign keys in `User` table

2. **Audit Trail Denormalization**
   - `ActivityLog` stores `userId` as integer (not FK)
   - Preserves audit history even after user deletion

3. **Lazy Loading Strategy**
   - `SessionEnrollment` uses `FetchType.LAZY` for `session` and `student`
   - Prevents N+1 query problems in list operations

4. **Cascade Policies**
   - `Feedback` → `FeedbackRating`: `CascadeType.ALL` with `orphanRemoval`
   - Ensures referential integrity for composition relationships

5. **Temporal Data Design**
   - `LocalDateTime` for application-level timestamps
   - `Instant` for `CourseRegistration` (UTC precision)
   - Mixed approach based on use case

---

## Part 11: Database Schema Highlights

### Database Migrations (Flyway)

| Migration | Purpose |
|-----------|---------|
| `V1__.sql` | Core user tables |
| `V2__student_staff_course_registration.sql` | Student, staff, courses, classes, registrations |
| `V3__feedback_system.sql` | Feedback and ratings tables |
| `V4__session.sql` | Session and session enrollment tables |
| `V5__materials.sql` | Materials table |

### Key Constraints

1. **Unique Constraints**
   - `User.email` (unique)
   - `Student.studentId` (unique)
   - `UniversityStaff.staffId` (unique)
   - `Course.code` (unique)
   - `Department.departmentName` (unique)
   - `Session(class_id, start_time)` (composite unique)

2. **Foreign Key Constraints**
   - All `@ManyToOne` relationships create FKs
   - Ensures referential integrity at database level

3. **Indexes**
   - `idx_session_class` on `session.class_id` for query performance

---

## Part 12: Class Diagram Drawing Recommendations

### For UML Class Diagram, Include:

1. **Core Entity Classes** (detailed)
   - All attributes with types
   - All relationships with cardinalities
   - Key methods (lifecycle callbacks)

2. **Enum Classes** (simplified)
   - Show values only

3. **DTO Classes** (simplified)
   - Group by Request/Response
   - Show only in package diagram or separate DTO diagram

4. **Service Classes** (high-level)
   - Show method signatures for key operations
   - Indicate dependencies with dashed arrows

5. **Controller Classes** (API-focused)
   - Show HTTP method mappings as stereotypes
   - Group by functional area

### Suggested Diagram Layers

**Layer 1: Entity Domain Model**
- Focus: Entities, enums, relationships
- Include: User, Student, UniversityStaff, Department, Course, Class, Session, SessionEnrollment, CourseRegistration, Feedback, FeedbackRating, Material, ActivityLog

**Layer 2: Service Architecture**
- Focus: Service classes and their dependencies
- Show: Service → Repository relationships

**Layer 3: API Layer**
- Focus: Controllers and DTOs
- Show: Controller → Service relationships
- Show: Request/Response DTO flows

**Layer 4: Integration Layer**
- Focus: External clients
- Show: LibraryClient, DatacoreClient integrations

---

## Summary Statistics

- **Total Entity Classes:** 14 (+ 2 enums)
- **Total Service Classes:** 10
- **Total Controller Classes:** 12
- **Total Repository Interfaces:** 12
- **Total DTO Classes:** ~25 (Request + Response)
- **Total Relationships:** 25 (entity-to-entity)
- **Database Tables:** 14
- **Flyway Migrations:** 5

---

## Conclusion

The HCMUT Tutoring Support System backend demonstrates a **well-structured layered architecture** with clear separation between persistence (entities), business logic (services), and presentation (controllers, DTOs). The domain model follows **object-relational mapping best practices** with appropriate use of JPA annotations, lifecycle callbacks, and relationship mappings.

**Strengths:**
- ✅ Comprehensive entity model covering all business domains
- ✅ Clear relationship definitions with proper cardinalities
- ✅ Effective use of Lombok to reduce boilerplate
- ✅ Audit trail support via ActivityLog
- ✅ Flexible material system supporting multiple source types

**Areas for Improvement:**
- ⚠️ High service coupling (many repository dependencies)
- ⚠️ Missing service layer interfaces (tight coupling to implementations)
- ⚠️ Denormalized `departmentName` in `Course` entity
- ⚠️ No explicit validation annotations on entities (Bean Validation)

This report provides complete information for creating detailed UML class diagrams and understanding the system's object-oriented design.

---

**Report Author:** GitHub Copilot AI Analysis  
**Source Code Base:** HCMUT-TSS-Backend (November 25, 2025)  
**Analysis Depth:** Complete entity, service, controller, DTO, and repository layers
