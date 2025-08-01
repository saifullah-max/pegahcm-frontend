export interface CreatePermissionData {
    module: string;
    action: string;
    description?: string;
}

export interface Permission {
    id: string;
    module: string;
    action: string;
    description?: string;
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

export const createPermission = async (
    data: CreatePermissionData
): Promise<Permission> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/permissions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (response.status === 401) throw new Error('invalid or expired token');
        if (!response.ok) throw new Error('Failed to create permission');

        return await response.json();
    } catch (error) {
        console.error('Error creating permission:', error);
        return handleAuthError(error);
    }
};

export const getAllPermissions = async (): Promise<Permission[]> => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/permissions`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (res.status === 401) throw new Error('invalid or expired token');
        if (!res.ok) throw new Error('Failed to fetch permissions');

        return await res.json();
    } catch (error) {
        return handleAuthError(error);
    }
};

export const assignUserPermissions = async (
    userId: string,
    permissionIds: string[]
): Promise<void> => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/permissions/user`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ userId, permissionIds }),
        });

        if (res.status === 401) throw new Error('invalid or expired token');
        if (!res.ok) throw new Error('Failed to assign permissions');
    } catch (error) {
        return handleAuthError(error);
    }
};

export interface SubRole {
    id: string;
    name: string;
    description?: string;
}

export const assignSubRolePermissions = async (
    subRoleId: string,
    permissionIds: string[]
): Promise<void> => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/sub-roles/permission`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ subRoleId, permissionIds }),
        });

        if (res.status === 401) throw new Error('invalid or expired token');
        if (!res.ok) throw new Error('Failed to assign sub-role permissions');
    } catch (error) {
        return handleAuthError(error);
    }
};

export const getSubRolePermissions = async (subRoleId: string): Promise<string[]> => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/permissions/sub-role/${subRoleId}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (res.status === 401) throw new Error('invalid or expired token');
        if (!res.ok) throw new Error('Failed to fetch sub-role permissions');

        return await res.json();
    } catch (error) {
        return handleAuthError(error);
    }
};

export const updateSubRolePermissions = async (
    subRoleId: string,
    permissionIds: string[]
): Promise<void> => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/permissions/sub-role/${subRoleId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ subRoleId, permissionIds }),
        });

        if (res.status === 401) throw new Error('invalid or expired token');
        if (!res.ok) throw new Error('Failed to update sub-role permissions');
    } catch (error) {
        return handleAuthError(error);
    }
};

export const getPermissionsOfUser = async (userId: string): Promise<string[]> => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/permissions/user/${userId}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (res.status === 401) throw new Error('invalid or expired token');
        if (!res.ok) throw new Error('Failed to fetch user permissions');

        return await res.json();
    } catch (error) {
        return handleAuthError(error);
    }
};

export const getUserById = async (userId: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/permissions/user/${userId}`, {
        headers: getAuthHeaders(),
    });

    if (!res.ok) throw new Error('Failed to fetch user');
    return await res.json();
};


// impersonateRoute
export const impersonateUser = async (userId: string): Promise<string> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/impersonate/${userId}`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        if (response.status === 401) throw new Error('invalid or expired token');
        if (!response.ok) throw new Error('Failed to impersonate user');

        const { token } = await response.json();
        return token;
    } catch (error) {
        console.error('Error impersonating user:', error);
        return handleAuthError(error);
    }
};
