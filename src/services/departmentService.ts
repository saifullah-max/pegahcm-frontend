interface SubDepartment {
  id: string;
  name: string;
  departmentId: string;
}

export interface Department {
  id: string;
  name: string;
  subDepartments: SubDepartment[];
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

// Get all departments
export const getDepartments = async (): Promise<Department[]> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/departments`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch departments');
    }

    const data = await response.json();
    let departmentsArray: any[] = [];
    
    // Handle the specific structure from the API
    if (data.success && Array.isArray(data.data)) {
      departmentsArray = data.data;
    } else if (data.data && data.data.departments) {
      departmentsArray = data.data.departments;
    } else if (Array.isArray(data)) {
      departmentsArray = data;
    } else if (data.departments && Array.isArray(data.departments)) {
      departmentsArray = data.departments;
    } else {
      return [];
    }
    
    // Ensure each department has the expected structure
    return departmentsArray.map(dept => {
      // Make sure subDepartments is always an array
      if (!dept.subDepartments) {
        dept.subDepartments = [];
      } else if (!Array.isArray(dept.subDepartments)) {
        dept.subDepartments = [];
      }
      
      return dept as Department;
    });
  } catch (error) {
    return handleAuthError(error);
  }
};

// Get department by ID
export const getDepartmentById = async (id: string): Promise<Department> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/departments/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch department');
    }

    const data = await response.json();
    return data.data.department;
  } catch (error) {
    return handleAuthError(error);
  }
};

// Get sub-departments by department ID
export const getSubDepartmentsByDepartmentId = async (departmentId: string): Promise<SubDepartment[]> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/departments/${departmentId}/sub-departments`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch sub-departments');
    }

    const data = await response.json();
    
    // Handle the specific structure from the API
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    } else if (data.data && data.data.subDepartments) {
      return data.data.subDepartments;
    } else if (Array.isArray(data)) {
      return data;
    } else if (data.subDepartments && Array.isArray(data.subDepartments)) {
      return data.subDepartments;
    } else if (data.success && data.data && data.data.subDepartments && Array.isArray(data.data.subDepartments)) {
      return data.data.subDepartments;
    } else {
      return [];
    }
  } catch (error) {
    return handleAuthError(error);
  }
};

// Create a new department
export const createDepartment = async (name: string): Promise<Department> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/departments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name })
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to create department');
    }

    const data = await response.json();
    return data.data.department;
  } catch (error) {
    return handleAuthError(error);
  }
};

// Create a new sub-department
export const createSubDepartment = async (departmentId: string, name: string): Promise<SubDepartment> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/departments/${departmentId}/sub-departments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name })
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to create sub-department');
    }

    const data = await response.json();
    return data.data.subDepartment;
  } catch (error) {
    return handleAuthError(error);
  }
};

// Export the SubDepartment interface for reuse
export type { SubDepartment };
