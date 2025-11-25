# Component Interface Analysis Report
## HCMUT Tutoring Support System (TSS)

**Analysis Date:** November 25, 2025  
**Objective:** Verify component integrity, coupling, and architectural compliance based on UML Component Diagram

---

## Executive Summary

The HCMUT TSS follows a **microservices architecture** with clear separation of concerns across 4 main subsystems:
1. **User Management** (Authentication & Profile)
2. **Session Management** (Scheduling & Participation)
3. **Course and Class Management** (Enrollment & Catalog)
4. **Feedback Analytics** & **Resources Management**
5. **External Systems** (SSO, Datacore, Library)

**Overall Assessment:**
- ✅ **Strong separation of concerns** at subsystem level
- ✅ **Well-defined REST API contracts**
- ⚠️ **Moderate coupling** between components (acceptable for monolithic backend deployment)
- ⚠️ **Missing service interfaces** - components communicate directly via service classes (tight coupling)
- ❌ **Incomplete external integrations** (Library client exists but no reverse dependency defined)

---

## Subsystem 1: User Management

### Component 1.1: Authentication (HCMUT-SSO-MIMIC)

**Provided Interfaces:**
```java
// REST Endpoints
GET  /                          → Redirect to home
GET  /login                     → Login form (Thymeleaf template)
POST /login                     → Form authentication
GET  /oauth2/authorize          → OAuth2 authorization endpoint (Spring Security)
POST /oauth2/token              → Token endpoint (Spring Security)
GET  /.well-known/openid-configuration → OIDC discovery
GET  /.well-known/jwks.json     → JWT signing keys
```

**Required Interfaces:**
- `JsonUserDetailsService` (Internal: loads users from users.json)
- `PasswordEncoder` (BCrypt - Internal)
- `RsaKeyProperties` (JWT signing keys - Internal)

**Structural Relationships:**
- **Provides authentication to:** HCMUT-TSS-Backend (OAuth2 Client)
- **Consumed by:** All TSS Backend components requiring authentication
- **Type:** OAuth2/OIDC Authorization Server

**Design Assessment:**

| Metric | Rating | Comments |
|--------|--------|----------|
| **Coupling** | ✅ Low | Excellent - stateless OAuth2 server, only JWT dependency |
| **Cohesion** | ✅ High | Single responsibility: authentication & token issuance |
| **Missing Elements** | ⚠️ Medium | - User registration endpoint missing<br>- Password reset flow not implemented<br>- MFA/2FA not present<br>- No user profile management API |

**Recommendations:**
1. Add `/register` endpoint for self-service user creation
2. Implement password reset flow (`/forgot-password`, `/reset-password`)
3. Consider adding refresh token rotation for security
4. Add OAuth2 consent screen for explicit user approval


---

### Component 1.2: Profile Management (Part of HCMUT-TSS-Backend)

**Provided Interfaces:**
```java
// AuthController
GET /auth/me → ToFEUserDto (authenticated user profile)

// UserController (inferred from entity structure)
// Note: Full implementation not visible in current codebase scan
```

**Required Interfaces:**
- `ToFEUserMapper` (DTOs transformation)
- `TssUserPrincipal` (Spring Security principal)
- `UserRepository` (Data access)
- `StudentRepository`, `UniversityStaffRepository` (Role-specific data)
- `UserProfilePersistenceService` (User synchronization from Datacore)

**Structural Relationships:**
- **Depends on:** HCMUT-DATACORE-MIMIC (external user data source)
- **Depends on:** Authentication component (TssUserPrincipal)
- **Provides data to:** All business logic components requiring user context

**Design Assessment:**

| Metric | Rating | Comments |
|--------|--------|----------|
| **Coupling** | ⚠️ Medium | Tightly coupled to OAuth2Principal and Datacore client |
| **Cohesion** | ✅ High | Focused on user profile retrieval and persistence |
| **Missing Elements** | ❌ Critical | - No profile update endpoints (PUT/PATCH /api/users/{id})<br>- No user search/listing API<br>- No role management interface<br>- Avatar/photo upload missing |

