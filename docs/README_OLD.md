## 🚀 Quick Start

### Option 1: VS Code Integrated Terminals (Recommended for Development)

**Run services inside VS Code terminals** - easier to view logs and debug:

1. Press `Ctrl+Shift+P` (Command Palette)
2. Type: `Tasks: Run Task`
3. Select: `Start All Services`

This creates 4 separate terminals in VS Code, one for each service. Perfect for development!

### Option 2: External PowerShell Windows

**Run services in separate windows** - better for multiple monitors:

```powershell
.\scripts\start-all.ps1
```

### Option 3: Interactive Development Menu

```powershell
.\scripts\dev-menu.ps1
```
Opens an interactive menu with all development commands.

---

### Other Useful Commands

**Check Service Status**
```powershell
.\scripts\check-status.ps1
```

**Stop All Services**
```powershell
.\scripts\stop-all.ps1
```

**Restart Individual Service**
```powershell
.\scripts\restart-service.ps1 backend   # or sso, datacore, frontend
```

📚 **For detailed development guide, see [scripts/DEV_GUIDE.md](./scripts/DEV_GUIDE.md)**

---

## � Project Structure

```
LA_SE_SEM251/
├── scripts/                    # 🆕 Development automation scripts
│   ├── dev-menu.ps1           # Interactive menu (⭐ Start here!)
│   ├── start-all.ps1          # Start all services
│   ├── stop-all.ps1           # Stop all services
│   ├── check-status.ps1       # Check service status
│   ├── restart-service.ps1    # Restart single service
│   ├── view-logs.ps1          # View logs helper
│   ├── DEV_GUIDE.md           # Complete development guide
│   └── README.md              # Scripts documentation
│
├── HCMUT-SSO-MIMIC/           # SSO Server (Port 10003)
├── HCMUT-DATACORE-MIMIC/      # Datacore Server (Port 10005)
├── HCMUT-TSS-Backend/         # Main Backend (Port 10001)
└── HCMUT-TSS-Frontend/        # React Frontend (Port 10004)
```

---

## 📋 Architecture Overview

Thì hiện tại cái project mình sẽ có 4 server đang chạy.
Sẽ phải thêm vô 1 server nữa tên là Library để retrieve materials cho các course

khi vào dự án thì TSS sẽ là ứng dụng chính của mình
nhóm mình sử dụng maven là build tool để chạy các applications
./mvnw spring:boot:run -X để chạy và đọc log

SSO thì tui đã code xong hết rồi mấy ông không cần quan tâm
Cái mọi người cần làm là API giữa DATACORE và TSS và FE

Hiện tại tui đã manage account oke mọi người có thể đăng nhập vào đăng xuất ra 
-> bắt buộc nhập lại mật khẩu 
nếu chỉ xoá tab trên browser thì chỉ cần tải lại thì sẽ vẫn lưu SESSION 
-> STATEFUL
mọi người có thể xoá cookie trong browser để test -> bắt buộc đăng nhập lại nếu reload trang

nhóm mình sử dụng MYSQL để lưu dữ liệu và REDIS để lưu TSS Application Session cái JSESSIONID là của SSO

khi tạo thêm bảng vào DATABASE phải viết script .sql trước thêm vào thư mục db.migration rồi tạo @Entity và Repository để mapping vào relation/table trong DATABASE->tìm hiểu flyway

<img width="414" height="124" alt="Screenshot 2025-11-04 at 19 51 01" src="https://github.com/user-attachments/assets/a91715f0-481f-4bac-84da-86702845a887" />

flow làm việc là @RestController sẽ giao tiếp với nhau này là thằng sẽ đọc hiểu HTTP request sau đó
@Service sẽ là thằng handle tất cả logic, thằng @Service sẽ sử dụng @Mapper để sử dụng DTO (trả và nhận dữ liệu từ bên ngoài vào), @Repository để quản lý DATABASE

<img width="274" height="458" alt="Screenshot 2025-11-04 at 19 54 27" src="https://github.com/user-attachments/assets/e3fbc303-835b-4539-8d8e-3c1ad8b1e013" />

Hiện taị tui chỉ mới tạo 1 cái bảng USER thôi với UserController là cái API chưa hoạt động tui viết để mấy ông hiểu cái flow mà DATACORE và TSS giao tiếp với nhau
->phải thêm Hardcoded Data vào trong DATACORE
->phải thêm @Entity và Repository và Script logic trong TSS

các thông tin cấu hình đều nằm trong application.properties (cấu hình application) pom.xml (dependency & maven plugins) docker-compose.yaml (chạy database)

---

## 🛠️ Manual Start (Alternative)

Nếu không muốn dùng script tự động, có thể mở 4 terminals thủ công:

```powershell
# Terminal 1 - SSO (Port 10003)
cd HCMUT-SSO-MIMIC
./mvnw spring-boot:run

# Terminal 2 - Datacore (Port 10005)
cd HCMUT-DATACORE-MIMIC
./mvnw spring-boot:run

# Terminal 3 - TSS Backend (Port 10001)
cd HCMUT-TSS-Backend
./mvnw spring-boot:run

# Terminal 4 - Frontend (Port 10004)
cd HCMUT-TSS-Frontend
npm run dev
```

Để dừng: `Ctrl + C` trong mỗi terminal

---

## 🎯 Service Ports

| Service | Port | URL |
|---------|------|-----|
| TSS Backend | 10001 | http://localhost:10001 |
| SSO Server | 10003 | http://localhost:10003 |
| TSS Frontend | 10004 | http://localhost:10004 |
| Datacore | 10005 | http://localhost:10005 |
| MySQL | 10000 | localhost:10000 |
| Redis | 10002 | localhost:10002 |

---

