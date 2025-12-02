# REPOSITORY METHODS REFERENCE

## UserRepository

```
findByEmail(String email): Optional<User>
```

---

## StudentRepository

```
findByUserId(Integer userId): Optional<Student>
findByStudentId(String studentId): Optional<Student>
findByDepartment_DepartmentName(String departmentName): List<Student>
findByMajor(String major): List<Student>
findByAcademicLevel(String academicLevel): List<Student>
findByUserIdIn(List<Integer> userIds): List<Student>
```

---

## UniversityStaffRepository

```
findByUserId(Integer userId): Optional<UniversityStaff>
findByStaffId(String staffId): Optional<UniversityStaff>
findByDepartment_DepartmentName(String departmentName): List<UniversityStaff>
findByUserIdIn(List<Integer> userIds): List<UniversityStaff>
```

---

## CourseRepository

```
findByCode(String code): Optional<Course>
findByCodeContainingIgnoreCaseOrNameContainingIgnoreCase(String codePart, String namePart): List<Course>
```

---

## ClassRepository

```
findByCourse_CourseId(Long courseId): List<Class>
findByTutor_StaffId(String tutorId): List<Class>
findBySemester(String semester): List<Class>
findByCourse_Code(String courseCode): List<Class>
findByCourse_CodeAndTutor_StaffId(String courseCode, String tutorId): Optional<Class>
findByClassIdAndTutor_StaffId(Long classId, String tutorId): Optional<Class>
findByClassId(Long classId): Optional<Class>
findAllWithTutorAndCourse(): List<Class>
findByCourse_CourseIdWithTutorAndCourse(Long courseId): List<Class>
findByCourse_CodeWithTutorAndCourse(String courseCode): List<Class>
findByTutor_StaffIdWithTutorAndCourse(String tutorId): List<Class>
findByClassIdWithTutorAndCourse(Long classId): Optional<Class>
incrementEnrolledIfSpace(Long classId): int
decrementEnrolledIfPositive(Long classId): int
```

---

## jpaSessionRepository

```
findByClazz_Tutor_StaffId(String staffId): List<Session>
findByClazz_ClassId(Long classId): List<Session>
incrementCurrentStudentsIfSpace(Long id): int
decrementCurrentStudentsIfPositive(Long id): int
```

---

## CourseRegistrationRepository

```
findByStudent_StudentIdAndClassEntity_ClassId(String studentId, Long classId): Optional<CourseRegistration>
findByStudent_StudentId(String studentId): List<CourseRegistration>
findByClassEntity_ClassId(Long classId): List<CourseRegistration>
findByClassEntity_ClassIdWithStudentUser(Long classId): List<CourseRegistration>
countByClassEntity_ClassId(Long classId): long
findByStudent_StudentIdAndCourse_CourseId(String studentId, Long courseId): Optional<CourseRegistration>
existsByStudent_StudentIdAndClassEntity_ClassId(String studentId, Long classId): boolean
```

---

## SessionRegistrationRepository

```
findBySession_SessionId(Long sessionId): List<SessionEnrollment>
countBySession_SessionId(Long sessionId): long
existsBySession_SessionIdAndStudent_UserId(Long sessionId, Integer userId): boolean
findByStudent_UserId(Integer userId): List<SessionEnrollment>
```

---

## ForumRepository

```
findByForumType(ForumType forumType): List<Forum>
findByForumTypeAndSubjectContaining(ForumType forumType, String subject): List<Forum>
findByCreatorUserId(Integer userId): List<Forum>
searchForums(String searchQuery, ForumType forumType): List<Forum>
```

---

## ForumMemberRepository

```
existsByForumForumIdAndUserUserId(Long forumId, Integer userId): boolean
findByForumForumIdAndUserUserId(Long forumId, Integer userId): Optional<ForumMember>
findByUserUserId(Integer userId): List<ForumMember>
findByForumForumId(Long forumId): List<ForumMember>
countMembersByForumId(Long forumId): Long
deleteByForumForumIdAndUserUserId(Long forumId, Integer userId): void
```

---

## ForumPostRepository

```
findByForumForumId(Long forumId): List<ForumPost>
findByAuthorUserId(Integer userId): List<ForumPost>
findByForumForumIdOrderByCreatedAtDesc(Long forumId): List<ForumPost>
searchPostsInForum(Long forumId, String searchQuery): List<ForumPost>
countPostsByForumId(Long forumId): Long
incrementViews(Long postId): void
```

---

## ForumCommentRepository

```
findByPostPostId(Long postId): List<ForumComment>
findByAuthorUserId(Integer userId): List<ForumComment>
findByPostPostIdOrderByCreatedAtAsc(Long postId): List<ForumComment>
countCommentsByPostId(Long postId): Long
findAcceptedCommentsByPostId(Long postId): List<ForumComment>
```

---

## ForumVoteRepository

```
findByUserUserIdAndPostPostId(Integer userId, Long postId): Optional<ForumVote>
findByUserUserIdAndCommentCommentId(Integer userId, Long commentId): Optional<ForumVote>
deleteByUserUserIdAndPostPostId(Integer userId, Long postId): void
deleteByUserUserIdAndCommentCommentId(Integer userId, Long commentId): void
getPostVoteScore(Long postId): Long
getCommentVoteScore(Long commentId): Long
```

---

## PostTagRepository

```
findByPostPostId(Long postId): List<PostTag>
deleteByPostPostId(Long postId): void
```

---

## MaterialRepository

```
findByCourse_CourseIdOrderByCreatedAtDesc(Long courseId): List<Material>
```

---

## NotificationRepository

```
findByUserOrderByCreatedAtDesc(User user): List<Notification>
findByUserAndIsReadOrderByCreatedAtDesc(User user, Boolean isRead): List<Notification>
countUnreadByUser(User user): Long
markAsRead(Long id): void
markAllAsReadForUser(User user): void
```

---

## EvaluationRepository

```
findByStudent_StudentId(String studentId): List<Evaluation>
findByCourse_CourseId(Long courseId): List<Evaluation>
findByClassEntity_ClassId(Long classId): List<Evaluation>
findByTutor_StaffId(String tutorId): List<Evaluation>
findByStudent_StudentIdAndClassEntity_ClassId(String studentId, Long classId): Optional<Evaluation>
existsByStudent_StudentIdAndClassEntity_ClassId(String studentId, Long classId): boolean
```

---

## FeedbackRepository

```
findByStudent_StudentId(String studentId): List<Feedback>
findByCourse_CourseId(Long courseId): List<Feedback>
findByClassEntity_ClassId(Long classId): List<Feedback>
findByStatus(String status): List<Feedback>
existsByStudent_StudentIdAndClassEntity_ClassId(String studentId, Long classId): boolean
```

---

## DepartmentRepository

```
findByDepartmentName(String departmentName): Optional<Department>
```

---

## ActivityLogRepository

```
findByUserIdOrderByCreatedAtDesc(Integer userId): List<ActivityLog>
findByActionOrderByCreatedAtDesc(String action): List<ActivityLog>
```

---

**Note:** All repositories inherit standard JpaRepository methods:
- `save(T entity): T`
- `saveAll(Iterable<T> entities): List<T>`
- `findById(ID id): Optional<T>`
- `existsById(ID id): boolean`
- `findAll(): List<T>`
- `findAllById(Iterable<ID> ids): List<T>`
- `count(): long`
- `deleteById(ID id): void`
- `delete(T entity): void`
- `deleteAll(Iterable<T> entities): void`
- `deleteAll(): void`
