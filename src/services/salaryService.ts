export interface Allowance {
    type: string;
    amount: number;
}

export interface Salary {
    id: string;
    employeeId: string;
    baseSalary: number;
    allowances?: Allowance[]; // updated type
    deductions: number;
    bonuses: number;
    totalPay: number;
    effectiveFrom: string;
    effectiveTo?: string;
    createdBy: string;
    updatedBy?: string;
    createdAt: string;
    updatedAt: string;
}

// helpers/authHelpers.ts
const handleAuthError = (error: any) => {
    if (error.message?.includes('invalid token') || error.message?.includes('expired token')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
    throw error;
};

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

export const getAllSalaries = async (): Promise<Salary[]> => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/salary`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        if (res.status === 401) throw new Error('invalid or expired token');
        if (!res.ok) throw new Error('Failed to fetch salaries');
        const data = await res.json();
        return data.data as Salary[];
    } catch (err) {
        console.error('Error fetching salaries:', err);
        return handleAuthError(err);
    }
};

export const createSalary = async (salaryData: Partial<Salary>): Promise<Salary> => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/salary`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(salaryData),
        });
        if (res.status === 401) throw new Error('invalid or expired token');
        if (!res.ok) throw new Error('Failed to create salary');
        const data = await res.json();
        return data.data as Salary;
    } catch (err) {
        console.error('Error creating salary:', err);
        return handleAuthError(err);
    }
};

export const deleteSalary = async (id: string): Promise<void> => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/salary/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (res.status === 401) throw new Error('invalid or expired token');
        if (!res.ok) throw new Error('Failed to delete salary');
    } catch (err) {
        console.error('Error deleting salary:', err);
        handleAuthError(err);
    }
};

export const updateSalary = async (id: string, salaryData: Partial<Salary>): Promise<Salary> => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/salary/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(salaryData),
        });
        if (res.status === 401) throw new Error('invalid or expired token');
        if (!res.ok) throw new Error('Failed to update salary');
        const data = await res.json();
        return data.data as Salary;
    } catch (err) {
        console.error('Error updating salary:', err);
        return handleAuthError(err);
    }
};

export const getMySalary = async (): Promise<Salary[]> => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/salary/my`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        if (res.status === 401) throw new Error('invalid or expired token');
        if (!res.ok) throw new Error('Failed to fetch my salary');
        const data = await res.json();
        return data.data as Salary[];
    } catch (err) {
        console.error('Error fetching my salary:', err);
        return handleAuthError(err);
    }
};

// incase of no change for next month salary
export const copyPreviousSalaryForEmployee = async (employeeId: string): Promise<Salary> => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/salary/copy/${employeeId}`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (res.status === 401) throw new Error('invalid or expired token');
        if (!res.ok) throw new Error('Failed to copy previous salary');
        const data = await res.json();
        return data.data as Salary;
    } catch (err) {
        console.error('Error copying previous salary:', err);
        return handleAuthError(err);
    }
};

// salary Slip from backend
export const downloadSalarySlip = async (employeeId: string, month?: string): Promise<void> => {
    try {
        const query = month ? `?month=${encodeURIComponent(month)}` : '';
        const res = await fetch(`${import.meta.env.VITE_API_URL}/salary/download/${employeeId}${query}`, {
            method: 'GET',
            headers: {
                ...getAuthHeaders(),  // adds token
                'Accept': 'application/pdf'
            }
        });

        if (res.status === 401) throw new Error('invalid or expired token');
        if (!res.ok) throw new Error('Failed to download salary slip');

        // Convert response to Blob
        const blob = await res.blob();

        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Payslip_${employeeId}.pdf`; // you can pass employeeNumber if available
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

    } catch (err) {
        console.error('Error downloading salary slip:', err);
        handleAuthError(err);
    }
};
