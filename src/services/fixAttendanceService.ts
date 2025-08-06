export type FixAttendanceRequestPayload = {
    date: string; // ✅ Add this line
    attendanceRecordId?: string;
    requestType: 'CheckIn' | 'CheckOut' | 'Both';
    requestedCheckIn?: string;
    requestedCheckOut?: string;
    requestedBreaks?: string;
    reason: string;
    employeeId: string;
};

export type AttendanceFixFormData = {
    date: string;
    requestType: 'CheckIn' | 'CheckOut' | 'Both' | '';
    expectedClockIn: string;
    expectedClockOut: string;
    reason: string;
    employeeId: string
};

export interface FixRequest {
    id: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    reason: string;
    requestType: 'CheckIn' | 'CheckOut' | 'Both';
    requestedAt: string;
    reviewedBy?: {
        fullName: string;
    };
    employee: {
        user: {
            fullName: string;
        };
    };
    attendanceRecord?: {
        date: string;
    };
    requestedCheckIn?: string;
    requestedCheckOut?: string;
    requestedBreaks?: string;
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

export const submitFixAttendanceRequest = async (payload: FixAttendanceRequestPayload) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/fix-attendance`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit attendance fix request');
        }

        return await response.json();
    } catch (error) {
        console.error('Submit Fix Request Error:', error);
        return handleAuthError(error);
    }
};


export const getAllFixRequests = async (): Promise<FixRequest[]> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/fix-attendance`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) throw new Error('Failed to fetch attendance fix requests');

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Get Fix Requests Error:', error);
        return handleAuthError(error);
    }
};

export const updateFixRequestStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/fix-attendance/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ id, status }),
        });

        if (!response.ok) throw new Error('Failed to update fix request status');

        return await response.json();
    } catch (error) {
        console.error('Update Fix Request Status Error:', error);
        return handleAuthError(error);
    }
};

export const getFixRequestsByEmployee = async (employeeId: string): Promise<FixRequest[]> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/fix-attendance/${employeeId}`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch employee fix requests');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Get Employee Fix Requests Error:', error);
        return handleAuthError(error);
    }
};

export const editFixRequest = async (id: string, payload: Partial<FixRequest>) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/fix-attendance/edit/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to edit fix request');
        }

        return await response.json();
    } catch (error) {
        console.error('Edit Fix Request Error:', error);
        return handleAuthError(error);
    }
};

export const deleteFixRequest = async (id: string) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/fix-attendance/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete fix request');
        }

        return await response.json();
    } catch (error) {
        console.error('Delete Fix Request Error:', error);
        return handleAuthError(error);
    }
};

export const getFixRequestById = async (id: string): Promise<FixRequest> => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/fix-attendance/single/${id}`, {
        headers: getAuthHeaders(),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch fix request');
    }

    return await res.json();
};
