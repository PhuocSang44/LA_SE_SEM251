# Conceptual Class Diagram Analysis - HCMUT Tutoring Support System

**Document Version:** 1.0  
**Date:** November 28, 2025  
**Purpose:** Conceptual perspective class diagram analysis for system design

---

## Overview

This document provides a comprehensive analysis of the domain classes and their relationships in the HCMUT Tutoring Support System from a **conceptual perspective**. The analysis focuses on business concepts, their associations, and cardinalities without implementation details.

---

## Core Domain Classes and Relationships

### 1. **User Management Domain**

**Primary Classes:**
- `User` - Core user entity with basic profile information
- `Student` - Specialization representing enrolled students
- `UniversityStaff` - Specialization representing faculty/staff members  
- `Department` - Organizational unit within the university

**Key Relationships:**
- `Student` → `User`: **Composition** (1:1) 
  - Student is an integral part of User identity
  - Cannot exist without corresponding User
- `UniversityStaff` → `User`: **Composition** (1:1)
  - Staff is an integral part of User identity  
  - Cannot exist without corresponding User
- `Student` → `Department`: **Association** (Many:1)
  - Student belongs to one Department
  - Department can have multiple Students
- `UniversityStaff` → `Department`: **Association** (Many:1)
  - Staff member belongs to one Department
  - Department can have multiple Staff members

### 2. **Academic Structure Domain**

**Primary Classes:**
- `Course` - Academic subject/curriculum definition
- `Class` - Specific offering/instance of a Course
- `Session` - Individual learning session within a Class
- `Department` - Academic organizational unit

**Key Relationships:**
- `Course` → `Department`: **Association** (Many:1)
  - Course is offered by one Department
  - Department offers multiple Courses
- `Class` → `Course`: **Association** (Many:1)
  - Class is a specific instance of one Course
  - Course can have multiple Class instances
- `Class` → `UniversityStaff`: **Association** (Many:1)
  - Class is taught by one tutor/instructor
  - Staff member can teach multiple Classes
- `Session` → `Class`: **Association** (Many:1)
  - Session belongs to one Class
  - Class contains multiple Sessions

### 3. **Enrollment Domain**

**Primary Classes:**
- `CourseRegistration` - Student enrollment in a specific class
- `SessionEnrollment` - Student enrollment in individual sessions

**Key Relationships:**
- `CourseRegistration` → `Student`: **Association** (Many:1)
  - Registration record belongs to one Student
  - Student can have multiple Registrations
- `CourseRegistration` → `Class`: **Association** (Many:1)
  - Registration is for one specific Class
  - Class can have multiple Registrations
- `CourseRegistration` → `Course`: **Association** (Many:1)
  - Registration references the Course
  - Course can have multiple Registrations
- `SessionEnrollment` → `Student`: **Association** (Many:1)
  - Enrollment belongs to one Student
  - Student can enroll in multiple Sessions
- `SessionEnrollment` → `Session`: **Association** (Many:1)
  - Enrollment is for one Session
  - Session can have multiple Enrollments

### 4. **Resource Management Domain**

**Primary Classes:**
- `Material` - Course-related learning materials and resources

**Key Relationships:**
- `Material` → `Course`: **Association** (Many:1)
  - Material belongs to one Course
  - Course can have multiple Materials

### 5. **Forum Discussion Domain**

**Primary Classes:**
- `Forum` - Discussion forum for academic topics
- `ForumMember` - Forum membership relationship
- `ForumPost` - Questions/posts within forums
- `ForumComment` - Answers/replies to posts
- `ForumVote` - Voting mechanism for posts and comments
- `PostTag` - Categorization tags for posts

**Key Relationships:**
- `Forum` → `User`: **Association** (Many:1)
  - Forum is created by one User
  - User can create multiple Forums
- `Forum` → `ForumMember`: **Composition** (1:Many)
  - Forum contains multiple Members
  - Members cannot exist without Forum
- `Forum` → `ForumPost`: **Composition** (1:Many)
  - Forum contains multiple Posts
  - Posts cannot exist without Forum
