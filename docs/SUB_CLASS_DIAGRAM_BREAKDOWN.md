# Sub-Class Diagram Breakdown
## HCMUT Tutoring Support System - Implementation Class Diagrams

**Document Version:** 1.0  
**Date:** November 29, 2025  
**Purpose:** Detailed breakdown of 7 sub-class diagrams with complete MVC-Entity relationships

---

## Overview

This document provides a comprehensive breakdown of the system into **7 Sub-Class Diagrams**, each focusing on a specific subsystem/component. Each diagram includes:
- Entity classes with attributes
- Controller, Service, Repository, and Mapper classes
- Complete relationship mappings (Dependency, Association, Composition)
- Cross-component interactions

---

## Sub-Diagram 1: User Management

### **Scope:** Authentication & ProfileManagement Components

### **Entities (6)**
1. **User** (core entity)
   - userId: Integer
   - email: String
   - firstName, middleName, lastName: String
   - userType: UserType
   - status: UserStatus

2. **Student** (composition with User)
   - userId: Integer
   - user: User
   - studentId: String
   - department: Department
   - major: String
   - academicLevel: String

3. **UniversityStaff** (composition with User)
   - userId: Integer
   - user: User
   - staffId: String
   - department: Department
   - position: String
   - role: String

4. **Department**
   - departmentId: Integer
   - departmentName: String

5. **UserType** (enum)
   - STUDENT, TUTOR, ADMINISTRATOR, COOPERATOR

6. **UserStatus** (enum)
   - ACTIVE, BANNED

---

### **Controllers (4)**

#### AuthController
- **Purpose:** Authentication component - handles user login/logout
- **Dependencies:**
  - `┈─> ToFEUserMapper` (Dependency)

#### UserController  
- **Purpose:** ProfileManagement - general user operations
- **Dependencies:**
  - `┈─> UserService` (Dependency)

#### StudentController
- **Purpose:** ProfileManagement - student-specific operations
- **Dependencies:**
  - `┈─> UserService` (Dependency)

#### StaffController / AdminController
- **Purpose:** ProfileManagement - staff/admin operations
- **Dependencies:**
  - `┈─> AdminService` (Dependency)
  - `┈─> UserService` (Dependency)

---

### **Services (5)**

#### UserService
- **Purpose:** Core user management business logic
- **Dependencies:**
  - `┈─> UserRepository` (Dependency)
  - `┈─> StudentRepository` (Dependency)
  - `┈─> UniversityStaffRepository` (Dependency)
  - `┈─> DepartmentRepository` (Dependency)
  - `┈─> UserProfilePersistenceService` (Dependency)
- **Manages Entities:**
  - `──> User` (Association - CRUD operations)
  - `──> Student` (Association - CRUD operations)
  - `──> UniversityStaff` (Association - CRUD operations)

#### AdminService
- **Purpose:** Administrative operations
- **Dependencies:**
  - `┈─> UserRepository` (Dependency)
- **Manages Entities:**
  - `──> User` (Association - admin operations)

#### UserProfilePersistenceService
- **Purpose:** Sync user data with HCMUT_DATACORE
- **Dependencies:**
  - `┈─> UserRepository` (Dependency)
  - `┈─> StudentRepository` (Dependency)
  - `┈─> UniversityStaffRepository` (Dependency)
  - `┈─> DepartmentRepository` (Dependency)
  - `┈─> DatacoreClient` (Dependency - External)
- **Manages Entities:**
  - `──> User` (Association - sync operations)
  - `──> Student` (Association - sync operations)
  - `──> UniversityStaff` (Association - sync operations)
  - `──> Department` (Association - lookup operations)

#### TssUserOAuth2UserService
- **Purpose:** OAuth2 authentication with HCMUT_SSO
- **Dependencies:**
  - `┈─> UserProfilePersistenceService` (Dependency)
- **Manages Entities:**
  - `──> User` (Association - authentication & creation)

---

### **Repositories (4)**

#### UserRepository
- **Purpose:** User data access layer
- **Manages Entity:**
  - `──> User` (Association - "manages/persists" relationship)
- **Method Examples:** findByEmail(), save(), findById()

#### StudentRepository
- **Purpose:** Student data access layer
- **Manages Entity:**
  - `──> Student` (Association - "manages/persists" relationship)
- **Method Examples:** findByUserId(), save(), findByStudentId()

#### UniversityStaffRepository
- **Purpose:** Staff data access layer
- **Manages Entity:**
  - `──> UniversityStaff` (Association - "manages/persists" relationship)
- **Method Examples:** findByUserId(), save(), findByStaffId()

#### DepartmentRepository
- **Purpose:** Department data access layer
- **Manages Entity:**
  - `──> Department` (Association - "manages/persists" relationship)
- **Method Examples:** findByDepartmentName(), save()

---

### **Mappers (2)**

#### ToFEUserMapper
- **Purpose:** Map User entity to frontend DTO
- **Dependencies:**
  - `┈─> User` (Dependency - parameter)
  - `┈─> ToFEUserDto` (Dependency - return type)

#### FromDatacoreMapper
- **Purpose:** Map DATACORE DTO to User/Student/Staff entities
- **Dependencies:**
  - `┈─> RecvDatacoreDto` (Dependency - parameter)
  - `┈─> User` (Dependency - return type)
  - `┈─> Student` (Dependency - return type)
  - `┈─> UniversityStaff` (Dependency - return type)

---

### **Entity Relationships**

| From | Relationship | To | Type | Cardinality |
|------|--------------|-----|------|-------------|
| Student | Composition | User | ◆──> | 1:1 |
| UniversityStaff | Composition | User | ◆──> | 1:1 |
| Student | Association | Department | ──> | Many:1 |
| UniversityStaff | Association | Department | ──> | Many:1 |
| User | Association | UserType | ──> | Many:1 |
| User | Association | UserStatus | ──> | Many:1 |

