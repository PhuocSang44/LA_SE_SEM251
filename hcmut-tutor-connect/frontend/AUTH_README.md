# Authentication System - HCMUT Tutor Connect

## Tổng quan

Hệ thống xác thực đã được tích hợp với 3 vai trò (roles):
- **Admin**: Quản lý hệ thống và tài khoản
- **Tutor**: Gia sư - có thể giảng dạy và có thêm quyền hơn Student
- **Student**: Sinh viên - tìm kiếm và đăng ký khóa học

## Cấu trúc hệ thống

### 1. Authentication Context (`src/contexts/AuthContext.tsx`)
- Quản lý trạng thái đăng nhập
- Lưu JWT token và thông tin user trong localStorage
- Cung cấp hooks `useAuth()` để truy cập thông tin user ở bất kỳ component nào

### 2. Protected Routes (`src/components/ProtectedRoute.tsx`)
- Bảo vệ các trang yêu cầu đăng nhập
- Kiểm tra quyền truy cập dựa trên role
- Tự động redirect về trang login nếu chưa đăng nhập
- Redirect về trang unauthorized nếu không có quyền

### 3. Pages

#### Login Page (`/login`)
- Cho phép chọn 1 trong 3 role: Admin/Tutor/Student
- Giao diện thân thiện với icon và mô tả cho mỗi role

#### SSO Page (`/sso`)
- Trang giả lập SSO để nhập credentials
- Hiển thị role đã chọn
- Sau này sẽ tích hợp API backend thực tế

#### Admin Dashboard (`/admin`)
- Chỉ Admin mới truy cập được
- UI riêng biệt để quản lý hệ thống, user, courses

#### Home & Other Pages
- Các trang khác dùng chung cho Tutor và Student
- UI được điều chỉnh dựa trên role của user

## Cách sử dụng

### 1. Đăng nhập
```
1. Truy cập http://localhost:5173/login
2. Chọn role (Admin/Tutor/Student)
3. Nhấn "Tiếp tục"
4. Nhập email và password bất kỳ (chế độ giả lập)
5. Hệ thống sẽ redirect về trang Home
```

### 2. Kiểm tra authentication trong component

```typescript
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return (
    <div>
      <p>Welcome {user?.name}!</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### 3. Tạo Protected Route với role cụ thể

```typescript
// Trong App.tsx
<Route 
  path="/admin-only-page" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminOnlyPage />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/tutor-student-page" 
  element={
    <ProtectedRoute allowedRoles={['tutor', 'student']}>
      <TutorStudentPage />
    </ProtectedRoute>
  } 
/>
```

## Flow đăng nhập

```
1. User visit any protected page
   ↓
2. Not authenticated? → Redirect to /login
   ↓
3. User selects role
   ↓
4. Redirect to /sso with selected role
   ↓
5. User enters credentials
   ↓
6. Mock JWT token generated (later: API call)
   ↓
7. Token & user info saved to localStorage
   ↓
8. Redirect to home page
   ↓
9. ProtectedRoute checks token → Allow access
```

## Tích hợp Backend (Tương lai)

Khi có API backend, cần cập nhật trong `SSO.tsx`:

```typescript
// Thay thế phần mock này:
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    // Call real API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      login(data.token, data.user);
      navigate('/');
    } else {
      toast({
        title: "Lỗi đăng nhập",
        description: data.message,
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: "Lỗi",
      description: "Không thể kết nối đến server",
      variant: "destructive",
    });
  }
};
```

## Navbar Dynamic Menu

Navbar hiện tại tự động hiển thị menu items dựa trên role:
- **Admin**: Home, Admin Panel
- **Tutor/Student**: Home, Dashboard, My Courses, Available Courses

## Logout

Người dùng có thể logout bằng cách:
1. Click vào avatar ở góc phải navbar
2. Chọn "Đăng xuất"
3. Token và user info sẽ bị xóa khỏi localStorage
4. Redirect về trang login

## Storage

- **JWT Token**: `localStorage.getItem('jwt_token')`
- **User Info**: `localStorage.getItem('user_info')` (JSON string)

## Security Notes

⚠️ **Quan trọng**: 
- Hiện tại đang dùng mock authentication
- JWT token chưa được validate với backend
- Cần implement token refresh mechanism
- Cần thêm token expiration check
- Nên encrypt sensitive data trong localStorage
- Implement HTTPS cho production

## Demo Credentials

Vì đang ở chế độ giả lập, bạn có thể dùng bất kỳ email/password nào để đăng nhập.

Ví dụ:
- Admin: admin@hcmut.edu.vn / admin123
- Tutor: tutor@hcmut.edu.vn / tutor123  
- Student: student@hcmut.edu.vn / student123
