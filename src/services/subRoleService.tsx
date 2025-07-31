// interfaces
export interface SubRole {
    id: string;
    name: string;
    description?: string;
    permissions?: { permission: { id: string; module: string; action: string } }[];
    users?: any[]; // update if user structure is known
}

export interface CreateSubRoleData {
    name: string;
    description?: string;
    permissionIds?: string[];
}

export interface UpdateSubRoleData {
    name?: string;
    description?: string;
    permissionIds?: string[];
}

// helpers
const handleAuthError = (error: any) => {
    if (
        error.message?.includes('invalid token') ||
        error.message?.includes('expired token')
    ) {
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
        Authorization: `Bearer ${token}`,
    };
};

// base url
const API_URL = import.meta.env.VITE_API_URL;

// 📦 API functions

export const getAllSubRoles = async (): Promise<SubRole[]> => {
    try {
        const response = await fetch(`${API_URL}/sub-roles/all`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (response.status === 401) throw new Error('invalid or expired token');
        if (!response.ok) throw new Error('Failed to fetch subRoles');

        return await response.json();
    } catch (error) {
        console.error('Error fetching subRoles:', error);
        return handleAuthError(error);
    }
};

export const createSubRole = async (data: CreateSubRoleData): Promise<SubRole> => {
    try {
        const response = await fetch(`${API_URL}/sub-roles`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (response.status === 401) throw new Error('invalid or expired token');
        if (!response.ok) throw new Error('Failed to create subRole');

        return await response.json();
    } catch (error) {
        console.error('Error creating subRole:', error);
        return handleAuthError(error);
    }
};

export const updateSubRole = async (
    id: string,
    data: UpdateSubRoleData
): Promise<SubRole> => {
    try {
        const response = await fetch(`${API_URL}/sub-roles/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (response.status === 401) throw new Error('invalid or expired token');
        if (!response.ok) throw new Error('Failed to update subRole');

        return await response.json();
    } catch (error) {
        console.error(`Error updating subRole ID ${id}:`, error);
        return handleAuthError(error);
    }
};

export const deleteSubRole = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/sub-roles/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (response.status === 401) throw new Error('invalid or expired token');
        if (!response.ok) throw new Error('Failed to delete subRole');
    } catch (error) {
        console.error(`Error deleting subRole ID ${id}:`, error);
        handleAuthError(error);
    }
};