<img width="1170" height="769" alt="Screenshot 2025-11-04 at 20 03 13" src="https://github.com/user-attachments/assets/b09b094e-ac69-4488-81d7-62e81663aff9" />




<img width="1169" height="767" alt="Screenshot 2025-11-04 at 20 06 55" src="https://github.com/user-attachments/assets/1bf10f92-3bad-44b1-975a-977b82f864af" />

hiện tại dữ liệu của user đang là hardcoded
lưu ở 2 nơi khác biệt nhau
- users.json trong SSO và DatacoreService trong DATACORE

<img width="1074" height="994" alt="Screenshot 2025-11-04 at 20 08 47" src="https://github.com/user-attachments/assets/a2dc55b9-d235-426d-8409-f48fe2177605" />
<img width="1728" height="1021" alt="Screenshot 2025-11-04 at 20 09 17" src="https://github.com/user-attachments/assets/593a8561-1afb-4bba-9f3b-392bb20967a4" />

->thông tin phải đồng nhất (sửa bằng tay) phải thêm user để hiện thực thêm tính năng

trong FE tui đã làm AuthContext và Profile 

NHIỆM VỤ HIỆN TẠI

-Hoàn thiện lưu người dùng vào trong DB (tạo thêm bảng Student và University Staff -> tham khảo ERD + RM) lưu hoàn thiện thông tin (VƯƠNG + QUỐC) (3 ngày)

-Hiện thực tính năng tạo Course(Prerequisite hardcode trong DATACORE) Course trong hệ thống chỉ lưu những thông tin cơ bản (ERD RM) (VƯƠNG + QUỐC) (3 ngày)

-Hiện thực tính năng đăng kí Course (VƯƠNG + QUỐC) (3 ngày)

-Hiện thực tính năng schedule/reschedule/cancel sessions tutor (LONG + VŨ) (3 ngày)

-Hiện thực tính năng đăng kí/huỷ tham gia session tutor (LONG + VŨ) (3 ngày)

-tính năng up tài liệu và download tài liệu (hiện thực thêm LIBRARY) (LONG + VŨ) (3 ngày)

-tính năng feedback (SANG + PHÁT)

-tính năng evaluation (SANG + PHÁT)

-lấy dữ liệu feedback evaluation (SANG + PHÁT)

protect route trong FE bằng user_role (hiện tại cooperator == administrator)

QUAN TRỌNG: DỮ LIỆU VÀ TUPLE JSON NHẬN VÀO TRẢ RA GIỮA CÁC APPLICATIONS PHẢI ĐỒNG NHẤT MỚI CHẠY ĐƯỢC

DEADLINE ĐỌC HIỂU CODE LÀ HẾT THỨ 7 sau đó sẽ bắt tay vào code làm theo từng phần, 2 người/phần

làm phần nào thì vào vẽ ERD và RM phần đó (vẽ thêm vào để hoàn thiện và hiện thực)

link Sheet: https://docs.google.com/spreadsheets/d/1BhJfF3xaPIYVZtvTy55Cjk9PK278R5m_zCideKBOugM/edit?gid=0#gid=0

## Mock Credentials

### HCMUT-SSO-MIMIC (Authentication Service)
**Password cho tất cả users:** `pass`

**Available Users:**
- an.nguyen@hcmut.edu.vn
- binh.le@hcmut.edu.vn  
- chi.tran@hcmut.edu.vn
- dung.pham@hcmut.edu.vn
- giang.vo@hcmut.edu.vn
- thanh.nguyen@hcmut.edu.vn
- hang.vu@hcmut.edu.vn
- long.dinh@hcmut.edu.vn
- phuong.mai@hcmut.edu.vn
- tuan.ly@hcmut.edu.vn

### HCMUT-DATACORE-MIMIC (Data Service)
**Internal API Key:** `YourVeryStrongAndSecretKeyHere12345`

**Chi tiết tài khoản và role** (xem trong `DatacoreService.java`):

**Students (Type: STUDENT):**
- an.nguyen@hcmut.edu.vn - ID: 2110001 - An Van Nguyen - Computer Science (Undergraduate) - CSE Dept
- binh.le@hcmut.edu.vn - ID: 2110002 - Binh Minh Le - Chemical Engineering (Undergraduate) - CHE Dept  
- chi.tran@hcmut.edu.vn - ID: 2010003 - Chi Thi Tran - Data Science (Graduate) - CSE Dept
- dung.pham@hcmut.edu.vn - ID: 2210004 - Dung Huu Pham - Civil Engineering (Undergraduate) - FME Dept
- giang.vo@hcmut.edu.vn - ID: 1910005 - Giang Thanh Vo - Telecommunications (Graduate) - CHE Dept

**University Staff (Type: STAFF):**
- thanh.nguyen@hcmut.edu.vn - ID: 5001 - Thanh Cong Nguyen - Professor - CSE Dept - **Role: TUTOR**
- hang.vu@hcmut.edu.vn - ID: 5002 - Hang Thu Vu - Department Secretary - CSE Dept - **Role: COOPERATOR**
- long.dinh@hcmut.edu.vn - ID: 5003 - Long Bao Dinh - Lecturer - CHE Dept - **Role: TUTOR**
- phuong.mai@hcmut.edu.vn - ID: 5004 - Phuong Anh Mai - Researcher - FME Dept - **Role: TUTOR**
- tuan.ly@hcmut.edu.vn - ID: 5005 - Tuan Anh Ly - Academic Advisor - FME Dept - **Role: ADMINISTRATOR**

**Departments:**
- CSE: Computer Science & Engineering
- CHE: Chemical Engineering  
- FME: Civil Engineering

*Note: Thông tin này được lưu trong `users.json` (SSO) và `DatacoreService.java` (DATACORE). Tất cả password đều được hash bằng BCrypt với plain text là "secret".* ---> ??


























