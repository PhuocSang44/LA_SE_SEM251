# DEMO MOCK DATA - HCMUT TSS

Dữ liệu mẫu có ý nghĩa để demo hệ thống quản lý học tập HCMUT.

---

## 1. USERS & ACCOUNTS

### Administrators
```json
{
  "email": "admin.hcmut@hcmut.edu.vn",
  "password": "Admin@2025",
  "firstName": "Quản Trị",
  "middleName": "Viên",
  "lastName": "Nguyễn",
  "userType": "ADMINISTRATOR",
  "status": "ACTIVE",
  "staffId": "ADM001",
  "department": "Phòng Đào Tạo",
  "position": "Trưởng Phòng",
  "role": "SYSTEM_ADMIN"
}
```

### Tutors (Giảng viên)
```json
[
  {
    "email": "nguyen.van.a@hcmut.edu.vn",
    "password": "Tutor@2025",
    "firstName": "Văn A",
    "middleName": "",
    "lastName": "Nguyễn",
    "userType": "TUTOR",
    "status": "ACTIVE",
    "staffId": "GV001",
    "department": "Khoa Khoa học và Kỹ thuật Máy tính",
    "position": "Giảng viên",
    "role": "LECTURER"
  },
  {
    "email": "tran.thi.b@hcmut.edu.vn",
    "password": "Tutor@2025",
    "firstName": "Thị B",
    "middleName": "",
    "lastName": "Trần",
    "userType": "TUTOR",
    "status": "ACTIVE",
    "staffId": "GV002",
    "department": "Khoa Khoa học và Kỹ thuật Máy tính",
    "position": "Giảng viên Chính",
    "role": "SENIOR_LECTURER"
  },
  {
    "email": "le.van.c@hcmut.edu.vn",
    "password": "Tutor@2025",
    "firstName": "Văn C",
    "middleName": "",
    "lastName": "Lê",
    "userType": "TUTOR",
    "status": "ACTIVE",
    "staffId": "GV003",
    "department": "Khoa Điện - Điện tử",
    "position": "Phó Giáo sư",
    "role": "ASSOCIATE_PROFESSOR"
  }
]
```

### Students (Sinh viên)
```json
[
  {
    "email": "2211234@student.hcmut.edu.vn",
    "password": "Student@2025",
    "firstName": "Minh",
    "middleName": "Hoàng",
    "lastName": "Phạm",
    "userType": "STUDENT",
    "status": "ACTIVE",
    "studentId": "2211234",
    "department": "Khoa Khoa học và Kỹ thuật Máy tính",
    "major": "Khoa học Máy tính",
    "academicLevel": "Đại học"
  },
  {
    "email": "2211567@student.hcmut.edu.vn",
    "password": "Student@2025",
    "firstName": "Thảo",
    "middleName": "Nguyễn",
    "lastName": "Võ",
    "userType": "STUDENT",
    "status": "ACTIVE",
    "studentId": "2211567",
    "department": "Khoa Khoa học và Kỹ thuật Máy tính",
    "major": "Kỹ thuật Phần mềm",
    "academicLevel": "Đại học"
  },
  {
    "email": "2211890@student.hcmut.edu.vn",
    "password": "Student@2025",
    "firstName": "Tuấn",
    "middleName": "Anh",
    "lastName": "Đặng",
    "userType": "STUDENT",
    "status": "ACTIVE",
    "studentId": "2211890",
    "department": "Khoa Khoa học và Kỹ thuật Máy tính",
    "major": "Khoa học Dữ liệu",
    "academicLevel": "Đại học"
  },
  {
    "email": "2210456@student.hcmut.edu.vn",
    "password": "Student@2025",
    "firstName": "Lan",
    "middleName": "Phương",
    "lastName": "Bùi",
    "userType": "STUDENT",
    "status": "ACTIVE",
    "studentId": "2210456",
    "department": "Khoa Điện - Điện tử",
    "major": "Kỹ thuật Điện tử",
    "academicLevel": "Đại học"
  }
]
```

