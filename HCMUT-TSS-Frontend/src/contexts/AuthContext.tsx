import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback
} from 'react';
import { api }from '@/lib/api';

// Interface for the raw data from the backend (matches Java DTO)
interface BackendUserDto {
    officialID: string;
    email: string;
    firstName: string;
    middleName: string;
    lastName: string;
    userType: string; // This will be "student", "administrator", etc.
    departmentName: string;
}

// --- UPDATED ---
// UserRole type now matches your backend strings
export type UserRole = 'administrator' | 'tutor' | 'student' | 'cooperator';

// Frontend User interface
export interface User {
    officialId: string;
    email: string;
    name: string;
    role: UserRole; // Mapped from UserType
    departmentName: string;
}

// Context type
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    refetchUser: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- UPDATED ---
// Helper function to safely map backend string to frontend type
const mapToUserRole = (roleString: string): UserRole => {
    // Check if the string from the backend is one of the valid UserRole types
    if (roleString === 'administrator' ||
        roleString === 'tutor' ||
        roleString === 'student' ||
        roleString === 'cooperator') {
        return roleString;
    }

    // Fallback for any unexpected values
    console.warn(`Unknown user role received: ${roleString}. Defaulting to 'student'.`);
    return 'student'; // Default fallback role
};

// Helper function to combine name parts
const combineName = (first: string, middle: string, last: string): string => {
    return [first, middle, last].filter(Boolean).join(' ');
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * This function asks the backend "who am I?".
     */
    const refetchUser = useCallback(async () => {
        try {
            // 1. Fetch data expecting the BackendUserDto type
            const response = await api.get<BackendUserDto>('/auth/me');
            const backendUser = response.data;

            // 2. Transform backend data to frontend User interface
            const frontendUser: User = {
                officialId: backendUser.officialID,
                email: backendUser.email,
                name: combineName(backendUser.firstName, backendUser.middleName, backendUser.lastName),
                role: mapToUserRole(backendUser.userType), // Use the updated mapper
                departmentName: backendUser.departmentName,
            };

            // 3. Set the transformed user in state
            setUser(frontendUser);

        } catch (error) {
            setUser(null);
        }
    }, []);

    /**
     * This function calls the backend logout endpoint.
     */
    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setUser(null);
        }
    }, []);

    // On initial app load, run the auth check once
    useEffect(() => {
        setIsLoading(true);
        refetchUser().finally(() => {
            setIsLoading(false);
        });
    }, [refetchUser]);

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                refetchUser,
                logout
            }}
        >
            {isLoading ? null : children}
        </AuthContext.Provider>
    );
};

// Hook remains the same
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};