- `ForumMember` → `User`: **Association** (Many:1)
  - Member represents one User
  - User can be member of multiple Forums
- `ForumPost` → `User`: **Association** (Many:1)
  - Post is authored by one User
  - User can author multiple Posts
- `ForumPost` → `ForumComment`: **Composition** (1:Many)
  - Post can have multiple Comments
  - Comments cannot exist without Post
- `ForumPost` → `PostTag`: **Composition** (1:Many)
  - Post can have multiple Tags
  - Tags cannot exist without Post
- `ForumPost` → `ForumVote`: **Composition** (1:Many)
  - Post can receive multiple Votes
  - Votes cannot exist without Post/Comment
- `ForumComment` → `User`: **Association** (Many:1)
  - Comment is authored by one User
  - User can author multiple Comments
- `ForumComment` → `ForumVote`: **Composition** (1:Many)
  - Comment can receive multiple Votes
- `ForumVote` → `User`: **Association** (Many:1)
  - Vote is cast by one User
  - User can cast multiple Votes

### 6. **Assessment Domain**

**Primary Classes:**
- `Evaluation` - Tutor's assessment of student performance
- `EvaluationItem` - Individual criteria within an evaluation
- `Feedback` - Student feedback on courses/classes
- `FeedbackRating` - Individual rating items within feedback

**Key Relationships:**
- `Evaluation` → `Student`: **Association** (Many:1)
  - Evaluation assesses one Student
  - Student can receive multiple Evaluations
- `Evaluation` → `Course`: **Association** (Many:1)
  - Evaluation is for one Course
  - Course can have multiple Evaluations
- `Evaluation` → `Class`: **Association** (Many:1)
  - Evaluation is within one Class context
  - Class can have multiple Evaluations
- `Evaluation` → `UniversityStaff`: **Association** (Many:1)
  - Evaluation is conducted by one Tutor
  - Tutor can conduct multiple Evaluations
- `Evaluation` → `EvaluationItem`: **Composition** (1:Many)
  - Evaluation contains multiple Items
  - Items cannot exist without Evaluation
- `Feedback` → `Student`: **Association** (Many:1)
  - Feedback is provided by one Student
  - Student can provide multiple Feedbacks
- `Feedback` → `Course`: **Association** (Many:1)
  - Feedback is about one Course
  - Course can receive multiple Feedbacks
- `Feedback` → `Class`: **Association** (Many:1)
  - Feedback is for one Class
  - Class can receive multiple Feedbacks
- `Feedback` → `FeedbackRating`: **Composition** (1:Many)
  - Feedback contains multiple Rating items
  - Ratings cannot exist without Feedback

### 7. **Notification Domain**

**Primary Classes:**
- `Notification` - System notifications to users

**Key Relationships:**
- `Notification` → `User`: **Association** (Many:1)
  - Notification is sent to one User
  - User can receive multiple Notifications

### 8. **Activity Logging Domain**

**Primary Classes:**
- `ActivityLog` - System activity and audit logging

**Key Relationships:**
- `ActivityLog` → `User`: **Association** (Many:1)
  - Log entry is associated with one User
  - User can have multiple Log entries

---

## Cardinality Summary Table

