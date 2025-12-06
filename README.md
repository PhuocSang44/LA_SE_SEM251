# HCMUT Tutoring Support System (HCMUT-TSS)

[![Production Status](https://img.shields.io/badge/status-production-success)](https://app.10diemse251.online)
[![Frontend](https://img.shields.io/badge/frontend-Vercel-000000?logo=vercel)](https://app.10diemse251.online)
[![Backend](https://img.shields.io/badge/backend-VPS-blue)](https://10diemse251.online)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> A comprehensive web-based platform for managing tutoring services at Ho Chi Minh City University of Technology (HCMUT)

**Live Demo:** [https://app.10diemse251.online](https://app.10diemse251.online)

---

## 📋 Table of Contents

- [System Overview](#-system-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Production Deployment](#-production-deployment)
- [Mock Users](#-mock-users)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 System Overview

HCMUT-TSS is a full-stack web application designed to streamline the tutoring and academic support services at HCMUT. The system facilitates connections between students and tutors, manages tutoring sessions, handles course materials, and provides comprehensive evaluation and feedback mechanisms.

### **Primary Objectives**

- **Student-Tutor Matching**: Enable students to discover and enroll in tutoring courses offered by university staff
- **Session Management**: Allow tutors to schedule, reschedule, and manage tutoring sessions
- **Material Distribution**: Provide a centralized platform for uploading, organizing, and accessing course materials
- **Feedback System**: Collect student feedback and facilitate tutor performance evaluation
- **Administrative Control**: Enable administrators to oversee system operations, manage catalogs, and monitor activities

### **Target Users**

- **Students**: Undergraduate and graduate students seeking academic support
- **Tutors**: University professors, lecturers, and teaching assistants offering tutoring services
- **Administrators**: Academic advisors and department staff managing the tutoring program
- **Cooperators**: Department secretaries assisting with administrative tasks

---

## ✨ Key Features

### For Students

- 🔐 **Single Sign-On (SSO)**: Seamless authentication using HCMUT credentials
- 📚 **Course Discovery**: Browse available tutoring courses filtered by subject, department, and tutor
- 📝 **Course Enrollment**: Register for tutoring classes with real-time capacity tracking
- 📅 **Session Booking**: View and join scheduled tutoring sessions with conflict detection
- 📄 **Material Access**: Download course materials, lecture notes, and reference documents
- ⭐ **Feedback Submission**: Rate sessions and provide constructive feedback to tutors
- 📊 **Progress Tracking**: Monitor enrolled courses and attended sessions

### For Tutors

- 🎓 **Course Creation**: Create and manage tutoring courses with prerequisites and descriptions
- ⏰ **Session Scheduling**: Schedule sessions with date, time, topic, and capacity limits
- 📤 **Material Upload**: Upload course materials (PDFs, documents) up to 50MB per file
- 📚 **Library Integration**: Add references to university library resources
- 👥 **Student Management**: View enrolled students and session participants
- 📈 **Performance Analytics**: Access feedback and evaluation reports
- 🔄 **Session Rescheduling**: Modify or cancel sessions with automatic student notifications

### For Administrators

- 👤 **User Management**: Manage user accounts, roles, and permissions
- 🏫 **Catalog Administration**: Maintain course catalogs, departments, and majors (via DATACORE)
- 📊 **System Monitoring**: Track system usage, enrollment statistics, and session activities
- 🔍 **Evaluation Tools**: Generate reports on tutor performance and student satisfaction
- 🛡️ **Access Control**: Configure role-based permissions and security policies

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Internet Users                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  DNS: 10diemse251.online│
              │  ├─ A → 103.20.96.46    │
              │  └─ CNAME app → Vercel  │
              └────────────┬────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
         ▼                                   ▼
┌──────────────────┐              ┌──────────────────┐
│   Vercel CDN     │              │   VPS Backend    │
│  (Frontend SPA)  │◄────HTTPS────┤  103.20.96.46   │
│                  │   API Calls  │                  │
│  React + Vite    │              │  Docker Stack    │
│  Tailwind CSS    │              │  Nginx + SSL     │
└──────────────────┘              └────────┬─────────┘
                                           │
                      ┌────────────────────┼────────────────┐
                      │                    │                │
                      ▼                    ▼                ▼
           ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
           │  Nginx Reverse   │  │   Backend    │  │  Databases   │
           │     Proxy        │  │   Services   │  │              │
           │  Port: 80/443    │  │              │  │  MySQL 8.1   │
           │                  │  │  • TSS       │  │  Redis 7     │
           │  • SSL/TLS       │  │  • SSO       │  │              │
           │  • Routing       │  │  • Datacore  │  │  Persistent  │
           │  • Load Balance  │  │  • Library   │  │  Volumes     │
           └──────────────────┘  └──────────────┘  └──────────────┘
```

### Component Breakdown

#### **Presentation Tier**
- **Frontend SPA**: React 18 single-page application hosted on Vercel CDN
- **Global Edge Network**: Content delivered from 100+ locations worldwide
- **Custom Domain**: `app.10diemse251.online` with HTTPS

#### **Application Tier**
- **TSS Backend** (Port 10001): Main Spring Boot application with business logic
- **SSO Server** (Port 10003): OAuth2 Authorization Server for authentication
- **Datacore Service** (Port 10005): Academic data provider (departments, courses, users)
- **Library Service** (Port 10006): Digital library and material management

#### **Data Tier**
- **MySQL 8.1**: Relational database for persistent data
- **Redis 7**: In-memory cache for session storage and performance optimization
- **Docker Volumes**: Persistent storage for uploads and library files

#### **Infrastructure**
- **Nginx**: Reverse proxy with SSL/TLS termination
- **Let's Encrypt**: Free SSL certificates with auto-renewal
- **Docker Compose**: Container orchestration for microservices
- **UFW Firewall**: VPS security with minimal port exposure

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 18.3.1 with TypeScript 5.8
- **Build Tool**: Vite 5.4.21 (fast builds, hot module replacement)
- **UI Library**: shadcn/ui + Radix UI Primitives
- **Styling**: Tailwind CSS 3.4.17 with custom design system
- **State Management**: Context API (AuthContext, ThemeContext)
- **Routing**: React Router DOM 6.30.1
- **HTTP Client**: Axios 1.13.1 with interceptors
- **Form Management**: React Hook Form 7.61.1 + Zod 3.25.76 validation
- **Data Fetching**: TanStack Query 5.83.0 (formerly React Query)
- **Icons**: Lucide React 0.462.0
- **Charts**: Recharts 2.15.4
- **Hosting**: Vercel (Edge Network, Global CDN)

### **Backend**
- **Framework**: Spring Boot 3.5.7
- **Language**: Java 17 (Eclipse Temurin OpenJDK)
- **Build Tool**: Maven with Maven Wrapper
- **Security**: Spring Security 6.5.6 + OAuth2 Client
- **Session**: Spring Session with Redis
- **ORM**: Hibernate (via Spring Data JPA)
- **Migrations**: Flyway Database Migrations
- **Validation**: Jakarta Bean Validation
- **Object Mapping**: MapStruct 1.6.2
- **API Docs**: Springdoc-OpenAPI
- **Reverse Proxy**: Nginx Alpine (SSL termination, routing)
- **Hosting**: VPS (1GB RAM, Ubuntu, 103.20.96.46)

### **Database**
- **RDBMS**: MySQL 8.1 (Docker container)
- **Cache**: Redis 7-alpine (session store + caching)
- **Connection Pool**: HikariCP (default in Spring Boot)

### **Infrastructure & DevOps**
- **Containerization**: Docker Compose 1.29.2
- **Domain**: 10diemse251.online (custom domain)
- **SSL/TLS**: Let's Encrypt with Certbot auto-renewal
- **CI/CD**: Vercel (Frontend automated), Manual VPS deployment (Backend)
- **Version Control**: Git + GitHub
- **Monitoring**: Docker logs, Spring Boot Actuator
- **Firewall**: UFW (Uncomplicated Firewall)

### **External Services (Simulated)**
- **SSO**: HCMUT-SSO-MIMIC (OAuth 2.0 Authorization Server)
- **Datacore**: HCMUT-DATACORE-MIMIC (Academic data REST API)
- **Library**: HCMUT-LIBRARY-MIMIC (Digital library REST API)

---

## 🚀 Getting Started

### Prerequisites

**Required Software:**
- **Node.js**: v18.x or higher ([Download](https://nodejs.org/))
- **Java**: JDK 17 ([Download](https://adoptium.net/))
- **Docker Desktop**: For running databases ([Download](https://www.docker.com/products/docker-desktop/))
- **Git**: For cloning repository ([Download](https://git-scm.com/))

**Optional:**
- **Maven**: (Maven Wrapper included in project)
- **VS Code**: Recommended IDE with extensions
  - Java Extension Pack
  - Spring Boot Extension Pack
  - ESLint
  - Prettier

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/MinhTrinhh/LA_SE_SEM251.git
cd LA_SE_SEM251
```

#### 2. Start Infrastructure (MySQL + Redis)

```bash
# Start Docker containers
docker-compose up -d

# Verify containers are running
docker ps
```

You should see:
- `hcmut-tss-mysql-db` (port 3306)
- `hcmut-tss-redis` (port 6379)

#### 3. Start Backend Services (4 terminals)

**Terminal 1 - SSO Server (Port 10003)**
```bash
cd HCMUT-SSO-MIMIC
./mvnw spring-boot:run
```

**Terminal 2 - Datacore Server (Port 10005)**
```bash
cd HCMUT-DATACORE-MIMIC
./mvnw spring-boot:run
```

**Terminal 3 - Library Server (Port 10006)**
```bash
cd HCMUT-LIBRARY-MIMIC
./mvnw spring-boot:run
```

**Terminal 4 - TSS Backend (Port 10001)**
```bash
cd HCMUT-TSS-Backend
./mvnw spring-boot:run
```

Wait for all services to show `"Started Application in X seconds"` message.

#### 4. Start Frontend (Port 10004)

**Terminal 5 - React Frontend**
```bash
cd HCMUT-TSS-Frontend
npm install        # First time only
npm run dev
```

#### 5. Access the Application

Open your browser and navigate to:
- **Frontend**: [http://localhost:10004](http://localhost:10004)
- **Backend API**: [http://localhost:10001](http://localhost:10001)
- **SSO Login**: [http://localhost:10003](http://localhost:10003)

### Alternative: Automated Scripts (Windows PowerShell)

For Windows users, we provide automation scripts:

```powershell
# Interactive development menu
.\scripts\dev-menu.ps1

# Or start all services at once
.\scripts\start-all.ps1

# Check service status
.\scripts\check-status.ps1

# Stop all services
.\scripts\stop-all.ps1
```

See [scripts/README.md](./scripts/README.md) for detailed documentation.

### Alternative: VS Code Tasks

1. Open project in VS Code
2. Press `Ctrl+Shift+P` → `Tasks: Run Task`
3. Select `Start All Services`

This creates 5 integrated terminals inside VS Code.

---

## 🌐 Production Deployment

The system is currently deployed in production:

### **Live URLs**
- **Frontend**: [https://app.10diemse251.online](https://app.10diemse251.online)
- **Backend API**: [https://10diemse251.online/api/](https://10diemse251.online/api/)
- **SSO**: [https://10diemse251.online/oauth2/authorization/sso-server](https://10diemse251.online/oauth2/authorization/sso-server)

### **Infrastructure**
- **Frontend Hosting**: Vercel Edge Network (Global CDN)
- **Backend Hosting**: VPS (103.20.96.46, Ubuntu, Docker)
- **Domain**: 10diemse251.online (custom domain)
- **SSL/TLS**: Let's Encrypt (auto-renewal)
- **Reverse Proxy**: Nginx Alpine

### **Deployment Architecture**

```
Frontend (Vercel)
├── Automatic deployments from GitHub main branch
├── Preview deployments for pull requests
├── Global CDN (100+ edge locations)
└── Custom domain: app.10diemse251.online

Backend (VPS)
├── Docker Compose orchestration
├── 7 containers: nginx, tss-backend, sso, datacore, library, mysql, redis
├── Nginx reverse proxy with SSL termination
├── Let's Encrypt SSL certificates
└── Manual deployment via git pull + docker rebuild
```

### **Port Allocation**

| Service | Port | Protocol | Access |
|---------|------|----------|--------|
| Nginx | 80, 443 | HTTP/HTTPS | Public |
| TSS Backend | 10001 | HTTP | Via Nginx |
| SSO Server | 10003 | HTTP | Via Nginx |
| Datacore | 10005 | HTTP | Internal |
| Library | 10006 | HTTP | Internal |
| MySQL | 3306 | TCP | Internal |
| Redis | 6379 | TCP | Internal |

For detailed deployment documentation, see [PRODUCTION_DEPLOYMENT_REPORT.md](./docs/PRODUCTION_DEPLOYMENT_REPORT.md).

---

## 👥 Mock Users

The system includes pre-configured test accounts for development and demonstration:

### **Login Credentials**
- **Email**: Any of the users listed below
- **Password**: `pass` (for all accounts)

### **Students (Role: STUDENT)**

| Email | ID | Name | Program | Department |
|-------|-----|------|---------|------------|
| an.nguyen@hcmut.edu.vn | 2110001 | An Van Nguyen | Computer Science (UG) | CSE |
| binh.le@hcmut.edu.vn | 2110002 | Binh Minh Le | Chemical Engineering (UG) | CHE |
| chi.tran@hcmut.edu.vn | 2010003 | Chi Thi Tran | Data Science (Grad) | CSE |
| dung.pham@hcmut.edu.vn | 2210004 | Dung Huu Pham | Civil Engineering (UG) | FME |
| giang.vo@hcmut.edu.vn | 1910005 | Giang Thanh Vo | Telecommunications (Grad) | CHE |

### **University Staff**

| Email | ID | Name | Position | Department | System Role |
|-------|-----|------|----------|------------|-------------|
| thanh.nguyen@hcmut.edu.vn | 5001 | Thanh Cong Nguyen | Professor | CSE | **TUTOR** |
| hang.vu@hcmut.edu.vn | 5002 | Hang Thu Vu | Dept. Secretary | CSE | **COOPERATOR** |
| long.dinh@hcmut.edu.vn | 5003 | Long Bao Dinh | Lecturer | CHE | **TUTOR** |
| phuong.mai@hcmut.edu.vn | 5004 | Phuong Anh Mai | Researcher | FME | **TUTOR** |
| tuan.ly@hcmut.edu.vn | 5005 | Tuan Anh Ly | Academic Advisor | FME | **ADMINISTRATOR** |

### **Department Codes**
- **CSE**: Computer Science & Engineering
- **CHE**: Chemical Engineering
- **FME**: Faculty of Mechanical Engineering (Civil Engineering)

### **Internal API Keys**

For service-to-service communication (development only):
```
DATACORE_API_KEY=YourVeryStrongAndSecretKeyHere12345
```

---

## 📖 API Documentation

### **Authentication Flow (OAuth2)**

The system uses OAuth2 Authorization Code flow for secure authentication:

```
1. User clicks "Login" → Redirects to SSO Server
2. User enters credentials → SSO validates
3. SSO redirects back with authorization code
4. Backend exchanges code for access token
5. Session created (stored in Redis)
6. User authenticated with SESSION cookie
```

### **API Endpoints**

#### **Authentication**
```
GET  /auth/me              - Get current user info
POST /auth/logout          - Logout and clear session
GET  /oauth2/authorization/sso-server - Initiate SSO login
```

#### **Course Management**
```
GET    /api/courses             - List all courses
POST   /api/courses             - Create new course (Tutor)
GET    /api/courses/{id}        - Get course details
PATCH  /api/courses/{id}        - Update course (Tutor)
DELETE /api/courses/{id}        - Delete course (Tutor)
```

#### **Course Registration**
```
GET    /api/course-registrations/me     - Get my enrollments
POST   /api/course-registrations/enroll - Enroll in course
DELETE /api/course-registrations/{id}   - Unenroll from course
```

#### **Sessions**
```
GET    /api/sessions              - List all sessions
POST   /api/sessions              - Create session (Tutor)
GET    /api/sessions/{id}         - Get session details
PATCH  /api/sessions/{id}         - Update session (Tutor)
DELETE /api/sessions/{id}         - Cancel session (Tutor)
GET    /api/sessions/class/{classId} - Get sessions by class
```

#### **Session Enrollment**
```
GET    /api/session-enrollments/user/{userId}     - Get user's sessions
POST   /api/session-enrollments/join              - Join session
DELETE /api/session-enrollments/{sessionId}/leave - Leave session
```

#### **Materials**
```
GET    /api/courses/{courseId}/materials        - List materials
POST   /api/courses/{courseId}/materials/upload - Upload file (Tutor)
POST   /api/courses/{courseId}/materials/add-library-ref - Add library reference
DELETE /api/materials/{id}                       - Delete material (Tutor)
GET    /api/materials/{id}/download             - Download material
```

#### **Feedback**
```
GET    /api/feedback                           - List feedback (Admin)
POST   /api/feedback                           - Submit feedback (Student)
GET    /api/feedback/session/{sessionId}       - Get session feedback
```

#### **Evaluation**
```
GET    /api/evaluation/tutor/{tutorId}         - Get tutor evaluation
POST   /api/evaluation                         - Submit evaluation (Admin)
```

#### **External Services**
```
# DATACORE (Internal)
GET    /datacore/users/{id}                    - Get user info
GET    /datacore/courses                       - Get course catalog
GET    /datacore/departments                   - Get departments

# LIBRARY (Internal)
GET    /api/library/items                      - Search library items
GET    /api/library/items/{id}                 - Get library item
GET    /api/library/items/{id}/download        - Download library file
```

For interactive API documentation (when running locally):
- **Swagger UI**: [http://localhost:10001/swagger-ui.html](http://localhost:10001/swagger-ui.html)

---

## 📁 Project Structure

```
LA_SE_SEM251/
│
├── HCMUT-TSS-Frontend/              # React Frontend (Port 10004)
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   ├── pages/                   # Page components (routes)
│   │   ├── contexts/                # React Context providers
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # Utility functions
│   │   └── types/                   # TypeScript type definitions
│   ├── public/                      # Static assets
│   ├── package.json                 # NPM dependencies
│   ├── vite.config.ts               # Vite configuration
│   ├── tailwind.config.ts           # Tailwind CSS config
│   └── tsconfig.json                # TypeScript config
│
├── HCMUT-TSS-Backend/               # Main Backend (Port 10001)
│   ├── src/main/
│   │   ├── java/org/minhtrinh/hcmuttssbackend/
│   │   │   ├── config/              # Spring configurations
│   │   │   ├── controller/          # REST API controllers
│   │   │   ├── service/             # Business logic
│   │   │   ├── repository/          # Database repositories
│   │   │   ├── entity/              # JPA entities
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── mapper/              # MapStruct mappers
│   │   │   └── exception/           # Custom exceptions
│   │   └── resources/
│   │       ├── application.properties           # Base config
│   │       ├── application-prod.properties      # Production config
│   │       └── db/migration/        # Flyway SQL scripts
│   ├── uploads/materials/           # User-uploaded files
│   ├── pom.xml                      # Maven dependencies
│   └── Dockerfile                   # Docker image definition
│
├── HCMUT-SSO-MIMIC/                 # SSO Server (Port 10003)
│   ├── src/main/
│   │   ├── java/                    # OAuth2 Authorization Server
│   │   └── resources/
│   │       ├── users.json           # Mock user database
│   │       └── application.properties
│   └── pom.xml
│
├── HCMUT-DATACORE-MIMIC/            # Datacore Service (Port 10005)
│   ├── src/main/
│   │   ├── java/
│   │   │   └── service/DatacoreService.java  # Hardcoded data
│   │   └── resources/
│   └── pom.xml
│
├── HCMUT-LIBRARY-MIMIC/             # Library Service (Port 10006)
│   ├── src/main/
│   │   ├── java/                    # Library REST API
│   │   └── resources/
│   ├── storage/                     # Library file storage
│   └── pom.xml
│
├── scripts/                         # Development automation (Windows)
│   ├── dev-menu.ps1                 # Interactive menu
│   ├── start-all.ps1                # Start all services
│   ├── stop-all.ps1                 # Stop all services
│   ├── check-status.ps1             # Health checks
│   └── README.md
│
├── docs/                            # Documentation
│   ├── PRODUCTION_DEPLOYMENT_REPORT.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── CLASS_DIAGRAM_REPORT.md
│   └── ...
│
├── docker-compose.yaml              # Development containers (MySQL + Redis)
├── docker-compose.prod.yaml         # Production deployment config
├── nginx.conf                       # Nginx reverse proxy config
└── README.md                        # This file
```

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository** and create a new branch
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes** following our coding standards:
   - **Frontend**: ESLint + Prettier configuration
   - **Backend**: Spring Boot best practices, Java code conventions

3. **Test your changes** thoroughly:
   - Run all services locally
   - Test OAuth2 flow end-to-end
   - Verify database migrations (Flyway)
   - Check CORS and API integration

4. **Commit with descriptive messages**:
```bash
git commit -m "Feature: Add session conflict detection"
```

5. **Push and create Pull Request**:
```bash
git push origin feature/your-feature-name
```

### Code Standards

**Frontend (TypeScript + React)**
- Use functional components with hooks
- Implement proper TypeScript types (no `any`)
- Follow component composition patterns
- Use React Hook Form for forms
- Apply Tailwind CSS utility classes

**Backend (Java + Spring Boot)**
- Follow MVC architecture: Controller → Service → Repository
- Use DTOs for API requests/responses
- Implement MapStruct for object mapping
- Write Flyway migrations for schema changes
- Apply proper exception handling

### Database Migrations

When adding new tables or modifying schema:

1. Create Flyway migration script:
```sql
-- src/main/resources/db/migration/V3__add_notifications_table.sql
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

2. Create JPA Entity:
```java
@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private String message;
    private LocalDateTime createdAt;
}
```

3. Restart backend - Flyway runs migrations automatically

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

- **Repository**: [github.com/MinhTrinhh/LA_SE_SEM251](https://github.com/MinhTrinhh/LA_SE_SEM251)
- **Issues**: [GitHub Issues](https://github.com/MinhTrinhh/LA_SE_SEM251/issues)
- **Documentation**: [docs/](./docs/)

---

## 🙏 Acknowledgments

- **HCMUT**: Ho Chi Minh City University of Technology
- **Spring Boot Team**: For the excellent backend framework
- **Vercel**: For free frontend hosting and CDN
- **Let's Encrypt**: For free SSL certificates
- **shadcn/ui**: For beautiful, accessible UI components

---

## 📊 Quick Tech Summary

**Frontend**
- React 18.3 + TypeScript 5.8 + Vite 5.4
- shadcn/ui + Tailwind CSS 3.4
- React Router 6.30 + TanStack Query 5.83
- Axios 1.13 + React Hook Form 7.61
- **Hosting**: Vercel Edge Network

**Backend**
- Spring Boot 3.5.7 + Java 17
- Spring Security 6.5 + OAuth2 Client
- Spring Session + Redis
- MapStruct 1.6 + Flyway Migrations
- **Hosting**: VPS (Docker Compose)

**Infrastructure**
- MySQL 8.1 + Redis 7
- Nginx Alpine (Reverse Proxy)
- Docker Compose 1.29
- Let's Encrypt SSL
- **Domain**: 10diemse251.online

**DevOps**
- Vercel (Frontend CI/CD)
- Git + GitHub
- Docker + Docker Compose
- UFW Firewall

---

**Made with ❤️ by HCMUT Students**


























