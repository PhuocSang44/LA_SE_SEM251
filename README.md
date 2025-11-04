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

cách chạy mở 4 terminals 
./mvnw clean
./mvnw spring-boot:run -X
npm run dev
Ctrl C

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

-Hoàn thiện lưu người dùng vào trong DB (tạo thêm bảng Student và University Staff -> tham khảo ERD + RM) lưu hoàn thiện thông tin (VƯƠNG + QUỐC)

-Hiện thực tính năng tạo Course(Prerequisite hardcode trong DATACORE) Course trong hệ thống chỉ lưu những thông tin cơ bản (ERD RM) (VƯƠNG + QUỐC)

-Hiện thực tính năng đăng kí Course (VƯƠNG + QUỐC)

-Hiện thực tính năng schedule/reschedule/cancel sessions tutor (LONG + VŨ)

-Hiện thực tính năng đăng kí/huỷ tham gia session tutor (LONG + VŨ)

-tính năng up tài liệu và download tài liệu (hiện thực thêm LIBRARY) (LONG + VŨ)

-tính năng feedback (SANG + PHÁT)

-tính năng evaluation (SANG + PHÁT)

-lấy dữ liệu feedback evaluation (SANG + PHÁT)

protect route trong FE bằng user_role (hiện tại cooperator == administrator)

QUAN TRỌNG: DỮ LIỆU VÀ TUPLE JSON NHẬN VÀO TRẢ RA GIỮA CÁC APPLICATIONS PHẢI ĐỒNG NHẤT MỚI CHẠY ĐƯỢC

























