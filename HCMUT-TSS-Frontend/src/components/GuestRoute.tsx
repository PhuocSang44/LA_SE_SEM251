// src/components/GuestRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.tsx'; // Use your auth context

const GuestRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    // 1. Wait until the auth check is complete
    if (isLoading) {
        return <div>Loading...</div>; // Or a full-page spinner
    }

    // 2. If user IS authenticated, redirect them away from the login page
    if (isAuthenticated) {
        // Redirect to your main dashboard or home page
        return <Navigate to="/dashboard" replace />;
    }

    // 3. If user is NOT authenticated, show the page (e.g., the Login component)
    return <Outlet />;
};

export default GuestRoute;