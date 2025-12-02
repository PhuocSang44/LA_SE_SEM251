# ENTITY ATTRIBUTES REFERENCE

## User

- userId: Integer
- email: String
- firstName: String
- middleName: String
- lastName: String
- userType: UserType
- status: UserStatus

---

## Student

- userId: Integer
- user: User
- studentId: String
- department: Department
- major: String
- academicLevel: String

---

## UniversityStaff

- userId: Integer
- user: User
- staffId: String
- department: Department
- position: String
- role: String

---

## Department

- departmentId: Integer
- departmentName: String

---

## Course

- courseId: Long
- code: String
- name: String
- description: String
- departmentName: String
- department: Department

---

## Class

- classId: Long
- course: Course
- semester: String
- tutor: UniversityStaff
- createdAt: LocalDateTime
- status: String
- capacity: Integer
- customName: String
- enrolledCount: Integer

---

## Session

- sessionId: Long
- clazz: Class
- title: String
- startTime: LocalDateTime
- endTime: LocalDateTime
- description: String
- location: String
- sessionType: String
- maxStudents: Integer
- currentStudents: Integer
- status: String
- createdAt: LocalDateTime

---

## SessionEnrollment

- enrollmentId: Long
- session: Session
- student: Student
- enrollmentDate: LocalDateTime
- status: String

---

## CourseRegistration

- registrationId: Long
- student: Student
- classEntity: Class
- course: Course
- registeredAt: Instant

---

## Feedback

- feedbackId: Long
- student: Student
- course: Course
- classEntity: Class
- comment: String
- imageUrl: String
- status: String
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
- ratings: List<FeedbackRating>

---

## FeedbackRating

- ratingId: Long
- feedback: Feedback
- question: String
- ratingValue: Integer

---

## Material

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
- createdAt: LocalDateTime
- updatedAt: LocalDateTime

---

## ActivityLog

- logId: Long
- userId: Integer
- action: String
- entityType: String
- entityId: Long
- description: String
- createdAt: LocalDateTime

---

## Forum

- forumId: Long
- title: String
- description: String
- forumType: ForumType
- subject: String
- creator: User
- members: List<ForumMember>
- posts: List<ForumPost>
- createdAt: LocalDateTime
- updatedAt: LocalDateTime

---

## ForumPost

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
- createdAt: LocalDateTime
- updatedAt: LocalDateTime

---

## ForumComment

- commentId: Long
- post: ForumPost
- author: User
- content: String
- isAccepted: Boolean
- votes: List<ForumVote>
- createdAt: LocalDateTime
- updatedAt: LocalDateTime

---

## ForumMember

- memberId: Long
- forum: Forum
- user: User
- joinedAt: LocalDateTime

---

## ForumVote

- voteId: Long
- user: User
- post: ForumPost
- comment: ForumComment
- voteType: VoteType
- createdAt: LocalDateTime

---

## PostTag

- tagId: Long
- post: ForumPost
- tagName: String

---

## Notification

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

---

## Evaluation

- evaluationId: Long
- student: Student
- course: Course
- classEntity: Class
- tutor: UniversityStaff
- comment: String
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
- evaluationItems: List<EvaluationItem>

---

## EvaluationItem

- itemId: Long
- evaluation: Evaluation
- criterion: String
- ratingValue: Integer
- maxRating: Integer

---

## ENUMS

### UserType
- STUDENT
- TUTOR
- ADMINISTRATOR
- COOPERATOR

### UserStatus
- ACTIVE
- BANNED

### MaterialSourceType
- LOCAL_FILE
- LIBRARY_REF
- EXTERNAL_URL

### ForumType
- ACADEMIC
- CAREER

### VoteType
- UP
- DOWN