---

### **Complete Dependency Flow**

```
[CONTROLLER LAYER]
AuthController ┈─> ToFEUserMapper ┈─> User (entity)
                                  ┈─> ToFEUserDto (DTO)

UserController ┈─> UserService ──> User, Student, UniversityStaff (manages)
StudentController ┈─> UserService ──> User, Student, UniversityStaff (manages)
AdminController ┈─> AdminService ──> User (manages)

[SERVICE LAYER]
UserService ┈─> UserRepository ──> User (manages)
            ┈─> StudentRepository ──> Student (manages)
            ┈─> UniversityStaffRepository ──> UniversityStaff (manages)
            ┈─> DepartmentRepository ──> Department (manages)
            ┈─> UserProfilePersistenceService

AdminService ┈─> UserRepository ──> User (manages)

UserProfilePersistenceService ┈─> UserRepository ──> User (manages)
                              ┈─> StudentRepository ──> Student (manages)
                              ┈─> UniversityStaffRepository ──> UniversityStaff (manages)
                              ┈─> DepartmentRepository ──> Department (manages)
                              ┈─> DatacoreClient (external)

TssUserOAuth2UserService ┈─> UserProfilePersistenceService ──> User (creates)

[REPOSITORY LAYER]
UserRepository ──> User (CRUD operations)
StudentRepository ──> Student (CRUD operations)
UniversityStaffRepository ──> UniversityStaff (CRUD operations)
DepartmentRepository ──> Department (CRUD operations)

[MAPPER LAYER]
ToFEUserMapper ┈─> User (source) ──> ToFEUserDto (target)
FromDatacoreMapper ┈─> RecvDatacoreDto (source) ──> User, Student, UniversityStaff (targets)
```

**Legend:**
- `┈─>` = Dependency (uses/calls)
- `──>` = Association with "manages/creates/persists" semantic

---

## Sub-Diagram 2: Course and Class Management

### **Scope:** Courses Catalog & Enrollment Components

### **Entities (5)**

1. **Course**
   - courseId: Long
   - code: String
   - name: String
   - description: String
   - departmentName: String
   - department: Department

2. **Class**
   - classId: Long
   - course: Course
   - semester: String
   - tutor: UniversityStaff
   - createdAt: LocalDateTime
   - status: String
   - capacity: Integer
   - customName: String
   - enrolledCount: Integer

3. **Department** (shared from User Management)
   - departmentId: Integer
   - departmentName: String

4. **UniversityStaff** (reference for tutor)
   - userId: Integer
   - staffId: String
   - department: Department

5. **CourseRegistration** (Enrollment component)
   - registrationId: Long
   - student: Student
   - classEntity: Class
   - course: Course
   - registeredAt: Instant

---

### **Controllers (3)**

#### CourseController
- **Purpose:** Courses Catalog - course CRUD operations
- **Dependencies:**
  - `┈─> CourseService` (Dependency)

#### ClassController
- **Purpose:** Courses Catalog - class management
- **Dependencies:**
  - `┈─> ClassService` (Dependency)

#### CourseRegistrationController
- **Purpose:** Enrollment - student course registration
- **Dependencies:**
  - `┈─> CourseRegistrationService` (Dependency)

---

### **Services (3)**

#### CourseService
- **Purpose:** Course catalog business logic
- **Dependencies:**
  - `┈─> CourseRepository` (Dependency)
- **Manages Entities:**
  - `──> Course` (Association - CRUD operations)

#### ClassService
- **Purpose:** Class management and validation
- **Dependencies:**
  - `┈─> ClassRepository` (Dependency)
  - `┈─> CourseRepository` (Dependency)
  - `┈─> UniversityStaffRepository` (Dependency)
  - `┈─> UserRepository` (Dependency)
  - `┈─> UserProfilePersistenceService` (Dependency)
- **Manages Entities:**
  - `──> Class` (Association - CRUD operations)
  - `──> Course` (Association - lookup operations)

#### CourseRegistrationService
- **Purpose:** Student enrollment logic
- **Dependencies:**
  - `┈─> CourseRegistrationRepository` (Dependency)
  - `┈─> ClassRepository` (Dependency)
  - `┈─> StudentRepository` (Dependency)
  - `┈─> UserRepository` (Dependency)
- **Manages Entities:**
  - `──> CourseRegistration` (Association - CRUD operations)
  - `──> Class` (Association - enrollment validation)
  - `──> Student` (Association - enrollment tracking)

---

### **Repositories (5)**

#### CourseRepository
- **Manages Entity:**
  - `──> Course` (Association - "manages/persists" relationship)
- **Method Examples:** findByCode(), save(), findAll()

#### ClassRepository
- **Manages Entity:**
  - `──> Class` (Association - "manages/persists" relationship)
- **Method Examples:** findByCourseId(), save(), findByTutorId()

#### CourseRegistrationRepository
- **Manages Entity:**
  - `──> CourseRegistration` (Association - "manages/persists" relationship)
- **Method Examples:** findByStudentId(), save(), existsByStudentAndClass()

#### StudentRepository (from User Management)
- **Manages Entity:**
  - `──> Student` (Association - "manages/persists" relationship)

#### UniversityStaffRepository (from User Management)
- **Manages Entity:**
  - `──> UniversityStaff` (Association - "manages/persists" relationship)

---

### **Mappers (1)**

#### CourseRegistrationMapper
- **Purpose:** Map CourseRegistration entity to response DTO
- **Dependencies:**
  - `┈─> CourseRegistration` (Dependency - parameter)
  - `┈─> UserRepository` (Dependency - fetch user data)
  - `┈─> CourseRegistrationResponse` (Dependency - return type)
  - `┈─> EnrollmentResponse` (Dependency - return type)

---

### **Entity Relationships**