### Cooperators (Đối tác doanh nghiệp)
```json
{
  "email": "recruiter@fpt.com.vn",
  "password": "Coop@2025",
  "firstName": "Recruitment Team",
  "middleName": "",
  "lastName": "FPT Software",
  "userType": "COOPERATOR",
  "status": "ACTIVE"
}
```

---

## 2. DEPARTMENTS

```json
[
  {
    "departmentId": 1,
    "departmentName": "Khoa Khoa học và Kỹ thuật Máy tính"
  },
  {
    "departmentId": 2,
    "departmentName": "Khoa Điện - Điện tử"
  },
  {
    "departmentId": 3,
    "departmentName": "Khoa Cơ khí"
  },
  {
    "departmentId": 4,
    "departmentName": "Khoa Kỹ thuật Hóa học"
  },
  {
    "departmentId": 5,
    "departmentName": "Phòng Đào Tạo"
  }
]
```

---

## 3. COURSES

```json
[
  {
    "code": "CO2003",
    "name": "Công Nghệ Phần Mềm",
    "description": "Học về quy trình phát triển phần mềm, các mô hình SDLC, UML, design patterns, testing và project management. Sinh viên sẽ làm việc nhóm để phát triển một dự án phần mềm hoàn chỉnh.",
    "departmentName": "Khoa Khoa học và Kỹ thuật Máy tính"
  },
  {
    "code": "CO3001",
    "name": "Hệ Điều Hành",
    "description": "Nghiên cứu kiến trúc và nguyên lý hoạt động của hệ điều hành: process management, memory management, file systems, I/O systems. Thực hành lập trình hệ thống trên Linux.",
    "departmentName": "Khoa Khoa học và Kỹ thuật Máy tính"
  },
  {
    "code": "CO3005",
    "name": "Phân Tích và Thiết Kế Thuật Toán",
    "description": "Các kỹ thuật thiết kế thuật toán: divide & conquer, dynamic programming, greedy, backtracking. Phân tích độ phức tạp, cấu trúc dữ liệu nâng cao và các thuật toán tối ưu.",
    "departmentName": "Khoa Khoa học và Kỹ thuật Máy tính"
  },
  {
    "code": "CO3009",
    "name": "Học Máy",
    "description": "Các thuật toán machine learning cơ bản: regression, classification, clustering, neural networks. Ứng dụng thư viện scikit-learn, TensorFlow để xây dựng các mô hình dự đoán.",
    "departmentName": "Khoa Khoa học và Kỹ thuật Máy tính"
  },
  {
    "code": "CO3121",
    "name": "Trí Tuệ Nhân Tạo",
    "description": "Các phương pháp tìm kiếm, biểu diễn tri thức, suy luận logic, machine learning cơ bản, computer vision và xử lý ngôn ngữ tự nhiên.",
    "departmentName": "Khoa Khoa học và Kỹ thuật Máy tính"
  },
  {
    "code": "EE2001",
    "name": "Mạch Điện Tử",
    "description": "Phân tích mạch điện tử tương tự và số, linh kiện bán dẫn, khuếch đại, bộ lọc, và thiết kế mạch in PCB.",
    "departmentName": "Khoa Điện - Điện tử"
  }
]
```

---

## 4. CLASSES

