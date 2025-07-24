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
    phoneNumber: string;
    status: string;
    shift: string | null;
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

interface AttendanceRecord {
    id: string;
    employeeId: string;
    date: Date;
    status: string;
    clockIn: string;
    clockOut: string;
    shiftId: string;
    absenceReason: string
    // Add other fields if needed
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
        console.log(data);
        return data.data; // ✅ return both user and employee
    } catch (error) {
        console.error(`Error fetching employee with ID ${id}:`, error);
        return handleAuthError(error);
    }
};

// attendance check in
export const checkInAttendance = async (userId: string, shiftId: string): Promise<void> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/attendance/check-in`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ shiftId })
        });

        if (response.status === 401) {
            throw new Error('invalid or expired token');
        }

        if (!response.ok) {
            throw new Error('Failed to check in attendance');
        }
    } catch (error) {
        console.error(`Error checking in attendance for employee ID ${userId}:`, error);
        return handleAuthError(error);
    }
};

// attendance check out
export const checkOutAttendance = async (): Promise<void> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/attendance/check-out`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        if (response.status === 401) {
            throw new Error('invalid or expired token');
        }

        if (!response.ok) {
            throw new Error('Failed to check out attendance');
        }
    } catch (error) {
        console.error('Error checking out attendance:', error);
        return handleAuthError(error);
    }
};

// attendance check for today
// get today's attendance
export const getTodayAttendance = async (): Promise<{ checkedIn: boolean; checkedOut: boolean; attendance?: any; }> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/attendance/today`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (response.status === 401) {
            throw new Error('invalid or expired token');
        }

        if (!response.ok) {
            throw new Error('Failed to fetch today\'s attendance');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching today\'s attendance:', error);
        return handleAuthError(error);
    }
};

// get all todays attendances
export const fetchTodayPresentCount = async () => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/attendance/all`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        const data = await res.json();

        const today = new Date().toISOString().slice(0, 10);

        const presentStatuses = ["Present", "Late Arrival", "Early Departure"];

        const presentToday = data.filter((record: AttendanceRecord) => {
            const recordDate = new Date(record.date).toISOString().slice(0, 10); // ✅ fix here
            return (
                recordDate === today && presentStatuses.includes(record.status)
            );
        });

        console.log("Employees Present Today:", presentToday.length);
        return presentToday;
    } catch (error) {
        console.error("Error fetching attendance:", error);
    }
};