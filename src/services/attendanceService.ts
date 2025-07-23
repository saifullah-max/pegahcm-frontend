export interface LeaveType {
    id: string;
    name: string;
    description?: string;
    isPaid: boolean;
}

interface CreateLeaveTypeData {
    name: string;
    description?: string;
    isPaid?: boolean;
}

interface SubmitLeaveRequestData {
    leaveId: string;
    startDate: string;
    endDate: string;
    reason: string;
    approvedById?: string; // Optional
}

export interface LeaveRequest {
    id: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    leaveType: {
        name: string;
    };
}

export interface AdminLeaveRequest {
    id: string;
    startDate: string;
    endDate: string;
    reason: string;
    requestedAt: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    leaveType: {
        name: string;
    };
    employee: {
        user: {
            fullName: string;
        };
    };
    approvedBy?: {
        fullName: string;
    };
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

// Create a new LeaveType
export const createLeaveType = async (leaveData: CreateLeaveTypeData): Promise<LeaveType> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/attendance/leave-type`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(leaveData),
        });

        if (response.status === 401) {
            throw new Error('invalid or expired token');
        }

        if (!response.ok) {
            throw new Error('Failed to create leave type');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating leave type:', error);
        return handleAuthError(error);
    }
};

export const getLeaveTypes = async (): Promise<LeaveType[]> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/attendance/leave-type`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (response.status === 401) {
            throw new Error('invalid or expired token');
        }

        if (!response.ok) {
            throw new Error('Failed to fetch leave types');
        }

        const result = await response.json();
        return result.data as LeaveType[];
    } catch (error) {
        console.error('Error fetching leave types:', error);
        return handleAuthError(error);
    }
};

// submit leave req
export const submitLeaveRequest = async (data: SubmitLeaveRequestData) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/attendance/leave`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (response.status === 401) {
            throw new Error('invalid or expired token');
        }

        if (!response.ok) {
            throw new Error('Failed to submit leave request');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error submitting leave request:', error);
        return handleAuthError(error);
    }
};

// leaves by an employee
export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/attendance/leave`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (response.status === 401) throw new Error('invalid or expired token');
        if (!response.ok) throw new Error('Failed to fetch leave requests');

        const result = await response.json();
        return result.data as LeaveRequest[];
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        return handleAuthError(error);
    }
};

// All requests for admin
export const getAllAdminLeaveRequests = async (): Promise<AdminLeaveRequest[]> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/leave-requests`, {
            headers: getAuthHeaders(),
        });

        if (response.status === 401) throw new Error('invalid or expired token');
        if (!response.ok) throw new Error('Failed to fetch admin leave requests');

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error fetching admin leave requests:', error);
        return handleAuthError(error);
    }
};

// approve - reject leave request
export const updateLeaveStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    const token = localStorage.getItem('token');

    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/leave-requests/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
    });

    if (!res.ok) {
        throw new Error('Failed to update leave request status');
    }

    return res.json();
};