```json
[
  {
    "customName": "CO2003 - L01 - HK241",
    "course": "CO2003",
    "semester": "HK241 (2024-2025)",
    "tutorEmail": "nguyen.van.a@hcmut.edu.vn",
    "capacity": 60,
    "status": "ACTIVE",
    "description": "Lớp chính khóa sáng thứ 2, 4 - Phòng H1-201"
  },
  {
    "customName": "CO2003 - L02 - HK241",
    "course": "CO2003",
    "semester": "HK241 (2024-2025)",
    "tutorEmail": "nguyen.van.a@hcmut.edu.vn",
    "capacity": 60,
    "status": "ACTIVE",
    "description": "Lớp chính khóa chiều thứ 3, 5 - Phòng H2-305"
  },
  {
    "customName": "CO3001 - L01 - HK241",
    "course": "CO3001",
    "semester": "HK241 (2024-2025)",
    "tutorEmail": "tran.thi.b@hcmut.edu.vn",
    "capacity": 50,
    "status": "ACTIVE",
    "description": "Lớp lý thuyết + thực hành Lab - Phòng H3-103 & Lab Linux"
  },
  {
    "customName": "CO3005 - L01 - HK241",
    "course": "CO3005",
    "semester": "HK241 (2024-2025)",
    "tutorEmail": "tran.thi.b@hcmut.edu.vn",
    "capacity": 70,
    "status": "ACTIVE",
    "description": "Lớp chính khóa sáng thứ 2, 4, 6 - Phòng H1-402"
  },
  {
    "customName": "CO3009 - L01 - HK241",
    "course": "CO3009",
    "semester": "HK241 (2024-2025)",
    "tutorEmail": "nguyen.van.a@hcmut.edu.vn",
    "capacity": 40,
    "status": "ACTIVE",
    "description": "Lớp nâng cao - yêu cầu Python & Toán - Phòng H6-601"
  },
  {
    "customName": "EE2001 - L01 - HK241",
    "course": "EE2001",
    "semester": "HK241 (2024-2025)",
    "tutorEmail": "le.van.c@hcmut.edu.vn",
    "capacity": 45,
    "status": "ACTIVE",
    "description": "Lớp lý thuyết + Lab thực hành mạch - Phòng A4-201"
  }
]
```

---

## 5. SESSIONS

### Cho lớp CO2003 - L01
```json
[
  {
    "title": "Buổi 1: Giới thiệu môn học & SDLC",
    "classCode": "CO2003 - L01 - HK241",
    "startTime": "2025-01-06T07:30:00",
    "endTime": "2025-01-06T09:30:00",
    "description": "Giới thiệu tổng quan về Software Development Life Cycle, các mô hình phát triển phần mềm: Waterfall, Agile, Scrum. Phân nhóm đồ án.",
    "location": "Phòng H1-201",
    "sessionType": "LÝ THUYẾT",
    "maxStudents": 60,
    "status": "SCHEDULED"
  },
  {
    "title": "Buổi 2: Requirements Engineering",
    "classCode": "CO2003 - L01 - HK241",
    "startTime": "2025-01-08T07:30:00",
    "endTime": "2025-01-08T09:30:00",
    "description": "Kỹ thuật thu thập yêu cầu, phân tích stakeholder, viết User Stories và Use Cases. Workshop: Phân tích yêu cầu cho dự án nhóm.",
    "location": "Phòng H1-201",
    "sessionType": "LÝ THUYẾT + THỰC HÀNH",
    "maxStudents": 60,
    "status": "SCHEDULED"
  },
  {
    "title": "Buổi 3: UML - Use Case & Class Diagram",
    "classCode": "CO2003 - L01 - HK241",
    "startTime": "2025-01-13T07:30:00",
    "endTime": "2025-01-13T09:30:00",
    "description": "Vẽ Use Case Diagram, Class Diagram sử dụng PlantUML. Thực hành thiết kế class diagram cho hệ thống quản lý thư viện.",
    "location": "Phòng H1-201",
    "sessionType": "THỰC HÀNH",
    "maxStudents": 60,
    "status": "SCHEDULED"
  },
  {
    "title": "Workshop: Git & GitHub Collaboration",
    "classCode": "CO2003 - L01 - HK241",
    "startTime": "2025-01-15T13:30:00",
    "endTime": "2025-01-15T16:30:00",
    "description": "Học cách sử dụng Git, GitHub, branching strategy, pull request, code review. Mỗi nhóm tạo repository cho dự án.",
    "location": "Lab H6-502",
    "sessionType": "WORKSHOP",
    "maxStudents": 30,
    "status": "SCHEDULED"
  }
]
```

