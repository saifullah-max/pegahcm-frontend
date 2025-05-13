export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
}

interface RoleResponse {
  success: boolean;
  message?: string;
  data: {
    roles: Role[];
  };
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

// Get all roles
export const getRoles = async (): Promise<Role[]> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/roles`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch roles');
    }

    const data: RoleResponse = await response.json();
    
    // Handle different API response formats
    if (data.data && Array.isArray(data.data.roles)) {
      return data.data.roles;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data as unknown as Role[];
    } else if (Array.isArray(data)) {
      return data as unknown as Role[];
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching roles:', error);
    return handleAuthError(error);
  }
};

// Get role by ID
export const getRoleById = async (id: string): Promise<Role> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/roles/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch role');
    }

    const data = await response.json();
    return data.data.role;
  } catch (error) {
    console.error(`Error fetching role with ID ${id}:`, error);
    return handleAuthError(error);
  }
};

// Create a new role
export const createRole = async (roleData: Omit<Role, 'id'>): Promise<Role> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/roles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(roleData)
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to create role');
    }

    const data = await response.json();
    return data.data.role;
  } catch (error) {
    console.error('Error creating role:', error);
    return handleAuthError(error);
  }
};

// Update an existing role
export const updateRole = async (id: string, roleData: Partial<Role>): Promise<Role> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/roles/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(roleData)
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to update role');
    }

    const data = await response.json();
    return data.data.role;
  } catch (error) {
    console.error(`Error updating role with ID ${id}:`, error);
    return handleAuthError(error);
  }
};

// Delete a role
export const deleteRole = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/roles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to delete role');
    }
  } catch (error) {
    console.error(`Error deleting role with ID ${id}:`, error);
    handleAuthError(error);
  }
};