**Recommendations:**
1. **Critical:** Add user profile CRUD endpoints
2. Implement user search API for admin/tutor features (e.g., assigning tutors to classes)
3. Add profile picture upload functionality
4. Create user preferences/settings management


---

## Subsystem 2: External Systems Integration

### Component 2.1: HCMUT_DATACORE (External)

**Provided Interfaces:**
```java
// DatacoreController
GET /users/by-email/{email} → ToTssUserDto
GET /courses/{courseCode}/eligible?email={email} → Eligibility check response
```

**Required Interfaces:**
- `DatacoreService` (Internal business logic)
- `ToTssUserMapper` (DTO transformation)
- In-memory user database (CustomUser, Student, UniversityStaff models)

**Structural Relationships:**
- **Provides master data to:** TSS Backend (User profiles, course prerequisites)
- **Type:** External system simulation (acts as university's central database)
- **Authentication:** API Key-based (ApiKeyAuthFilter)

**Design Assessment:**

| Metric | Rating | Comments |
|--------|--------|----------|
| **Coupling** | ✅ Low | Well-isolated external service simulation |
| **Cohesion** | ✅ High | Focused on master data provision |
| **Missing Elements** | ⚠️ Medium | - Bulk user sync API missing<br>- Course catalog endpoints incomplete<br>- Department/organizational structure API missing |

**Recommendations:**
1. Add batch user retrieval endpoint for efficiency
2. Implement course catalog listing API
3. Add department/faculty hierarchy endpoints


---

### Component 2.2: HCMUT_LIBRARY (External)

**Provided Interfaces:**
```java
// LibraryController
GET  /api/library/items?query={q}&courseCode={code}&tag={tag} → List<LibraryItemResponse>
GET  /api/library/items/{id} → LibraryItemResponse
POST /api/library/items (multipart/form-data) → LibraryItemResponse (file upload)
GET  /api/library/items/{id}/download → File download
```

**Required Interfaces:**
- `LibraryService` (Business logic)
- `LibraryItemRepository` (JPA repository)
- File storage system (local filesystem)
- Flyway migrations (V1__create_library_items_table.sql)

**Structural Relationships:**
- **Provides resources to:** TSS Backend MaterialSharing component
- **Consumed by:** LibraryClient in TSS Backend
- **Type:** Standalone microservice (separate database)

**Design Assessment:**

| Metric | Rating | Comments |
|--------|--------|----------|
| **Coupling** | ✅ Low | Excellent - RESTful API, no shared database |
| **Cohesion** | ✅ High | Single responsibility: library resource management |
| **Missing Elements** | ⚠️ Medium | - Authentication/authorization not implemented (TODO comment in code)<br>- No resource deletion endpoint<br>- No versioning for library items<br>- No checkout/borrowing workflow |

**Recommendations:**
1. **Critical:** Implement security (integrate with SSO or API key)
2. Add DELETE endpoint for library items
3. Implement resource versioning for educational materials
4. Consider adding borrowing/reservation system if physical resources exist


---

## Subsystem 3: Session Management

### Component 3.1: Scheduling (SessionController + SessionService)

**Provided Interfaces:**
```java
// SessionController
POST   /api/sessions                     → Create session (STAFF only)
PATCH  /api/sessions/cancelSession       → Cancel session (STAFF only)
PATCH  /api/sessions                     → Reschedule session (STAFF only)
GET    /api/sessions                     → List sessions
GET    /api/sessions/{id}                → Get session details
DELETE /api/sessions/{id}                → Delete session (STAFF only)
GET    /api/classes/{classId}/sessions   → List sessions by class
```

**Required Interfaces:**
- `jpaSessionRepository` (Session persistence)
- `ClassRepository` (Class lookup for session creation)
- `UniversityStaffRepository` (Tutor verification)
- `UserProfilePersistenceService` (User synchronization)
- `UserRepository` (User lookup)
- `StudentRepository` (Student verification)
- `SessionRegistrationRepository` (Enrollment tracking)
- `ActivityLogRepository` (Audit logging)

**Structural Relationships:**
- **Depends on:** User Management (authentication, profile)
- **Depends on:** Course and Class Management (class validation)
- **Provides data to:** SessionParticipation component
- **Logged by:** ActivityLog (audit trail)

**Design Assessment:**

| Metric | Rating | Comments |
|--------|--------|----------|
| **Coupling** | ❌ High | Depends on 8 different repositories - violation of single responsibility |
| **Cohesion** | ⚠️ Medium | Mixes session lifecycle with enrollment logic |
| **Missing Elements** | ⚠️ Medium | - No recurring session creation (weekly/daily patterns)<br>- No capacity overflow handling<br>- No waitlist functionality<br>- No session attendance tracking API |

**Recommendations:**
1. **Critical:** Refactor to separate SessionService and SessionEnrollmentService
2. Extract enrollment logic to dedicated component
3. Add bulk session creation for recurring schedules
4. Implement waitlist when session is full
5. Add attendance marking API (check-in/check-out)


---

### Component 3.2: SessionParticipation (SessionEnrollmentController + Service)

**Provided Interfaces:**
```java
// SessionEnrollmentController (inferred from repository structure)
// Note: Controller implementation not fully visible in scan
POST   /api/sessions/{sessionId}/enroll   → Enroll student
DELETE /api/sessions/{sessionId}/enroll   → Withdraw from session
GET    /api/sessions/{sessionId}/students → List enrolled students
```

**Required Interfaces:**
- `SessionRegistrationRepository` (Enrollment persistence)
- `jpaSessionRepository` (Session lookup)
- `StudentRepository` (Student validation)
- `UserRepository` (User context)

**Structural Relationships:**
- **Depends on:** Scheduling component (session validation)
- **Depends on:** User Management (student identification)
- **Type:** Enrollment management

**Design Assessment:**

| Metric | Rating | Comments |
|--------|--------|----------|
| **Coupling** | ⚠️ Medium | Coupled to Session and Student entities |
| **Cohesion** | ✅ High | Focused on enrollment operations |
| **Missing Elements** | ❌ Critical | - No enrollment validation (prerequisites, capacity)<br>- No notification on enrollment/cancellation<br>- Missing enrollment history API |

**Recommendations:**
1. **Critical:** Add enrollment validation logic (check capacity before enrolling)
2. Implement notification service integration
3. Add enrollment history endpoint for students
4. Add bulk enrollment API for administrators


---

## Subsystem 4: Course and Class Management

### Component 4.1: Enrollment (CourseRegistrationController + Service)

**Provided Interfaces:**
```java
// CourseRegistrationController
POST   /api/course-registrations          → Register for course
DELETE /api/course-registrations/{id}     → Drop course
GET    /api/course-registrations          → List user's registrations
GET    /api/course-registrations/student/{studentId} → Get by student
```

**Required Interfaces:**
- `CourseRegistrationRepository` (Registration persistence)
- `ClassRepository` (Class validation)
- `StudentRepository` (Student lookup)
- `UserRepository` (User context)
- `DatacoreClient` (inferred - prerequisite checking)

**Structural Relationships:**
- **Depends on:** CoursesCatalog (course/class validation)
- **Depends on:** HCMUT_DATACORE (prerequisite verification)
- **Depends on:** User Management (student identification)
- **Provides data to:** Feedback component

**Design Assessment:**

| Metric | Rating | Comments |
|--------|--------|----------|
| **Coupling** | ⚠️ Medium | Coupled to multiple repositories and external Datacore |
| **Cohesion** | ✅ High | Focused on course enrollment operations |
| **Missing Elements** | ❌ Critical | - No enrollment period validation (add/drop deadlines)<br>- No waitlist when class is full<br>- No prerequisite enforcement visible in code |

**Recommendations:**
1. **Critical:** Implement prerequisite validation (call Datacore before registration)
2. Add enrollment period checks (registration windows)
3. Implement waitlist functionality
4. Add enrollment approval workflow for restricted courses


---

### Component 4.2: CoursesCatalog (CourseController + ClassController)

**Provided Interfaces:**
```java
// CourseController
POST GET  /api/courses                    → List all courses
GET  /api/courses?q={query}              → Search courses
GET  /api/courses/{code}                 → Get course by code
POST /api/courses                        → Create course

// ClassController
POST   /api/classes                      → Create class (STAFF only)
GET    /api/classes                      → List all classes
GET    /api/classes/{id}                 → Get class details
DELETE /api/classes/{id}                 → Delete class (STAFF only)
PATCH  /api/classes/{id}                 → Update class (STAFF only)
GET    /api/classes/course/{courseId}    → List classes by course
```

**Required Interfaces:**
- `CourseRepository` (Course persistence)
- `ClassRepository` (Class persistence)
- `CourseService` (Course business logic)
- `ClassService` (Class business logic)
- `UniversityStaffRepository` (Tutor assignment validation)
- `UserRepository` (User context)

**Structural Relationships:**
- **Depends on:** User Management (tutor assignment)
- **Provides data to:** Enrollment, Scheduling, Materials components
- **Type:** Master data management

**Design Assessment:**

| Metric | Rating | Comments |
|--------|--------|----------|
| **Coupling** | ⚠️ Medium | Repository dependencies acceptable for data layer |
| **Cohesion** | ✅ High | Focused on course/class CRUD operations |
| **Missing Elements** | ⚠️ Medium | - No course versioning (curriculum changes)<br>- No class capacity management enforcement<br>- No class schedule conflict detection<br>- No course prerequisite management UI |

**Recommendations:**
1. Add course version tracking for curriculum changes
2. Implement class capacity validation in ClassService
3. Add schedule conflict detection when creating classes
4. Create course prerequisite management endpoints


---

## Subsystem 5: Feedback Analytics

### Component 5.1: FeedbackHandling (FeedbackController + Service)

**Provided Interfaces:**
```java
// FeedbackController
GET  /api/feedback/enrolled-courses              → List student's enrolled courses
POST /api/feedback/submit                        → Submit feedback
GET  /api/feedback/course/{courseId}             → Get feedback for course
GET  /api/feedback/class/{classId}               → Get feedback for class
GET  /api/feedback/tutor/{tutorId}               → Get feedback for tutor
```

**Required Interfaces:**
- `FeedbackRepository` (Feedback persistence)
- `StudentRepository` (Student validation)
- `CourseRepository` (Course lookup)
- `ClassRepository` (Class lookup)
- `CourseRegistrationRepository` (Enrollment verification)
- `ActivityLogRepository` (Audit logging)
- `UserRepository` (User context)

**Structural Relationships:**
- **Depends on:** Enrollment component (verifying student enrollment)
- **Depends on:** CoursesCatalog (course/class validation)
- **Depends on:** User Management (user identification)
- **Provides data to:** DataAnalytics component

**Design Assessment:**

| Metric | Rating | Comments |
|--------|--------|----------|
| **Coupling** | ❌ High | Depends on 7 repositories - too many dependencies |
| **Cohesion** | ⚠️ Medium | Mixes feedback submission with enrollment queries |
| **Missing Elements** | ❌ Critical | - No anonymization logic visible<br>- No feedback editing/deletion<br>- No feedback approval workflow<br>- No feedback response from tutors |

**Recommendations:**
1. **Critical:** Extract enrollment query to separate service
2. Implement feedback anonymization before storage
3. Add feedback moderation workflow (approve/reject)
4. Allow tutors to respond to feedback
5. Add feedback editing window (24-48 hours)


---

### Component 5.2: DataAnalytics (Missing Implementation)

**Provided Interfaces:**
```
❌ NOT IMPLEMENTED
Expected:
GET /api/analytics/feedback/summary?courseId={id}
GET /api/analytics/feedback/trends?tutorId={id}&period={months}
GET /api/analytics/sessions/attendance?classId={id}
```

**Required Interfaces:**
- FeedbackRepository (aggregate queries)
- SessionRegistrationRepository (attendance data)
- Statistical calculation library (e.g., Apache Commons Math)

**Structural Relationships:**
- **Depends on:** FeedbackHandling (raw feedback data)
- **Depends on:** SessionParticipation (attendance data)
- **Type:** Analytical reporting component

**Design Assessment:**

| Metric | Rating | Comments |
|--------|--------|----------|
| **Coupling** | ⚠️ N/A | Component not implemented |
| **Cohesion** | ⚠️ N/A | Component not implemented |
| **Missing Elements** | ❌ Critical | **ENTIRE COMPONENT MISSING**<br>- No analytics endpoints<br>- No data aggregation logic<br>- No reporting dashboard API<br>- No trend analysis |

**Recommendations:**
1. **Critical:** Implement DataAnalytics component as shown in UML diagram
2. Add feedback summary statistics API
3. Implement trend analysis for course/tutor performance
4. Add session attendance analytics
5. Create dashboard endpoints for administrators


---

## Subsystem 6: Resources Management

### Component 6.1: MaterialSharing (MaterialController + Service)

**Provided Interfaces:**
```java
// MaterialController
GET    /api/courses/{courseId}/materials              → List materials for course
POST   /api/courses/{courseId}/materials/add-external → Add external URL
POST   /api/courses/{courseId}/materials/upload       → Upload file
GET    /api/materials/{id}/download                   → Download file
DELETE /api/materials/{id}                            → Delete material
```

**Required Interfaces:**
- `MaterialRepository` (Material persistence)
- `CourseRepository` (Course validation)
- `LibraryClient` (External library integration)
- File storage system (local filesystem: `uploads/materials`)

**Structural Relationships:**
- **Depends on:** CoursesCatalog (course validation)
- **Depends on:** HCMUT_LIBRARY (external resource integration)
- **Depends on:** User Management (authorization)
- **Type:** Resource management with hybrid storage

**Design Assessment:**

| Metric | Rating | Comments |
|--------|--------|----------|
| **Coupling** | ✅ Low | Well-isolated, clear dependencies |
| **Cohesion** | ✅ High | Focused on material CRUD and file handling |
| **Missing Elements** | ⚠️ Medium | - No file versioning<br>- No file type validation<br>- No virus scanning<br>- No storage quota management<br>- No material categorization/tagging |

**Recommendations:**
1. Add file type whitelist validation (prevent executable uploads)
2. Implement virus scanning integration (e.g., ClamAV)
3. Add storage quota per course/tutor
4. Implement file versioning (keep history)
5. Add tagging/categorization for materials


---

### Component 6.2: LibraryIntegration (LibraryClient)

**Provided Interfaces:**
```java
// LibraryClient (Internal service, not REST endpoint)
List<LibraryItemResponse> searchItems(String query, String courseCode)
LibraryItemResponse getItem(Long id)
```

**Required Interfaces:**
- WebClient (Spring WebFlux - HTTP client)
- `${library.base-url}` configuration property

**Structural Relationships:**
- **Depends on:** HCMUT_LIBRARY external service
- **Type:** Client adapter/proxy pattern
- **Consumes:** Library REST API

**Design Assessment:**

| Metric | Rating | Comments |
|--------|--------|----------|
| **Coupling** | ⚠️ Medium | Synchronous blocking calls (`.blockOptional()`) |
| **Cohesion** | ✅ High | Focused on library API integration |
| **Missing Elements** | ⚠️ Medium | - No circuit breaker (resilience4j)<br>- No caching layer<br>- No retry logic<br>- No fallback mechanism |

**Recommendations:**
1. **Critical:** Add circuit breaker pattern for resilience
2. Implement caching for frequently accessed items
3. Add retry logic with exponential backoff
4. Switch to async non-blocking calls for better performance
5. Add health check endpoint for library service status


---

## Cross-Cutting Concerns Analysis

### Security Architecture

**Components:**
- `SecurityConfig` (TSS Backend) - OAuth2 Client + Resource Server
- `SecurityConfig` (SSO) - OAuth2 Authorization Server
- `TssUserOAuth2UserService` - Custom user loading
- `OidcLogoutSuccessHandler` - Logout handling

**Assessment:**

| Aspect | Status | Notes |
|--------|--------|-------|
| Authentication | ✅ Good | OAuth2/OIDC properly implemented |
| Authorization | ⚠️ Partial | Role-based (@PreAuthorize), but incomplete coverage |
| API Security | ❌ Weak | - Library service has no auth (TODO in code)<br>- Datacore uses simple API key |
| CORS | ✅ Good | Configured for frontend URL |
| CSRF | ✅ Good | Enabled for form login |

**Recommendations:**
1. Complete authorization annotations on all endpoints
2. Implement API Gateway pattern for unified security
3. Add OAuth2 scopes for fine-grained permissions
4. Implement rate limiting to prevent abuse


---

### Data Persistence Layer

**Repository Pattern:** Standard Spring Data JPA

**Components:**
- 12 JPA Repositories in TSS Backend
- 1 JPA Repository in Library service
- In-memory storage in Datacore (simulation)

**Assessment:**

| Aspect | Status | Notes |
|--------|--------|-------|
| Coupling | ⚠️ Medium | Services directly inject multiple repositories |
| Cohesion | ✅ High | Each repository focused on single entity |
| Transactions | ✅ Good | @Transactional used appropriately |
| Database per Service | ✅ Good | Library has separate DB, TSS has main DB |

**Recommendations:**
1. Consider adding Repository Facade pattern to reduce direct repository coupling
2. Add database migration versioning documentation
3. Implement soft delete for audit trail
4. Add created_by/updated_by audit columns


---

### Service Layer Architecture

**Pattern:** Transaction Script (services directly called by controllers)

**Issues Identified:**
1. **No Service Interfaces** - Controllers depend on concrete service classes
2. **High Repository Coupling** - Services inject 5-8 repositories directly
3. **Mixed Concerns** - SessionService handles both session and enrollment logic

**Recommendations:**
1. Extract service interfaces for dependency inversion
2. Implement Facade pattern to reduce repository dependencies
3. Split large services (SessionService → SessionService + EnrollmentService)
4. Add DTO validation layer before service calls


---

## Architecture Violations & Technical Debt

### Critical Issues

| Issue | Severity | Impact | Recommendation |
|-------|----------|--------|----------------|
| **DataAnalytics component missing** | ❌ Critical | UML diagram shows component but no implementation exists | Implement analytics module as designed |
| **No service layer interfaces** | ❌ High | Tight coupling, hard to test/mock | Extract interfaces for all services |
| **SessionService God Object** | ❌ High | 441 lines, 8 repository dependencies | Refactor into smaller services |
| **No API versioning** | ⚠️ Medium | Breaking changes will affect all clients | Add `/api/v1/` prefix |
| **Library service no auth** | ❌ Critical | Security vulnerability | Implement authentication |
| **No circuit breakers** | ⚠️ Medium | Cascading failures possible | Add resilience4j |

### Design Improvements

1. **Introduce API Gateway:**
   - Centralized routing
   - Unified authentication
   - Rate limiting
   - Request/response logging

2. **Event-Driven Architecture:**
   - Publish events for enrollment, feedback submission
   - Decouple notification system
   - Enable audit logging via event sourcing

3. **CQRS Pattern for Analytics:**
   - Separate read models for reporting
   - Improve query performance
   - Enable complex aggregations

4. **Domain-Driven Design:**
   - Define bounded contexts clearly
   - Reduce cross-context coupling
   - Improve domain model expressiveness


---

## Component Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                    External Systems                         │
├─────────────────────────────────────────────────────────────┤
│  HCMUT-SSO ──provides auth──> TSS-Backend                  │
│  HCMUT-DATACORE ──provides users──> TSS-Backend            │
│  HCMUT-LIBRARY <──consumes─── TSS-Backend                  │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   TSS Backend Components                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AuthController ──uses──> ToFEUserMapper                   │
│       │                                                     │
│       └──depends──> TssUserPrincipal (from SSO)            │
│                                                             │
│  SessionController ──uses──> SessionService                │
│       │                           ├──uses──> SessionRepository
│       │                           ├──uses──> ClassRepository
│       │                           ├──uses──> StaffRepository
│       │                           ├──uses──> UserRepository
│       │                           ├──uses──> StudentRepository
│       │                           ├──uses──> SessionRegistrationRepo
│       │                           ├──uses──> ActivityLogRepo
│       │                           └──uses──> UserProfilePersistenceService
│       │                                                     │
│  CourseController ──uses──> CourseService                  │
│  ClassController ──uses──> ClassService                    │
│       │                                                     │
│  FeedbackController ──uses──> FeedbackService              │
│       │                           ├──uses──> FeedbackRepository
│       │                           ├──uses──> StudentRepository
│       │                           ├──uses──> CourseRepository
│       │                           ├──uses──> ClassRepository
│       │                           ├──uses──> CourseRegistrationRepo
│       │                           ├──uses──> ActivityLogRepo
│       │                           └──uses──> UserRepository
│       │                                                     │
│  MaterialController ──uses──> MaterialService              │
│                                    ├──uses──> MaterialRepository
│                                    ├──uses──> CourseRepository
│                                    └──uses──> LibraryClient
│                                                  │
│                                                  └──calls──> HCMUT-LIBRARY
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Legend:**
- `──uses──>` Dependency relationship
- `──provides──>` Service provision
- `──consumes──>` Service consumption

---

## Quality Metrics Summary

| Subsystem | Avg Coupling | Avg Cohesion | Completeness | Overall |
|-----------|--------------|--------------|--------------|---------|
| User Management | ⚠️ Medium | ✅ High | ⚠️ 70% | ⚠️ Good |
| External Systems | ✅ Low | ✅ High | ⚠️ 75% | ✅ Very Good |
| Session Management | ❌ High | ⚠️ Medium | ⚠️ 80% | ⚠️ Fair |
| Course & Class Mgmt | ⚠️ Medium | ✅ High | ✅ 90% | ✅ Good |
| Feedback Analytics | ❌ High | ⚠️ Medium | ❌ 50% | ❌ Poor |
| Resources Mgmt | ✅ Low | ✅ High | ✅ 85% | ✅ Very Good |

**Overall System Assessment:** ⚠️ **Good foundation with critical gaps**

---

## Priority Recommendations

### Must Fix (P0 - Before Production)

1. ✅ **Implement DataAnalytics component** - Required by UML, missing entirely
2. ✅ **Add authentication to Library service** - Security vulnerability
3. ✅ **Refactor SessionService** - God object anti-pattern
4. ✅ **Implement prerequisite validation** - Business rule enforcement
5. ✅ **Add circuit breakers** - Resilience for external calls

### Should Fix (P1 - Next Sprint)

6. ⚠️ Extract service interfaces - Improve testability
7. ⚠️ Add API versioning - Future-proof breaking changes
8. ⚠️ Implement enrollment validation - Capacity, deadlines
9. ⚠️ Add user profile CRUD - Missing critical functionality
10. ⚠️ Implement feedback anonymization - Privacy requirement

### Nice to Have (P2 - Backlog)

11. 🔵 Add event-driven architecture
12. 🔵 Implement CQRS for analytics
13. 🔵 Add file versioning for materials
14. 🔵 Implement waitlist functionality
15. 🔵 Add API Gateway pattern

---

## Conclusion

The HCMUT TSS demonstrates a **solid architectural foundation** with clear separation of concerns at the subsystem level. The microservices approach (SSO, Datacore, Library) shows good design thinking. However, the system suffers from:

1. **Missing critical components** (DataAnalytics)
2. **High coupling in services** (too many repository dependencies)
3. **Incomplete security** (Library service, no API gateway)
4. **Lack of resilience patterns** (no circuit breakers, retries)

The codebase follows **Spring Boot best practices** for REST API development but would benefit from more advanced architectural patterns (DDD, CQRS, Event Sourcing) as it scales.

**Recommended Next Steps:**
1. Complete missing components per UML diagram
2. Refactor high-coupling services
3. Add security hardening across all services
4. Implement observability (metrics, tracing, logging)
5. Add comprehensive integration tests

---

**Report Generated By:** GitHub Copilot AI Code Analysis  
**Codebase Version:** Main branch (November 25, 2025)  
**Analysis Scope:** Complete component interface review per UML Component Diagram