### Cho lớp CO3001 - L01
```json
[
  {
    "title": "Lab 1: Linux Command Line Basics",
    "classCode": "CO3001 - L01 - HK241",
    "startTime": "2025-01-07T14:00:00",
    "endTime": "2025-01-07T17:00:00",
    "description": "Thực hành các lệnh Linux cơ bản: file system navigation, process management, text processing với grep/sed/awk.",
    "location": "Lab Linux - H3-103",
    "sessionType": "LAB",
    "maxStudents": 50,
    "status": "SCHEDULED"
  },
  {
    "title": "Buổi 2: Process Scheduling Algorithms",
    "classCode": "CO3001 - L01 - HK241",
    "startTime": "2025-01-09T07:30:00",
    "endTime": "2025-01-09T10:30:00",
    "description": "Các thuật toán scheduling: FCFS, SJF, Priority, Round Robin. Mô phỏng bằng Python.",
    "location": "Phòng H3-103",
    "sessionType": "LÝ THUYẾT",
    "maxStudents": 50,
    "status": "SCHEDULED"
  }
]
```

---

## 6. FORUMS

### Academic Forums
```json
[
  {
    "title": "CO2003 - Q&A và Thảo luận",
    "description": "Diễn đàn trao đổi, hỏi đáp về môn Công Nghệ Phần Mềm. Sinh viên có thể đặt câu hỏi về bài tập, đồ án, hoặc chia sẻ tài liệu hữu ích.",
    "forumType": "ACADEMIC",
    "subject": "CO2003",
    "creatorEmail": "nguyen.van.a@hcmut.edu.vn"
  },
  {
    "title": "CO3009 - Machine Learning Study Group",
    "description": "Nhóm học tập Machine Learning. Chia sẻ papers, datasets, code notebooks, và thảo luận về các thuật toán ML.",
    "forumType": "ACADEMIC",
    "subject": "CO3009",
    "creatorEmail": "2211234@student.hcmut.edu.vn"
  },
  {
    "title": "Competitive Programming - HCMUT",
    "description": "Diễn đàn cho những ai yêu thích thuật toán và lập trình thi đấu. Thảo luận bài toán Codeforces, LeetCode, ICPC.",
    "forumType": "ACADEMIC",
    "subject": "Algorithms & Data Structures",
    "creatorEmail": "2211890@student.hcmut.edu.vn"
  }
]
```

### Career Forums
```json
[
  {
    "title": "Software Engineer Career Path",
    "description": "Diễn đàn thảo luận về lộ trình nghề nghiệp Software Engineer: Backend, Frontend, DevOps, Data Engineer. Chia sẻ kinh nghiệm phỏng vấn, resume tips.",
    "forumType": "CAREER",
    "subject": "Career Development",
    "creatorEmail": "recruiter@fpt.com.vn"
  },
  {
    "title": "Internship & Job Opportunities",
    "description": "Đăng thông tin tuyển dụng intern/fresher, chia sẻ kinh nghiệm phỏng vấn ở các công ty công nghệ.",
    "forumType": "CAREER",
    "subject": "Job Hunting",
    "creatorEmail": "2211567@student.hcmut.edu.vn"
  }
]
```

---

## 7. FORUM POSTS