| From | Relationship | To | Type | Cardinality |
|------|--------------|-----|------|-------------|
| Course | Association | Department | ──> | Many:1 |
| Class | Association | Course | ──> | Many:1 |
| Class | Association | UniversityStaff | ──> | Many:1 (tutor) |
| CourseRegistration | Association | Student | ──> | Many:1 |
| CourseRegistration | Association | Class | ──> | Many:1 |
| CourseRegistration | Association | Course | ──> | Many:1 |

---

### **Complete Dependency Flow**

```
[CONTROLLER LAYER]
CourseController ┈─> CourseService ──> Course (manages)

ClassController ┈─> ClassService ──> Class (manages)
                                  ──> Course (lookup)

CourseRegistrationController ┈─> CourseRegistrationService ──> CourseRegistration (manages)
                                                                ──> Class (validates)
                                                                ──> Student (tracks)

[SERVICE LAYER]
CourseService ┈─> CourseRepository ──> Course (CRUD)

ClassService ┈─> ClassRepository ──> Class (CRUD)
             ┈─> CourseRepository ──> Course (lookup)
             ┈─> UniversityStaffRepository ──> UniversityStaff (tutor validation)
             ┈─> UserProfilePersistenceService

CourseRegistrationService ┈─> CourseRegistrationRepository ──> CourseRegistration (CRUD)
                          ┈─> ClassRepository ──> Class (validation)
                          ┈─> StudentRepository ──> Student (tracking)
                          ┈─> UserRepository ──> User (lookup)

[REPOSITORY LAYER]
CourseRepository ──> Course (manages/persists)
ClassRepository ──> Class (manages/persists)
CourseRegistrationRepository ──> CourseRegistration (manages/persists)
StudentRepository ──> Student (manages/persists)
UniversityStaffRepository ──> UniversityStaff (manages/persists)

[MAPPER LAYER]
CourseRegistrationMapper ┈─> CourseRegistration (source)
                         ┈─> UserRepository (fetch user data)
                         ──> CourseRegistrationResponse (target)
```

**Legend:**
- `┈─>` = Dependency (uses/calls/injects)
- `──>` = Association with "manages/creates/persists" semantic

---

## Sub-Diagram 3: Session Management

### **Scope:** Scheduling & SessionParticipation Components

### **Entities (4)**

1. **Session**
   - sessionId: Long
   - clazz: Class
   - title: String
   - startTime, endTime: LocalDateTime
   - description: String
   - location: String
   - sessionType: String
   - maxStudents, currentStudents: Integer
   - status: String
   - createdAt: LocalDateTime

2. **SessionEnrollment**
   - enrollmentId: Long
   - session: Session
   - student: Student
   - enrollmentDate: LocalDateTime
   - status: String

3. **Class** (reference from Course Management)
   - classId: Long
   - course: Course
   - tutor: UniversityStaff

4. **Student** (reference)
   - userId: Integer
   - studentId: String

---

### **Controllers (2)**

#### SessionController
- **Purpose:** Scheduling - session CRUD, cancellation, rescheduling
- **Dependencies:**
  - `┈─> SessionService` (Dependency)

#### SessionEnrollmentController
- **Purpose:** SessionParticipation - student session enrollment
- **Dependencies:**
  - `┈─> SessionRegistrationService` (Dependency)

---

### **Services (2)**

#### SessionService
- **Purpose:** Session scheduling and management
- **Dependencies:**
  - `┈─> jpaSessionRepository` (Dependency)
  - `┈─> ClassRepository` (Dependency)
  - `┈─> UniversityStaffRepository` (Dependency)
  - `┈─> UserRepository` (Dependency)
  - `┈─> StudentRepository` (Dependency)
  - `┈─> SessionRegistrationRepository` (Dependency)
  - `┈─> ActivityLogRepository` (Dependency)
- **Manages Entities:**
  - `──> Session` (Association - CRUD operations)
  - `──> Class` (Association - validation)
  - `──> ActivityLog` (Association - audit logging)

#### SessionRegistrationService
- **Purpose:** Session enrollment logic
- **Dependencies:**
  - `┈─> SessionRegistrationRepository` (Dependency)
  - `┈─> jpaSessionRepository` (Dependency)
  - `┈─> StudentRepository` (Dependency)
- **Manages Entities:**
  - `──> SessionEnrollment` (Association - CRUD operations)
  - `──> Session` (Association - capacity validation)
  - `──> Student` (Association - enrollment tracking)

---

### **Repositories (6)**

#### jpaSessionRepository
- **Manages Entity:**
  - `──> Session` (Association - "manages/persists" relationship)
- **Method Examples:** findByClassId(), save(), findByDateRange()

#### SessionRegistrationRepository
- **Manages Entity:**
  - `──> SessionEnrollment` (Association - "manages/persists" relationship)
- **Method Examples:** findBySessionId(), save(), existsByStudentAndSession()

#### ClassRepository (from Course Management)
- **Manages Entity:**
  - `──> Class` (Association - "manages/persists" relationship)

#### StudentRepository (from User Management)
- **Manages Entity:**
  - `──> Student` (Association - "manages/persists" relationship)

#### UniversityStaffRepository (from User Management)
- **Manages Entity:**
  - `──> UniversityStaff` (Association - "manages/persists" relationship)

#### ActivityLogRepository (from Cross-Cutting)
- **Manages Entity:**
  - `──> ActivityLog` (Association - "manages/persists" relationship)

---

### **Entity Relationships**

| From | Relationship | To | Type | Cardinality |
|------|--------------|-----|------|-------------|
| Session | Association | Class | ──> | Many:1 |
| SessionEnrollment | Association | Session | ──> | Many:1 |
| SessionEnrollment | Association | Student | ──> | Many:1 |

---

### **Complete Dependency Flow**

