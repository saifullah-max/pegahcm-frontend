// types/Notification.ts
export interface Notification {
    id: string;
    userId: string;
    message: string;
    title: string;
    createdAt: string;
    read: boolean;
    employeeId?: string;
    subDepartmentId?: string;
    departmentId?: string;
    visibilityLevel?: number;
}


// Helper function to handle authentication errors
const handleAuthError = (error: any) => {
    if (error.message?.includes('invalid token') || error.message?.includes('expired token')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
    throw error;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        throw new Error('Authentication token not found');
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getNotifications = async (): Promise<Notification[]> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        console.log("NOTIFICATIONS RES:", response);

        if (response.status === 401) throw new Error('invalid or expired token');
        if (!response.ok) throw new Error('Failed to fetch notifications');

        // 👇 backend sends notifications directly, not wrapped in `data`
        const result = await response.json();
        return result as Notification[];
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return handleAuthError(error);
    }
};

export const getVisibleNotificationsForUser = async (): Promise<Notification[]> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/visible`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (response.status === 401) throw new Error('invalid or expired token');
        if (!response.ok) throw new Error('Failed to fetch visible notifications');

        const result = await response.json();
        return result as Notification[];
    } catch (error) {
        console.error('Error fetching visible notifications:', error);
        return handleAuthError(error);
    }
};
