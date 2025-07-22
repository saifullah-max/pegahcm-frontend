interface UserData {
    id: string;
    fullName: string;
    email: string;
    roleId: string;
    status: string;
    dateJoined: string;
    phoneNumber?: number;
}

interface EmployeeData {
    id: string;
    employeeNumber: string;
    designation: string;
    departmentId: string;
    subDepartmentId: string;
    gender: string;
    fatherName: string;
    address: string;
    salary: string;
    dateOfBirth: string;
    hireDate: string;
    profileImage: string | null;
    skills: string[];
    workLocation: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    documents: any[];
    shiftId?: string;
}

export interface SingleEmployeeResponse {
    user: UserData;
    employee: EmployeeData;
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

export const getEmployeeById = async (id: string): Promise<SingleEmployeeResponse> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (response.status === 401) {
            throw new Error('invalid or expired token');
        }

        if (!response.ok) {
            throw new Error('Failed to fetch employee');
        }

        const data = await response.json();
        return data.data; // ✅ return both user and employee
    } catch (error) {
        console.error(`Error fetching employee with ID ${id}:`, error);
        return handleAuthError(error);
    }
};