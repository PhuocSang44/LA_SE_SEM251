// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom'; // 1. Import Outlet
import { useAuth, UserRole } from '@/contexts/AuthContext';

// 2. Define the props. 'children' is no longer needed.
interface ProtectedRouteProps {
    allowedRoles?: UserRole[]; // Optional array of allowed roles
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    // 4. Loading state check
    if (isLoading) {
        return <div>Loading...</div>; // Or a full-page spinner
    }

    // 5. Authentication check
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 6. Authorization (Role) check
    if (allowedRoles && allowedRoles.length > 0) {
        if (!user || !allowedRoles.includes(user.role)) {
            // User is logged in but doesn't have the right role
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // 7. If all checks pass, render the <Outlet />
    // This tells React Router to render the matched child route
    return <Outlet />;
};

export default ProtectedRoute;