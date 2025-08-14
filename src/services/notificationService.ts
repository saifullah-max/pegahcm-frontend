// types/Notification.ts
export interface UserNotification {
    id: string;
    userId: string;
    read: boolean;
    readAt?: string;
    notification: Notification;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
    departmentId?: string;
    subDepartmentId?: string;
    employeeId?: string;
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

// export const getNotifications = async (): Promise<Notification[]> => {
//     try {
//         const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
//             method: 'GET',
//             headers: getAuthHeaders(),
//         });

//         console.log("NOTIFICATIONS RES:", response);

//         if (response.status === 401) throw new Error('invalid or expired token');
//         if (!response.ok) throw new Error('Failed to fetch notifications');

//         // 👇 backend sends notifications directly, not wrapped in `data`
//         const result = await response.json();
//         return result as Notification[];
//     } catch (error) {
//         console.error('Error fetching notifications:', error);
//         return handleAuthError(error);
//     }
// };

// Create a type for paginated response
export interface PaginatedNotifications {
    data: UserNotification[];
    totalPages: number;
}

export const getVisibleNotificationsForUser = async (
    page = 1,
    limit = 10
): Promise<PaginatedNotifications> => {
    try {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/notifications/visible?page=${page}&limit=${limit}`,
            {
                method: 'GET',
                headers: getAuthHeaders(),
            }
        );

        if (response.status === 401) throw new Error('invalid or expired token');
        if (!response.ok) throw new Error('Failed to fetch visible notifications');

        const result = await response.json();
        return result as PaginatedNotifications;
    } catch (error) {
        console.error('Error fetching visible notifications:', error);
        return { data: [], totalPages: 1 }; // fallback to avoid crashing
    }
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/${id}/read`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
        });

        if (response.status === 401) throw new Error('invalid or expired token');
        if (!response.ok) throw new Error('Failed to mark notification as read');
    } catch (error) {
        console.error('Error marking notification as read:', error);
        handleAuthError(error);
    }
};

export const markGroupNotificationsAsRead = async (
    title: string,
    message: string,
    type: string
): Promise<void> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/mark-group`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ title, message, type }),
        });

        if (response.status === 401) throw new Error('invalid or expired token');
        if (!response.ok) throw new Error('Failed to mark group notifications as read');
    } catch (error) {
        console.error('Error marking group notifications as read:', error);
        handleAuthError(error);
    }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/all`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
        });

        if (response.status === 401) throw new Error('invalid or expired token');
        if (!response.ok) throw new Error('Failed to mark all notifications as read');
    } catch (error) {
        console.error('Error marking all as read:', error);
        handleAuthError(error);
    }
};
