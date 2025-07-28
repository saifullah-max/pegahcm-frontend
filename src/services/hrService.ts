export interface CreateOnboardingPayload {
    employeeId: string;
    assignedHRId: string;
    startDate: string;
    notes?: string;
    status?: string; // e.g., 'In Progress', 'Pending'
}

export interface OnboardingDataType {
    employee: { id: string; fullName: string };
    assignedHR: { id: string; fullName: string };
    startDate: string;
    notes?: string;
    status?: string;
}

export interface HREmployee {
    id: string;
    userId: string;
    user: {
        id: string;
        fullName: string;
        email: string;
        username: string;
    };
    department?: {
        name: string;
    } | null;
    subDepartment?: {
        name: string;
    } | null;
    designation?: string;
}
export interface OnboardingProcess {
    id: string;
    startDate: string;
    notes?: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    createdAt: string;
    employee: {
        id: string;
        user: {
            fullName: string;
        };
    };
    assignedHR: {
        id: string; // ✅ Add this
        fullName: string;
    };
}

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        throw new Error('Authentication token not found');
    }

    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

// Helper function to handle authentication errors
const handleAuthError = (error: any) => {
    if (error.message?.includes('invalid token') || error.message?.includes('expired token')) {
        // Clear the invalid token
        localStorage.removeItem('token');
        // Redirect to login page
        window.location.href = '/login';
    }
    throw error;
};

export const createOnboardingProcess = async (
    payload: CreateOnboardingPayload
): Promise<any> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/hr`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });

        if (response.status === 401) {
            throw new Error('invalid or expired token');
        }

        const data = await response.json();

        if (!response.ok) {
            // return the actual error message from the backend
            throw new Error(data.message || 'Failed to create onboarding process');
        }

        return data;
    } catch (error) {
        console.error('Error creating onboarding process:', error);
        throw error; // ← re-throw to handle it in the form
    }
};

// services/hrService.ts or wherever relevant
export const fetchAllHREmployees = async (): Promise<HREmployee[]> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/hr/all`, {
            method: 'GET',
            headers: getAuthHeaders(),
        })

        if (response.status === 401) {
            throw new Error('invalid or expired token');
        }
        if (response.status === 403) {
            throw new Error('invalid or expired token');
        }

        if (!response.ok) {
            throw new Error('Failed to fetch HR employees');
        }

        const data = await response.json();
        console.log("Data from all HRS:", data);
        return data;

    } catch (error) {
        console.error('Error fetching HR employees:', error);
        return handleAuthError(error);
    }
};

export const fetchAllOnboardingProcesses = async (): Promise<OnboardingProcess[]> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/hr/onboarding`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error('invalid or expired token');
        }

        if (!response.ok) {
            throw new Error('Failed to fetch onboarding processes');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching onboarding processes:', error);
        return handleAuthError(error);
    }
};

export const getOnboardingById = async (id: string): Promise<OnboardingProcess> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/hr/onboarding/${id}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error('invalid or expired token');
        }

        if (!response.ok) {
            throw new Error('Failed to fetch onboarding details');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching onboarding details:', error);
        return handleAuthError(error);
    }
};

export const updateOnboardingProcess = async (
    id: string,
    payload: CreateOnboardingPayload
): Promise<any> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/hr/onboarding/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error('invalid or expired token');
        }

        if (!response.ok) {
            throw new Error('Failed to update onboarding process');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating onboarding process:', error);
        return handleAuthError(error);
    }
};

export const deleteOnboardingProcess = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/hr/onboarding/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error('invalid or expired token');
        }

        if (!response.ok) {
            throw new Error('Failed to delete onboarding process');
        }
    } catch (error) {
        console.error('Error deleting onboarding process:', error);
        return handleAuthError(error);
    }
};