### Trong forum "CO2003 - Q&A và Thảo luận"
```json
[
  {
    "title": "Làm sao để vẽ Sequence Diagram cho hệ thống thanh toán?",
    "content": "Mình đang làm đồ án nhóm về hệ thống e-commerce. Mình cần vẽ sequence diagram cho flow thanh toán qua VNPay. Các bạn có thể gợi ý các actor và message nào cần có không? Cảm ơn!",
    "authorEmail": "2211234@student.hcmut.edu.vn",
    "tags": ["UML", "Sequence Diagram", "Payment"]
  },
  {
    "title": "Phân biệt Aggregation và Composition trong Class Diagram",
    "content": "Các bạn cho mình hỏi khi nào dùng mũi tên rỗng (aggregation) và khi nào dùng mũi tên đặc (composition)? Mình hay bị nhầm lẫn hai khái niệm này.",
    "authorEmail": "2211567@student.hcmut.edu.vn",
    "tags": ["UML", "Class Diagram", "Theory"]
  },
  {
    "title": "[SHARE] Template báo cáo đồ án CNPM",
    "content": "Mình xin chia sẻ template LaTeX cho báo cáo đồ án môn CNPM, có sẵn các section: Requirements, Design, Implementation, Testing. Link GitHub: github.com/example/cnpm-template",
    "authorEmail": "2211890@student.hcmut.edu.vn",
    "tags": ["Template", "Report", "LaTeX"]
  }
]
```

### Trong forum "CO3009 - Machine Learning Study Group"
```json
[
  {
    "title": "Dataset nào phù hợp cho đồ án cuối kỳ?",
    "content": "Thầy yêu cầu đồ án phải train model với accuracy > 85%. Các bạn recommend dataset nào trên Kaggle phù hợp với yêu cầu này không? Mình đang nghĩ đến Titanic hoặc MNIST.",
    "authorEmail": "2211234@student.hcmut.edu.vn",
    "tags": ["Dataset", "Project", "Kaggle"]
  },
  {
    "title": "Overfitting - Cách xử lý như thế nào?",
    "content": "Model của mình training acc = 98% nhưng validation acc chỉ 65%. Mình đã thử dropout, L2 regularization nhưng vẫn không khắc phục được. Các bạn có kinh nghiệm gì không?",
    "authorEmail": "2211567@student.hcmut.edu.vn",
    "tags": ["Overfitting", "Deep Learning", "Debugging"]
  }
]
```

---

## 8. MATERIALS

```json
[
  {
    "courseCode": "CO2003",
    "ownerEmail": "nguyen.van.a@hcmut.edu.vn",
    "title": "Slide Bài 1 - Introduction to Software Engineering",
    "description": "Slide giới thiệu tổng quan về công nghệ phần mềm, SDLC models, Agile vs Waterfall.",
    "sourceType": "LOCAL_FILE",
    "filePath": "uploads/materials/CO2003_Slide01_Intro.pdf",
    "originalName": "CO2003_Slide01_Intro.pdf",
    "contentType": "application/pdf",
    "sizeBytes": 2048000
  },
  {
    "courseCode": "CO2003",
    "ownerEmail": "nguyen.van.a@hcmut.edu.vn",
    "title": "UML Cheat Sheet",
    "description": "Tài liệu tổng hợp các loại diagram trong UML 2.5: Class, Sequence, Activity, State Machine, Use Case.",
    "sourceType": "EXTERNAL_URL",
    "externalUrl": "https://www.uml-diagrams.org/uml-25-diagrams.html"
  },
  {
    "courseCode": "CO3009",
    "ownerEmail": "nguyen.van.a@hcmut.edu.vn",
    "title": "Hands-On Machine Learning with Scikit-Learn",
    "description": "Sách tham khảo chính cho môn học. Có thể mượn tại thư viện trường (mã sách: ML2023-001).",
    "sourceType": "LIBRARY_REF",
    "libraryItemId": 1001
  },
  {
    "courseCode": "CO3001",
    "ownerEmail": "tran.thi.b@hcmut.edu.vn",
    "title": "Lab 1 - Linux Commands Tutorial",
    "description": "Hướng dẫn chi tiết các lệnh Linux cơ bản: ls, cd, grep, find, chmod, chown, ps, kill.",
    "sourceType": "LOCAL_FILE",
    "filePath": "uploads/materials/CO3001_Lab01_Linux.pdf",
    "originalName": "CO3001_Lab01_Linux.pdf",
    "contentType": "application/pdf",
    "sizeBytes": 1536000
  }
]
```

