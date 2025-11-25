# Admin Feature Implementation Summary

## Overview
Implemented a comprehensive admin dashboard that allows administrators to manage users and view activity logs in the HCMUT TSS system.

## Features Implemented

### 1. User Management
- **View All Users**: Display complete list of users (students and staff) with their details
- **Ban/Unban Users**: Temporarily restrict user access to the system
- **Delete Users**: Permanently remove users from the system
- **Search & Filter**: Filter users by type, status, department

### 2. Activity Logging
- **View All Logs**: Monitor all system activities and user actions
- **Search Logs**: Filter logs by user, action type, or description
- **Detailed Information**: Track who did what, when, and on which entity

## Backend Changes

### Database Schema Updates

#### Migration V6: User Status
```sql
ALTER TABLE `USER` ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
```

#### Migration V7: Staff Position and Role
```sql
ALTER TABLE university_staff ADD COLUMN position VARCHAR(100);
ALTER TABLE university_staff ADD COLUMN role VARCHAR(50);
```

### New Entities & Enums

1. **UserStatus Enum** (`UserStatus.java`)
   - `ACTIVE`: User can access the system
   - `BANNED`: User is temporarily blocked

2. **Enhanced UniversityStaff Entity**
   - Added `position` field (e.g., "Academic Advisor")
   - Added `role` field (e.g., "ADMINISTRATOR", "TUTOR", "COOPERATOR")

### DTOs Created

1. **AdminUserResponse** (`AdminUserResponse.java`)
   - Complete user information for admin view
   - Includes student-specific fields (studentId, major, academicLevel)
   - Includes staff-specific fields (staffId, position, role)

2. **ActivityLogResponse** (`ActivityLogResponse.java`)
   - Log entry with user details
   - Action, entity type, and description

3. **Updated RecvDatacoreDto**
   - Added `position` and `role` fields to receive from DATACORE

### New Service Layer

**AdminService** (`AdminService.java`)
- `getAllUsers()`: Fetch all users with detailed information
- `deleteUser(userId, adminUserId)`: Delete user and log action
- `banUser(userId, adminUserId)`: Ban user and log action
- `unbanUser(userId, adminUserId)`: Unban user and log action
- `getAllActivityLogs()`: Retrieve all activity logs sorted by date
- `logActivity()`: Helper to create activity log entries

### New Controller

**AdminController** (`AdminController.java`)

Endpoints:
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/{userId}` - Delete a user
- `PATCH /api/admin/users/{userId}/ban` - Ban a user
- `PATCH /api/admin/users/{userId}/unban` - Unban a user
- `GET /api/admin/logs` - Get all activity logs

Authorization: All endpoints check if user has ADMINISTRATOR or COOPERATOR role

## Frontend Changes

### New API Service

**adminApi.ts** (`src/lib/adminApi.ts`)
- Type-safe API calls for admin operations
- Interfaces: `AdminUser`, `ActivityLog`
- Methods: `getAllUsers`, `deleteUser`, `banUser`, `unbanUser`, `getAllLogs`

### New Components

1. **UserManagement** (`src/components/UserManagement.tsx`)
   - Data table with all users
   - Ban/Unban/Delete actions with confirmation dialogs
   - Real-time refresh functionality
   - Color-coded status badges (ACTIVE = green, BANNED = red)
   - Role and department information display

2. **LogsViewer** (`src/components/LogsViewer.tsx`)
   - Searchable activity log table
   - Filter by action type
   - Formatted timestamps
   - User information display
   - Entity details

### Updated Pages

**AdminDashboard** (`src/pages/AdminDashboard.tsx`)
- Tabbed interface with two sections:
  - **User Management Tab**: View and manage all users
  - **Activity Logs Tab**: Monitor system activities
- Clean, professional UI using shadcn/ui components

### Existing Infrastructure

- **Navbar**: Already configured to show "Admin Panel" link for administrators
- **ProtectedRoute**: Already implements role-based access control
- **App.tsx**: Already has `/admin` route protected for administrators

## Access Control

### Who Can Access Admin Features?
Users with these UserTypes:
- `ADMINISTRATOR`
- `COOPERATOR`

### Test Account
```
Email: tuan.ly@hcmut.edu.vn
Password: pass
Name: Tuan Anh Ly
Role: ADMINISTRATOR
Department: FME Dept
```

## How to Test

### 1. Start All Services
```powershell
# Use VS Code task or manual start
cd HCMUT-TSS-Backend
./mvnw spring-boot:run

cd HCMUT-TSS-Frontend
npm run dev
```

### 2. Login as Administrator
1. Navigate to `http://localhost:10004`
2. Click "Login"
3. Use credentials: `tuan.ly@hcmut.edu.vn` / `pass`

### 3. Access Admin Dashboard
- Click "Admin Panel" in navigation bar
- Or navigate directly to `http://localhost:10004/admin`

### 4. Test User Management
1. **View Users**: See the complete list of all users
2. **Ban User**: 
   - Click "Ban" on any user (except yourself)
   - Confirm the action
   - User status changes to "BANNED"
3. **Unban User**:
   - Click "Unban" on a banned user
   - User status returns to "ACTIVE"
4. **Delete User**:
   - Click "Delete" on any user (except yourself)
   - Confirm the destructive action
   - User is permanently removed

### 5. Test Activity Logs
1. Switch to "Activity Logs" tab
2. See all logged activities (login, ban, delete, etc.)
3. Use search box to filter logs
4. Use dropdown to filter by action type

## Safety Features

1. **Cannot Delete Self**: Admins cannot delete their own account
2. **Cannot Ban Self**: Admins cannot ban themselves
3. **Confirmation Dialogs**: All destructive actions require confirmation
4. **Activity Logging**: All admin actions are logged with:
   - Who performed the action
   - What action was performed
   - When it happened
   - On which entity

## UI Components Used

From shadcn/ui:
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- `Button`
- `Badge`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `AlertDialog` (for confirmations)
- `Input` (for search)

## Future Enhancements (Not Implemented)

Based on the use case diagram, these could be added:
1. **Set Configurations**: System settings management
2. **Configure tutor-student matching algorithm**: Algorithm settings
3. **Configure API endpoints/tokens**: API management
4. **Review logs**: Advanced log filtering and export
5. **Manage User Accounts Status**: Bulk operations

## Notes

- The system uses optimistic UI updates (refresh after actions)
- All API calls include proper error handling
- Loading states are shown during data fetching
- The admin role check is performed on both frontend (routing) and backend (API)