| From Class | Relationship Type | To Class | Cardinality | Description |
|-----------|------------------|----------|-------------|-------------|
| User | Composition | Student | 1 : 0..1 | User may be a Student |
| User | Composition | UniversityStaff | 1 : 0..1 | User may be Staff |
| Student | Association | Department | Many : 1 | Student belongs to Department |
| UniversityStaff | Association | Department | Many : 1 | Staff belongs to Department |
| Course | Association | Department | Many : 1 | Course offered by Department |
| Class | Association | Course | Many : 1 | Class is instance of Course |
| Class | Association | UniversityStaff | Many : 1 | Class taught by Staff |
| Session | Association | Class | Many : 1 | Session belongs to Class |
| Material | Association | Course | Many : 1 | Material belongs to Course |
| CourseRegistration | Association | Student | Many : 1 | Registration by Student |
| CourseRegistration | Association | Class | Many : 1 | Registration for Class |
| CourseRegistration | Association | Course | Many : 1 | Registration for Course |
| SessionEnrollment | Association | Student | Many : 1 | Enrollment by Student |
| SessionEnrollment | Association | Session | Many : 1 | Enrollment in Session |
| Forum | Association | User | Many : 1 | Forum created by User |
| Forum | Composition | ForumMember | 1 : Many | Forum contains Members |
| Forum | Composition | ForumPost | 1 : Many | Forum contains Posts |
| ForumMember | Association | User | Many : 1 | Member is User |
| ForumPost | Association | User | Many : 1 | Post authored by User |
| ForumPost | Composition | ForumComment | 1 : Many | Post has Comments |
| ForumPost | Composition | PostTag | 1 : Many | Post has Tags |
| ForumPost | Composition | ForumVote | 1 : Many | Post has Votes |
| ForumComment | Association | User | Many : 1 | Comment by User |
| ForumComment | Composition | ForumVote | 1 : Many | Comment has Votes |
| ForumVote | Association | User | Many : 1 | Vote by User |
| Evaluation | Association | Student | Many : 1 | Evaluation of Student |
| Evaluation | Association | Course | Many : 1 | Evaluation for Course |
| Evaluation | Association | Class | Many : 1 | Evaluation in Class |
| Evaluation | Association | UniversityStaff | Many : 1 | Evaluation by Tutor |
| Evaluation | Composition | EvaluationItem | 1 : Many | Evaluation has Items |
| Feedback | Association | Student | Many : 1 | Feedback by Student |
| Feedback | Association | Course | Many : 1 | Feedback for Course |
| Feedback | Association | Class | Many : 1 | Feedback for Class |
| Feedback | Composition | FeedbackRating | 1 : Many | Feedback has Ratings |
| Notification | Association | User | Many : 1 | Notification for User |
| ActivityLog | Association | User | Many : 1 | Log for User |
| User | Association | UserType | Many : 1 | User has UserType enum |
| User | Association | UserStatus | Many : 1 | User has UserStatus enum |
| Material | Association | MaterialSourceType | Many : 1 | Material has SourceType enum |
| Forum | Association | ForumType | Many : 1 | Forum has ForumType enum |
| ForumVote | Association | VoteType | Many : 1 | Vote has VoteType enum |

---

## Domain Patterns and Design Insights

### 1. **Specialization Pattern**
- `User` serves as the base entity with `Student` and `UniversityStaff` as specialized roles
- Uses composition rather than inheritance to allow flexible role assignments

### 2. **Hierarchical Organization**
- `Department` → `Course` → `Class` → `Session` represents academic hierarchy
- Clear ownership and containment relationships

### 3. **Many-to-Many Resolution**
- `CourseRegistration` resolves Student-Class many-to-many relationship
- `SessionEnrollment` resolves Student-Session many-to-many relationship  
- `ForumMember` resolves User-Forum many-to-many relationship

### 4. **Composition vs Association**
- **Composition**: Used for dependent entities (ForumPost-ForumComment, Evaluation-EvaluationItem)
- **Association**: Used for independent entities that reference each other

### 5. **Audit and Tracking**
- `ActivityLog` provides system-wide audit trail
- `Notification` enables communication and alerts

---

## Usage Guidelines for Class Diagram Creation

### For Conceptual Diagram:
1. **Focus on business concepts** - Show only domain classes and their logical relationships
2. **Omit technical details** - No attributes, methods, or implementation specifics
3. **Show cardinalities** - Include relationship multiplicities (1:1, 1:Many, Many:Many)
4. **Use standard UML notation** - Association, Composition, Aggregation lines
5. **Group by domain** - Consider organizing classes by domain areas

### Key Relationships to Highlight:
- User specialization (Student/Staff)
- Academic hierarchy (Department-Course-Class-Session)
- Enrollment patterns (Registration/Enrollment entities)
- Forum discussion structure
- Assessment flows (Evaluation/Feedback)

---

**Document Version:** 1.0  
**Last Updated:** November 28, 2025  
**Prepared by:** System Analysis based on codebase review