---

## 9. NOTIFICATIONS

```json
[
  {
    "userEmail": "2211234@student.hcmut.edu.vn",
    "title": "Lịch học mới: Workshop Git & GitHub",
    "message": "Buổi workshop về Git & GitHub đã được thêm vào lịch học. Thời gian: 15/01/2025, 13:30 - 16:30 tại Lab H6-502.",
    "type": "SESSION_ADDED",
    "isRead": false,
    "sessionId": 4
  },
  {
    "userEmail": "2211234@student.hcmut.edu.vn",
    "title": "Tài liệu mới: UML Cheat Sheet",
    "message": "Giảng viên Nguyễn Văn A đã đăng tài liệu mới cho môn CO2003: UML Cheat Sheet.",
    "type": "MATERIAL_UPLOADED",
    "isRead": false,
    "classId": 1
  },
  {
    "userEmail": "2211567@student.hcmut.edu.vn",
    "title": "Câu trả lời của bạn đã được chấp nhận!",
    "message": "Câu trả lời của bạn trong forum 'CO2003 - Q&A và Thảo luận' đã được tác giả đánh dấu là câu trả lời đúng.",
    "type": "ANSWER_ACCEPTED",
    "isRead": true
  }
]
```

---

## 10. FEEDBACK & EVALUATIONS

### Feedback từ sinh viên về khóa học
```json
[
  {
    "studentEmail": "2211234@student.hcmut.edu.vn",
    "courseCode": "CO2003",
    "classCode": "CO2003 - L01 - HK241",
    "comment": "Môn học rất bổ ích, giảng viên nhiệt tình. Tuy nhiên đồ án hơi nặng so với tín chỉ. Mong thầy có thêm buổi hướng dẫn về testing.",
    "status": "APPROVED",
    "ratings": [
      { "question": "Nội dung bài giảng", "ratingValue": 5 },
      { "question": "Phương pháp giảng dạy", "ratingValue": 5 },
      { "question": "Tài liệu học tập", "ratingValue": 4 },
      { "question": "Độ khó bài tập", "ratingValue": 4 },
      { "question": "Mức độ hài lòng chung", "ratingValue": 5 }
    ]
  },
  {
    "studentEmail": "2211567@student.hcmut.edu.vn",
    "courseCode": "CO3001",
    "classCode": "CO3001 - L01 - HK241",
    "comment": "Lab thực hành rất hay, giúp hiểu sâu về Linux. Slide lý thuyết hơi khó hiểu, mong thầy giải thích kỹ hơn phần memory management.",
    "status": "APPROVED",
    "ratings": [
      { "question": "Nội dung bài giảng", "ratingValue": 4 },
      { "question": "Phương pháp giảng dạy", "ratingValue": 4 },
      { "question": "Tài liệu học tập", "ratingValue": 3 },
      { "question": "Độ khó bài tập", "ratingValue": 5 },
      { "question": "Mức độ hài lòng chung", "ratingValue": 4 }
    ]
  }
]
```

### Evaluation từ giảng viên về sinh viên
```json
[
  {
    "studentEmail": "2211234@student.hcmut.edu.vn",
    "courseCode": "CO2003",
    "classCode": "CO2003 - L01 - HK241",
    "tutorEmail": "nguyen.van.a@hcmut.edu.vn",
    "comment": "Sinh viên tích cực tham gia thảo luận, đồ án nhóm làm tốt. Có tư duy phân tích và thiết kế hệ thống rõ ràng.",
    "evaluationItems": [
      { "criterion": "Chuyên cần", "ratingValue": 9, "maxRating": 10 },
      { "criterion": "Bài tập cá nhân", "ratingValue": 8, "maxRating": 10 },
      { "criterion": "Đồ án nhóm", "ratingValue": 9, "maxRating": 10 },
      { "criterion": "Kỹ năng làm việc nhóm", "ratingValue": 9, "maxRating": 10 }
    ]
  }
]
```

