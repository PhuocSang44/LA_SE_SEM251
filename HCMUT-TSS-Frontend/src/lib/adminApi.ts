import { api } from './api';

export interface AdminUser {
    userId: number;
    email: string;
    firstName: string;
    middleName: string;
    lastName: string;
    userType: 'STUDENT' | 'STAFF';
    status: 'ACTIVE' | 'BANNED';
    departmentName: string;
    role: string;
    studentId?: string;
    major?: string;
    academicLevel?: string;
    staffId?: string;
    position?: string;
}

export interface ActivityLog {
    logId: number;
    userId: number;
    userEmail: string;
    userName: string;
    action: string;
    entityType: string;
    entityId: number;
    description: string;
    createdAt: string;
}

export const adminApi = {
    // Get all users
    getAllUsers: async (): Promise<AdminUser[]> => {
        const response = await api.get('/api/admin/users');
        return response.data;
    },

    // Delete a user
    deleteUser: async (userId: number): Promise<void> => {
        await api.delete(`/api/admin/users/${userId}`);
    },

    // Ban a user
    banUser: async (userId: number): Promise<void> => {
        await api.patch(`/api/admin/users/${userId}/ban`);
    },

    // Unban a user
    unbanUser: async (userId: number): Promise<void> => {
        await api.patch(`/api/admin/users/${userId}/unban`);
    },

    // Get all activity logs
    getAllLogs: async (): Promise<ActivityLog[]> => {
        const response = await api.get('/api/admin/logs');
        return response.data;
    },
};
