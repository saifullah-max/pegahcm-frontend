export interface SubmitResignationPayload {
    employeeId: string;
    resignationDate: string;     // ISO string (e.g., "2025-08-01")
    lastWorkingDay: string;      // ISO string
    reason: string;
}

export interface Resignation {
    id: string;
    employeeId: string;
    resignationDate: string;
    lastWorkingDay: string;
    reason: string;
    status: string;
    clearanceStatus: string;
    assetReturnStatus: string;
    reviewComments: string | null;
    processedById: string | null;
    processedAt: string | null;

    employee: {
        user: {
            fullName: string;
            email: string;
        };
    };
    processedBy: {
        fullName: string;
        email: string;
    } | null;
}

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

// API call to submit a resignation
export const submitResignation = async (payload: SubmitResignationPayload) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/employees/resignation/apply`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });

        if (response.status === 401) {
            throw new Error('invalid or expired token');
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Resignation failed: ${response.status} ${response.statusText}. ${errorText}`);
        }

        const data = await response.json();
        return data; // contains submitted resignation
    } catch (error) {
        console.error('Error submitting resignation:', error);
        return handleAuthError(error);
    }
};

// fetch all resignations
export const getAllResignations = async (): Promise<Resignation[]> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/hr/resignation/all`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (response.status === 401) {
            throw new Error('invalid or expired token');
        }

        if (!response.ok) {
            throw new Error('Failed to fetch resignations');
        }

        const data = await response.json();
        return data.data; // assuming backend returns { data: [...] }
    } catch (error) {
        console.error('Error fetching resignations:', error);
        return handleAuthError(error);
    }
};

// approve or reject resignation
export const processResignation = async (
    id: string,
    status: 'Approved' | 'Rejected',
    processedById: String,
    remarks: string
) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/hr/resignation/process/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status, processedById, remarks }),
        });

        if (response.status === 401) throw new Error('invalid or expired token');

        // ⛔️ Check for 403 and extract message
        if (response.status === 403) {
            const errorData = await response.json();
            throw new Error(errorData.message); // This will be caught below
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Resignation processing failed: ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error processing resignation:', error);
        throw error; // Let the caller handle it
    }
};


// Get single resignation
export const getResignationById = async (id: string): Promise<Resignation> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/hr/resignation/${id}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (response.status === 401) {
            throw new Error('invalid or expired token');
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch resignation: ${response.statusText}. ${errorText}`);
        }

        const data = await response.json();
        return data.data; // assuming backend returns { data: resignation }
    } catch (error) {
        console.error('Error fetching resignation by ID:', error);
        return handleAuthError(error);
    }
};

// GET - my resignation
export const getMyResignation = async (): Promise<Resignation> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/hr/user/my`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch resignation');
    }

    const data = await response.json();
    return data.data;
};


// update resignation - if pending
export const updateResignation = async (
    id: string,
    payload: { reason: string; lastWorkingDay: string }
) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/hr/resignation/edit/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });

        if (response.status === 401) throw new Error('invalid or expired token');

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update resignation: ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating resignation:', error);
        return handleAuthError(error);
    }
};

// delete resignation - if pending
export const deleteResignation = async (id: string) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/hr/resignation/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (response.status === 401) throw new Error('invalid or expired token');

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete resignation: ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error deleting resignation:', error);
        return handleAuthError(error);
    }
};

// Update the clearance and asset return - HR only
export const updateClearanceAndAssetStatus = async (
    id: string,
    payload: {
        clearanceStatus: string;
        assetReturnStatus: string;
        status: string;
        reviewComments?: string;
    }
) => {
    try {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/hr/resignation/edit/${id}`,
            {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            }
        );

        if (response.status === 401) throw new Error('invalid or expired token');

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update clearance/asset/status: ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating clearance/asset/status:', error);
        return handleAuthError(error);
    }
};