```
[CONTROLLER LAYER]
SessionController ┈─> SessionService ──> Session (manages)
                                      ──> Class (validates)
                                      ──> ActivityLog (logs)

SessionEnrollmentController ┈─> SessionRegistrationService ──> SessionEnrollment (manages)
                                                                ──> Session (validates capacity)
                                                                ──> Student (tracks enrollment)

[SERVICE LAYER]
SessionService ┈─> jpaSessionRepository ──> Session (CRUD)
               ┈─> ClassRepository ──> Class (validation)
               ┈─> UniversityStaffRepository ──> UniversityStaff (tutor validation)
               ┈─> ActivityLogRepository ──> ActivityLog (audit)
               ┈─> NotificationService (trigger notifications)

SessionRegistrationService ┈─> SessionRegistrationRepository ──> SessionEnrollment (CRUD)
                           ┈─> jpaSessionRepository ──> Session (capacity check)
                           ┈─> StudentRepository ──> Student (enrollment tracking)

[REPOSITORY LAYER]
jpaSessionRepository ──> Session (manages/persists)
SessionRegistrationRepository ──> SessionEnrollment (manages/persists)
ClassRepository ──> Class (manages/persists)
StudentRepository ──> Student (manages/persists)
ActivityLogRepository ──> ActivityLog (manages/persists)
```

**Integration Points:**
- `SessionService` → `NotificationService` (Trigger Notification when session created/cancelled/rescheduled)

**Legend:**
- `┈─>` = Dependency (uses/calls/injects)
- `──>` = Association with "manages/validates/tracks" semantic

---

## Sub-Diagram 4: Feedback Analytics

### **Scope:** FeedbackHandling & DataAnalytics Components

### **Entities (7)**

1. **Feedback**
   - feedbackId: Long
   - student: Student
   - course: Course
   - classEntity: Class
   - comment: String
   - imageUrl: String
   - status: String
   - createdAt, updatedAt: LocalDateTime
   - ratings: List<FeedbackRating>

2. **FeedbackRating** (composition with Feedback)
   - ratingId: Long
   - feedback: Feedback
   - question: String
   - ratingValue: Integer