---

## 11. ACTIVITY LOGS

```json
[
  {
    "userEmail": "2211234@student.hcmut.edu.vn",
    "action": "ENROLL_SESSION",
    "entityType": "Session",
    "entityId": 1,
    "description": "Đăng ký tham gia buổi 'Workshop: Git & GitHub Collaboration'"
  },
  {
    "userEmail": "nguyen.van.a@hcmut.edu.vn",
    "action": "UPLOAD_MATERIAL",
    "entityType": "Material",
    "entityId": 1,
    "description": "Đăng tài liệu 'Slide Bài 1 - Introduction to Software Engineering' cho khóa CO2003"
  },
  {
    "userEmail": "admin.hcmut@hcmut.edu.vn",
    "action": "CREATE_CLASS",
    "entityType": "Class",
    "entityId": 1,
    "description": "Tạo lớp học mới 'CO2003 - L01 - HK241'"
  },
  {
    "userEmail": "2211567@student.hcmut.edu.vn",
    "action": "CREATE_FORUM_POST",
    "entityType": "ForumPost",
    "entityId": 2,
    "description": "Đăng bài 'Phân biệt Aggregation và Composition trong Class Diagram' trong forum CO2003"
  }
]
```

---

## 12. COURSE REGISTRATIONS

```json
[
  {
    "studentEmail": "2211234@student.hcmut.edu.vn",
    "courseCode": "CO2003",
    "classCode": "CO2003 - L01 - HK241"
  },
  {
    "studentEmail": "2211234@student.hcmut.edu.vn",
    "courseCode": "CO3009",
    "classCode": "CO3009 - L01 - HK241"
  },
  {
    "studentEmail": "2211567@student.hcmut.edu.vn",
    "courseCode": "CO2003",
    "classCode": "CO2003 - L01 - HK241"
  },
  {
    "studentEmail": "2211567@student.hcmut.edu.vn",
    "courseCode": "CO3001",
    "classCode": "CO3001 - L01 - HK241"
  },
  {
    "studentEmail": "2211890@student.hcmut.edu.vn",
    "courseCode": "CO2003",
    "classCode": "CO2003 - L02 - HK241"
  },
  {
    "studentEmail": "2211890@student.hcmut.edu.vn",
    "courseCode": "CO3005",
    "classCode": "CO3005 - L01 - HK241"
  }
]
```

---

## HƯỚNG DẪN SỬ DỤNG MOCK DATA

### 1. Tạo Accounts trước
- Tạo 1 admin
- Tạo 3 tutors
- Tạo 4 students
- Tạo 1 cooperator

### 2. Tạo Departments
- Tạo 5 departments

### 3. Tạo Courses
- Tạo 6 courses (5 CSE + 1 EE)

### 4. Tạo Classes
- Admin tạo 6 classes, assign tutors

### 5. Course Registrations
- Students đăng ký classes (dùng data ở mục 12)

### 6. Tạo Sessions
- Tutors tạo sessions cho classes của mình

### 7. Tạo Forums
- Tutors + Students tạo 5 forums

### 8. Tạo Forum Posts
- Students đăng 5 posts trong các forums

### 9. Upload Materials
- Tutors upload 4 materials

### 10. Notifications
- Hệ thống tự tạo notifications khi có events

### 11. Feedback & Evaluations
- Students submit feedback
- Tutors đánh giá students

---

**Demo Flow hoàn chỉnh:**
1. **Admin** login → Tạo classes, assign tutors
2. **Tutor** login → Tạo sessions, upload materials
3. **Student** login → Đăng ký classes, join forums, post questions
4. **All roles** → Tương tác trên forums, xem notifications
5. **End of semester** → Submit feedback/evaluations

**Password mặc định:**
- Admin: `Admin@2025`
- Tutor: `Tutor@2025`
- Student: `Student@2025`
- Cooperator: `Coop@2025`