3. **Evaluation** (Tutor's assessment)
   - evaluationId: Long
   - student: Student
   - course: Course
   - classEntity: Class
   - tutor: UniversityStaff
   - comment: String
   - createdAt, updatedAt: LocalDateTime
   - evaluationItems: List<EvaluationItem>

4. **EvaluationItem** (composition with Evaluation)
   - itemId: Long
   - evaluation: Evaluation
   - criterion: String
   - ratingValue: Integer
   - maxRating: Integer

5. **Student** (reference)
6. **Course** (reference)
7. **Class** (reference)

---

### **Controllers (2)**

#### FeedbackController
- **Purpose:** FeedbackHandling - student feedback submission and retrieval
- **Dependencies:**
  - `┈─> FeedbackService` (Dependency)

#### EvaluationController (if exists)
- **Purpose:** Tutor assessment submission
- **Dependencies:**
  - `┈─> EvaluationService` (Dependency)

---

### **Services (2)**

#### FeedbackService
- **Purpose:** Feedback handling and analytics
- **Dependencies:**
  - `┈─> FeedbackRepository` (Dependency)
  - `┈─> StudentRepository` (Dependency)
  - `┈─> CourseRepository` (Dependency)
  - `┈─> ClassRepository` (Dependency)
  - `┈─> CourseRegistrationRepository` (Dependency - enrollment verification)
  - `┈─> ActivityLogRepository` (Dependency)
  - `┈─> UserRepository` (Dependency)
- **Manages Entities:**
  - `──> Feedback` (Association - CRUD operations)
  - `──> FeedbackRating` (Association - composition management)
  - `──> Student` (Association - validation)
  - `──> ActivityLog` (Association - audit logging)

#### EvaluationService (if exists)
- **Purpose:** Tutor evaluation management
- **Dependencies:**
  - `┈─> EvaluationRepository` (Dependency)
  - `┈─> StudentRepository` (Dependency)
  - `┈─> CourseRepository` (Dependency)
  - `┈─> ClassRepository` (Dependency)
  - `┈─> UniversityStaffRepository` (Dependency)
- **Manages Entities:**
  - `──> Evaluation` (Association - CRUD operations)
  - `──> EvaluationItem` (Association - composition management)
  - `──> Student` (Association - evaluation target)

---

### **Repositories (7)**

#### FeedbackRepository
- **Manages Entity:**
  - `──> Feedback` (Association - "manages/persists" relationship)
  - `──> FeedbackRating` (Association - cascade persistence)
- **Method Examples:** findByStudentId(), save(), findByCourseId()

#### EvaluationRepository
- **Manages Entity:**
  - `──> Evaluation` (Association - "manages/persists" relationship)
  - `──> EvaluationItem` (Association - cascade persistence)
- **Method Examples:** findByStudentId(), save(), findByTutorId()

#### StudentRepository (from User Management)
- **Manages Entity:**
  - `──> Student` (Association - "manages/persists" relationship)

#### CourseRepository (from Course Management)
- **Manages Entity:**
  - `──> Course` (Association - "manages/persists" relationship)

#### ClassRepository (from Course Management)
- **Manages Entity:**
  - `──> Class` (Association - "manages/persists" relationship)

#### CourseRegistrationRepository (from Course Management)
- **Manages Entity:**
  - `──> CourseRegistration` (Association - "manages/persists" relationship)

#### ActivityLogRepository (from Cross-Cutting)
- **Manages Entity:**
  - `──> ActivityLog` (Association - "manages/persists" relationship)

---

### **Entity Relationships**

| From | Relationship | To | Type | Cardinality |
|------|--------------|-----|------|-------------|
| Feedback | Association | Student | ──> | Many:1 |
| Feedback | Association | Course | ──> | Many:1 |
| Feedback | Association | Class | ──> | Many:1 |
| Feedback | Composition | FeedbackRating | ◆──> | 1:Many |
| Evaluation | Association | Student | ──> | Many:1 |
| Evaluation | Association | Course | ──> | Many:1 |
| Evaluation | Association | Class | ──> | Many:1 |
| Evaluation | Association | UniversityStaff | ──> | Many:1 |
| Evaluation | Composition | EvaluationItem | ◆──> | 1:Many |

---

### **Complete Dependency Flow**

```
[CONTROLLER LAYER]
FeedbackController ┈─> FeedbackService ──> Feedback (manages)
                                          ──> FeedbackRating (composition)
                                          ──> Student (validates)
                                          ──> ActivityLog (logs)

EvaluationController ┈─> EvaluationService ──> Evaluation (manages)
                                            ──> EvaluationItem (composition)
                                            ──> Student (evaluates)

[SERVICE LAYER]
FeedbackService ┈─> FeedbackRepository ──> Feedback + FeedbackRating (cascade CRUD)
                ┈─> StudentRepository ──> Student (validation)
                ┈─> CourseRepository ──> Course (validation)
                ┈─> ClassRepository ──> Class (validation)
                ┈─> CourseRegistrationRepository (enrollment verification)
                ┈─> ActivityLogRepository ──> ActivityLog (audit)

EvaluationService ┈─> EvaluationRepository ──> Evaluation + EvaluationItem (cascade CRUD)
                  ┈─> StudentRepository ──> Student (target)
                  ┈─> CourseRepository ──> Course (context)
                  ┈─> ClassRepository ──> Class (context)
                  ┈─> UniversityStaffRepository ──> UniversityStaff (evaluator)

[REPOSITORY LAYER]
FeedbackRepository ──> Feedback (manages/persists)
                   ──> FeedbackRating (cascade persists)
EvaluationRepository ──> Evaluation (manages/persists)
                     ──> EvaluationItem (cascade persists)
StudentRepository ──> Student (manages/persists)
CourseRepository ──> Course (manages/persists)
ClassRepository ──> Class (manages/persists)
ActivityLogRepository ──> ActivityLog (manages/persists)
```

**Legend:**
- `┈─>` = Dependency (uses/calls/injects)
- `──>` = Association with "manages/validates/logs" semantic

---

## Sub-Diagram 5: Resources Management

### **Scope:** MaterialSharing & LibraryIntegration Components

### **Entities (3)**

1. **Material**
   - id: Long
   - course: Course
   - ownerId: String
   - title: String
   - description: String
   - sourceType: MaterialSourceType
   - libraryItemId: Long
   - filePath: String
   - originalName: String
   - contentType: String
   - sizeBytes: Long
   - externalUrl: String
   - createdAt, updatedAt: LocalDateTime

2. **Course** (reference)
   - courseId: Long
   - code: String
   - name: String

3. **MaterialSourceType** (enum)
   - LOCAL_FILE, LIBRARY_REF, EXTERNAL_URL

---

### **Controllers (1)**

#### MaterialController
- **Purpose:** MaterialSharing - material upload, download, linking
- **Dependencies:**
  - `┈─> MaterialService` (Dependency)

---

### **Services (1)**

#### MaterialService
- **Purpose:** Material management and library integration
- **Dependencies:**
  - `┈─> MaterialRepository` (Dependency)
  - `┈─> CourseRepository` (Dependency)
  - `┈─> LibraryClient` (Dependency - External)
- **Manages Entities:**
  - `──> Material` (Association - CRUD operations)
  - `──> Course` (Association - material ownership validation)

---

### **Repositories (2)**

#### MaterialRepository
- **Manages Entity:**
  - `──> Material` (Association - "manages/persists" relationship)
- **Method Examples:** findByCourseId(), save(), findByOwnerId()

#### CourseRepository (from Course Management)
- **Manages Entity:**
  - `──> Course` (Association - "manages/persists" relationship)

---

### **External Clients (1)**

#### LibraryClient
- **Purpose:** Integration with HCMUT_LIBRARY external system
- **Dependencies:**
  - `┈─> HCMUT_LIBRARY API` (External Dependency)
  - `┈─> LibraryItemResponse` (Dependency - DTO)

---

### **Entity Relationships**

| From | Relationship | To | Type | Cardinality |
|------|--------------|-----|------|-------------|
| Material | Association | Course | ──> | Many:1 |
| Material | Association | MaterialSourceType | ──> | Many:1 |

---

### **Complete Dependency Flow**

```
[CONTROLLER LAYER]
MaterialController ┈─> MaterialService ──> Material (manages)
                                          ──> Course (validates ownership)

[SERVICE LAYER]
MaterialService ┈─> MaterialRepository ──> Material (CRUD operations)
                ┈─> CourseRepository ──> Course (ownership validation)
                ┈─> LibraryClient ┈─> HCMUT_LIBRARY (external API)

[REPOSITORY LAYER]
MaterialRepository ──> Material (manages/persists)
CourseRepository ──> Course (manages/persists)

[EXTERNAL INTEGRATION]
LibraryClient ┈─> HCMUT_LIBRARY API (fetches library items)
              ──> LibraryItemResponse (DTO)
```

**External Integration:**
- `LibraryClient` provides **Resource Provision** interface to MaterialService
- `LibraryClient` requires **External API Consumption** interface from HCMUT_LIBRARY

**Legend:**
- `┈─>` = Dependency (uses/calls/injects)
- `──>` = Association with "manages/validates" semantic

---

## Sub-Diagram 6: Forum Component

### **Scope:** Forum Discussion Platform (Standalone Component)

### **Entities (9)**

1. **Forum**
   - forumId: Long
   - title: String
   - description: String
   - forumType: ForumType
   - subject: String
   - creator: User
   - members: List<ForumMember>
   - posts: List<ForumPost>
   - createdAt, updatedAt: LocalDateTime

2. **ForumMember** (composition with Forum)
   - memberId: Long
   - forum: Forum
   - user: User
   - joinedAt: LocalDateTime

3. **ForumPost** (composition with Forum)
   - postId: Long
   - forum: Forum
   - author: User
   - title: String
   - content: String
   - views: Integer
   - hasAcceptedAnswer: Boolean
   - tags: List<PostTag>
   - comments: List<ForumComment>
   - votes: List<ForumVote>
   - createdAt, updatedAt: LocalDateTime

4. **ForumComment** (composition with ForumPost)
   - commentId: Long
   - post: ForumPost
   - author: User
   - content: String
   - isAccepted: Boolean
   - votes: List<ForumVote>
   - createdAt, updatedAt: LocalDateTime

5. **ForumVote** (composition with ForumPost/ForumComment)
   - voteId: Long
   - user: User
   - post: ForumPost
   - comment: ForumComment
   - voteType: VoteType
   - createdAt: LocalDateTime

6. **PostTag** (composition with ForumPost)
   - tagId: Long
   - post: ForumPost
   - tagName: String

7. **User** (reference)
   - userId: Integer
   - email: String

8. **ForumType** (enum)
   - ACADEMIC, CAREER

9. **VoteType** (enum)
   - UP, DOWN

---

### **Controllers (4+)**

#### ForumController
- **Purpose:** Forum CRUD operations
- **Dependencies:**
  - `┈─> ForumService` (Dependency)

#### ForumPostController
- **Purpose:** Post creation, retrieval, management
- **Dependencies:**
  - `┈─> ForumPostService` (Dependency)

#### ForumCommentController
- **Purpose:** Comment/answer management
- **Dependencies:**
  - `┈─> ForumCommentService` (Dependency)

#### ForumVoteController
- **Purpose:** Voting mechanism
- **Dependencies:**
  - `┈─> ForumVoteService` (Dependency)

---

### **Services (4+)**

#### ForumService
- **Purpose:** Forum management
- **Dependencies:**
  - `┈─> ForumRepository` (Dependency)
  - `┈─> ForumMemberRepository` (Dependency)
  - `┈─> UserRepository` (Dependency)
- **Manages Entities:**
  - `──> Forum` (Association - CRUD operations)
  - `──> ForumMember` (Association - composition management)
  - `──> User` (Association - creator/member validation)

#### ForumPostService
- **Purpose:** Post management and search
- **Dependencies:**
  - `┈─> ForumPostRepository` (Dependency)
  - `┈─> ForumRepository` (Dependency)
  - `┈─> PostTagRepository` (Dependency)
  - `┈─> UserRepository` (Dependency)
- **Manages Entities:**
  - `──> ForumPost` (Association - CRUD operations)
  - `──> PostTag` (Association - composition management)
  - `──> Forum` (Association - post ownership validation)

#### ForumCommentService
- **Purpose:** Comment/answer management
- **Dependencies:**
  - `┈─> ForumCommentRepository` (Dependency)
  - `┈─> ForumPostRepository` (Dependency)
  - `┈─> UserRepository` (Dependency)
- **Manages Entities:**
  - `──> ForumComment` (Association - CRUD operations)
  - `──> ForumPost` (Association - comment ownership validation)

#### ForumVoteService
- **Purpose:** Voting logic (upvote/downvote)
- **Dependencies:**
  - `┈─> ForumVoteRepository` (Dependency)
  - `┈─> ForumPostRepository` (Dependency)
  - `┈─> ForumCommentRepository` (Dependency)
  - `┈─> UserRepository` (Dependency)
- **Manages Entities:**
  - `──> ForumVote` (Association - CRUD operations)
  - `──> ForumPost` (Association - vote target validation)
  - `──> ForumComment` (Association - vote target validation)

---

### **Repositories (6)**

#### ForumRepository
- **Manages Entity:**
  - `──> Forum` (Association - "manages/persists" relationship)
- **Method Examples:** findByCreatorId(), save(), findByForumType()

#### ForumMemberRepository
- **Manages Entity:**
  - `──> ForumMember` (Association - "manages/persists" relationship)
- **Method Examples:** findByForumId(), save(), existsByForumAndUser()

#### ForumPostRepository
- **Manages Entity:**
  - `──> ForumPost` (Association - "manages/persists" relationship)
- **Method Examples:** findByForumId(), save(), findByAuthorId()

#### ForumCommentRepository
- **Manages Entity:**
  - `──> ForumComment` (Association - "manages/persists" relationship)
- **Method Examples:** findByPostId(), save(), findAcceptedAnswer()

#### ForumVoteRepository
- **Manages Entity:**
  - `──> ForumVote` (Association - "manages/persists" relationship)
- **Method Examples:** findByPostId(), save(), countByPostId()

#### PostTagRepository
- **Manages Entity:**
  - `──> PostTag` (Association - "manages/persists" relationship)
- **Method Examples:** findByPostId(), save(), findByTagName()

#### UserRepository (from User Management)
- **Manages Entity:**
  - `──> User` (Association - "manages/persists" relationship)

---

### **Entity Relationships**

| From | Relationship | To | Type | Cardinality |
|------|--------------|-----|------|-------------|
| Forum | Association | User | ──> | Many:1 (creator) |
| Forum | Composition | ForumMember | ◆──> | 1:Many |
| Forum | Composition | ForumPost | ◆──> | 1:Many |
| Forum | Association | ForumType | ──> | Many:1 |
| ForumMember | Association | User | ──> | Many:1 |
| ForumPost | Association | User | ──> | Many:1 (author) |
| ForumPost | Composition | ForumComment | ◆──> | 1:Many |
| ForumPost | Composition | PostTag | ◆──> | 1:Many |
| ForumPost | Composition | ForumVote | ◆──> | 1:Many |
| ForumComment | Association | User | ──> | Many:1 (author) |
| ForumComment | Composition | ForumVote | ◆──> | 1:Many |
| ForumVote | Association | User | ──> | Many:1 (voter) |
| ForumVote | Association | VoteType | ──> | Many:1 |

---

### **Complete Dependency Flow**

```
[CONTROLLER LAYER]
ForumController ┈─> ForumService ──> Forum (manages)
                                    ──> ForumMember (composition)
                                    ──> User (validates creator/member)

ForumPostController ┈─> ForumPostService ──> ForumPost (manages)
                                              ──> PostTag (composition)
                                              ──> Forum (validates ownership)

ForumCommentController ┈─> ForumCommentService ──> ForumComment (manages)
                                                  ──> ForumPost (validates parent)

ForumVoteController ┈─> ForumVoteService ──> ForumVote (manages)
                                            ──> ForumPost (validates target)
                                            ──> ForumComment (validates target)

[SERVICE LAYER]
ForumService ┈─> ForumRepository ──> Forum (CRUD)
             ┈─> ForumMemberRepository ──> ForumMember (composition management)
             ┈─> UserRepository ──> User (creator/member lookup)

ForumPostService ┈─> ForumPostRepository ──> ForumPost (CRUD)
                 ┈─> ForumRepository ──> Forum (ownership validation)
                 ┈─> PostTagRepository ──> PostTag (tag management)
                 ┈─> UserRepository ──> User (author lookup)

ForumCommentService ┈─> ForumCommentRepository ──> ForumComment (CRUD)
                    ┈─> ForumPostRepository ──> ForumPost (parent validation)
                    ┈─> UserRepository ──> User (author lookup)

ForumVoteService ┈─> ForumVoteRepository ──> ForumVote (CRUD)
                 ┈─> ForumPostRepository ──> ForumPost (target validation)
                 ┈─> ForumCommentRepository ──> ForumComment (target validation)
                 ┈─> UserRepository ──> User (voter lookup)

[REPOSITORY LAYER]
ForumRepository ──> Forum (manages/persists)
ForumMemberRepository ──> ForumMember (manages/persists)
ForumPostRepository ──> ForumPost (manages/persists)
ForumCommentRepository ──> ForumComment (manages/persists)
ForumVoteRepository ──> ForumVote (manages/persists)
PostTagRepository ──> PostTag (manages/persists)
UserRepository ──> User (manages/persists)
```

**Interface Requirements:**
- Requires **User Data Access** interface from ProfileManagement (User Management)

**Legend:**
- `┈─>` = Dependency (uses/calls/injects)
- `──>` = Association with "manages/validates/tracks" semantic

---

## Sub-Diagram 7: Cross-Cutting Concerns

### **Scope:** Notification & Activity Logging (Shared/Support Services)

### **Entities (2)**

1. **Notification**
   - notificationId: Long
   - user: User
   - title: String
   - message: String
   - type: String
   - isRead: Boolean
   - sessionId: Long
   - classId: Long
   - createdAt: LocalDateTime
   - readAt: LocalDateTime

2. **ActivityLog**
   - logId: Long
   - userId: Integer (not FK)
   - action: String
   - entityType: String
   - entityId: Long
   - description: String
   - createdAt: LocalDateTime

---

### **Controllers (1)**

#### NotificationController (if exists)
- **Purpose:** Notification retrieval and marking as read
- **Dependencies:**
  - `┈─> NotificationService` (Dependency)

---

### **Services (1)**

#### NotificationService
- **Purpose:** Notification creation and delivery
- **Dependencies:**
  - `┈─> NotificationRepository` (Dependency)
  - `┈─> UserRepository` (Dependency)
- **Manages Entities:**
  - `──> Notification` (Association - CRUD operations)
  - `──> User` (Association - recipient validation)

---

### **Repositories (2)**

#### NotificationRepository
- **Manages Entity:**
  - `──> Notification` (Association - "manages/persists" relationship)
- **Method Examples:** findByUserId(), save(), markAsRead()

#### ActivityLogRepository
- **Manages Entity:**
  - `──> ActivityLog` (Association - "manages/persists" relationship)
- **Method Examples:** save(), findByUserId(), findByEntityType()

---

### **Entity Relationships**

| From | Relationship | To | Type | Cardinality |
|------|--------------|-----|------|-------------|
| Notification | Association | User | ──> | Many:1 |
| ActivityLog | Dependency | User | ┈─> | Many:1 (no FK) |

---

### **Complete Dependency Flow**

```
[CONTROLLER LAYER]
NotificationController ┈─> NotificationService ──> Notification (manages)
                                                  ──> User (validates recipient)

[SERVICE LAYER]
NotificationService ┈─> NotificationRepository ──> Notification (CRUD)
                    ┈─> UserRepository ──> User (recipient validation)

[REPOSITORY LAYER]
NotificationRepository ──> Notification (manages/persists)
ActivityLogRepository ──> ActivityLog (manages/persists)
UserRepository ──> User (manages/persists)

[CROSS-CUTTING USAGE]
[Various Services from other diagrams] ┈─> ActivityLogRepository ──> ActivityLog
  - SessionService (logs session operations)
  - FeedbackService (logs feedback submission)
  - CourseRegistrationService (logs enrollment actions)

[Various Services from other diagrams] ┈─> NotificationService ──> Notification
  - SessionService (notifies session changes)
  - Other services needing user notifications
```

**Usage Pattern:**
- **ActivityLog** is used by multiple services for audit trail:
  - `SessionService` logs session creation/cancellation
  - `FeedbackService` logs feedback submission
  - `CourseRegistrationService` logs enrollment actions

- **NotificationService** is called by:
  - `SessionService` (trigger notification when session created/cancelled)
  - Other services that need to notify users

**Legend:**
- `┈─>` = Dependency (uses/calls/injects)
- `──>` = Association with "manages/logs/notifies" semantic

---

## Cross-Diagram Dependencies

### **Shared Entities Referenced Across Diagrams**

| Entity | Primary Diagram | Referenced By |
|--------|----------------|---------------|
| **User** | User Management | Forum, Notification, ActivityLog |
| **Student** | User Management | Course Management, Session Management, Feedback |
| **UniversityStaff** | User Management | Course Management, Evaluation |
| **Department** | User Management | Course Management |
| **Course** | Course Management | Session Management (via Class), Feedback, Resources |
| **Class** | Course Management | Session Management, Feedback |

---

### **Cross-Component Service Dependencies**

| Service | Depends On (Other Diagrams) |
|---------|------------------------------|
| `ClassService` | `UserProfilePersistenceService` (User Management) |
| `SessionService` | `NotificationService` (Cross-Cutting) |
| `SessionService` | `ActivityLogRepository` (Cross-Cutting) |
| `FeedbackService` | `ActivityLogRepository` (Cross-Cutting) |
| `CourseRegistrationService` | `ActivityLogRepository` (Cross-Cutting) |

---

## Summary Statistics

| Sub-Diagram | Entities | Controllers | Services | Repositories | Mappers | Total Classes |
|-------------|----------|-------------|----------|--------------|---------|---------------|
| 1. User Management | 6 | 4 | 4 | 4 | 2 | 20 |
| 2. Course & Class | 5 | 3 | 3 | 5 | 1 | 17 |
| 3. Session Management | 4 | 2 | 2 | 6 | 0 | 14 |
| 4. Feedback Analytics | 7 | 2 | 2 | 7 | 0 | 18 |
| 5. Resources | 3 | 1 | 1 | 2 | 0 | 7 (+1 client) |
| 6. Forum | 9 | 4 | 4 | 7 | 0 | 24 |
| 7. Cross-Cutting | 2 | 1 | 1 | 2 | 0 | 6 |
| **TOTAL** | **36** | **17** | **17** | **33** | **3** | **106** |

---

## UML Relationship Legend

### **Dependency (┈─>)**
**Usage:** "Uses" or "Depends on" relationship - temporary, no ownership

**Examples:**
- `Controller ┈─> Service` - Controller uses Service methods
- `Service ┈─> Repository` - Service calls Repository methods
- `Service ┈─> ExternalClient` - Service uses external API client
- `Mapper ┈─> Entity` - Mapper uses Entity as source/target type

**In Class Diagram:** Draw as dashed arrow (┈─>)

---

### **Association (──>)**
**Usage:** "Manages" or "Has relationship with" - persistent business relationship

**Examples:**
- `Repository ──> Entity` - Repository manages Entity persistence
- `Service ──> Entity` - Service manages Entity business logic
- `Entity ──> Entity` - Domain model relationship (Student ──> Department)
- `Entity ──> Enum` - Entity has enum attribute (User ──> UserType)

**Semantic Labels:**
- Repository → Entity: **"manages/persists"**
- Service → Entity: **"manages/creates/validates"**
- Entity → Entity: **Domain-specific** (e.g., "belongs to", "enrolled in")

**In Class Diagram:** Draw as solid arrow (──>) with label

---

### **Composition (◆──>)**
**Usage:** Strong "part-of" relationship - child cannot exist without parent

**Examples:**
- `Feedback ◆──> FeedbackRating` - Rating cannot exist without Feedback
- `Forum ◆──> ForumPost` - Post cannot exist without Forum
- `User ◆──> Student` - Student identity is part of User

**In Class Diagram:** Draw as solid line with filled diamond (◆──>)

**Note:** Repository manages both parent and children through cascade operations

---

### **How to Draw Complete Architecture Flow**

For each subsystem, show **three layers of relationships**:

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: Technical Dependencies (┈─>)                       │
│                                                              │
│ Controller ┈─> Service ┈─> Repository                       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ LAYER 2: Business Associations (──>)                        │
│                                                              │
│ Service ──> Entity (manages/creates/validates)              │
│ Repository ──> Entity (manages/persists)                    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ LAYER 3: Domain Model Relationships (──>, ◆──>)            │
│                                                              │
│ Entity ──> Entity (association)                             │
│ Entity ◆──> Entity (composition)                            │
│ Entity ──> Enum (enumeration)                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Example: Student Management**

```
StudentController ┈─> UserService ┈─> StudentRepository ──> Student
                                                            (manages)
                                   
UserService ──> Student (manages CRUD operations)
UserService ──> User (manages parent entity)

Student ◆──> User (composition - Student is part of User)
Student ──> Department (association - belongs to)
```

---

## Diagram Layout Recommendations

### **Page 1: User Management** (Complex)
- Layout: Vertical layers (Controller → Service → Repository → Entity)
- Highlight: User ◆─> Student/Staff composition
- Include: Enums (UserType, UserStatus)

### **Page 2: Course & Class Management** (Complex)
- Layout: Horizontal grouping (Catalog left, Enrollment right)
- Highlight: Department → Course → Class → Registration flow

### **Page 3: Session Management** (Medium)
- Layout: Two columns (Scheduling left, Participation right)
- Highlight: Session → Class relationship

### **Page 4: Feedback Analytics** (Medium)
- Layout: Two sections (Feedback top, Evaluation bottom)
- Highlight: Composition relationships (Feedback ◆─> Rating, Evaluation ◆─> Item)

### **Page 5: Resources Management** (Simple)
- Layout: Linear flow (Controller → Service → Repository → Entity)
- Highlight: External LibraryClient integration

### **Page 6: Forum Component** (Complex - Full Page)
- Layout: Hierarchical tree (Forum at top, branching to Members/Posts/Comments/Votes)
- Highlight: Multiple composition relationships

### **Page 7: Cross-Cutting Concerns** (Simple)
- Layout: Can combine with another simple diagram if needed
- Highlight: Notification and ActivityLog as supporting services

---

**Document Version:** 1.0  
**Last Updated:** November 29, 2025  
**Total Classes:** 106 (Entities, Controllers, Services, Repositories, Mappers, Enums)  
**Total Sub-Diagrams:** 7
