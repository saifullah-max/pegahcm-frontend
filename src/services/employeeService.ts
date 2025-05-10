interface EmergencyContact {
  name: string;
  phone: string;
}

interface Document {
  name: string;
  url: string;
  type: string;
}

export interface Employee {
  id: string;
  employeeNumber: string;
  fullName: string;
  email: string;
  designation: string;
  department: string;
  subDepartment: string;
  status: string;
  profileImage: string;
  workLocation: string;
  gender: string;
  address: string;
  emergencyContact: EmergencyContact;
  salary: string;
  skills: string[];
  documents: Document[];
}

interface EmployeeResponse {
  data: {
    employees: Employee[];
  };
}

export interface CreateEmployeeData {
  fullName: string;
  email: string;
  password: string;
  designation: string;
  department: string;
  subDepartment: string;
  workLocation: string;
  gender: string;
  address: string;
  emergencyContact: EmergencyContact;
  salary: string;
  skills: string[];
  status: string;
  documents?: File[];
  profileImage?: File;
  shiftId?: string;
}

// Also export the EmergencyContact interface for reuse
export type { EmergencyContact };

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

// Get all employees
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/employees`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }

    const data: EmployeeResponse = await response.json();
    return data.data.employees;
  } catch (error) {
    console.error('Error fetching employees:', error);
    return handleAuthError(error);
  }
};

// Get employee by ID
export const getEmployeeById = async (id: string): Promise<Employee> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/employees/${id}`, {
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
    return data.data.employee;
  } catch (error) {
    console.error(`Error fetching employee with ID ${id}:`, error);
    return handleAuthError(error);
  }
};

// Create a new employee
export const createEmployee = async (employeeData: CreateEmployeeData): Promise<Employee> => {
  try {
    console.log('Creating employee with data:', employeeData);
    
    // Try JSON approach first as the server might be expecting JSON
    const useFormData = false; // Set to false to use JSON approach
    
    let response;
    
    if (useFormData) {
      // FormData approach
      const formData = new FormData();
      
      // Add all basic employee data
      Object.entries(employeeData).forEach(([key, value]) => {
        if (key !== 'documents' && key !== 'profileImage' && key !== 'emergencyContact' && key !== 'skills' && value !== undefined) {
          formData.append(key, value as string);
        }
      });
      
      // Handle emergency contact
      if (employeeData.emergencyContact) {
        formData.append('emergencyContact.name', employeeData.emergencyContact.name);
        formData.append('emergencyContact.phone', employeeData.emergencyContact.phone);
      }
      
      // Handle skills array
      if (employeeData.skills && employeeData.skills.length > 0) {
        employeeData.skills.forEach((skill, index) => {
          formData.append(`skills[${index}]`, skill);
        });
      } else {
        formData.append('skills', JSON.stringify([]));
      }
      
      // Handle profile image if provided
      if (employeeData.profileImage) {
        formData.append('profileImage', employeeData.profileImage);
      }
      
      // Handle documents if provided
      if (employeeData.documents && employeeData.documents.length > 0) {
        employeeData.documents.forEach((doc) => {
          formData.append('documents', doc);
        });
      }
      
      const headers: Record<string, string> = getAuthHeaders();
      // Remove Content-Type as FormData will set it with the correct boundary
      delete headers['Content-Type'];
      
      console.log('Using FormData approach');
      
      response = await fetch(`${import.meta.env.VITE_API_URL}/employees`, {
        method: 'POST',
        headers: headers,
        body: formData
      });
    } else {
    
      const jsonData = {
        fullName: employeeData.fullName,
        email: employeeData.email,
        password: employeeData.password,
        designation: employeeData.designation,
        department: employeeData.department,
        subDepartment: employeeData.subDepartment,
        workLocation: employeeData.workLocation,
        gender: employeeData.gender,
        address: employeeData.address,
        emergencyContact: employeeData.emergencyContact,
        salary: employeeData.salary,
        skills: employeeData.skills,
        status: employeeData.status,
        shiftId: employeeData.shiftId
      };
      
      const headers = getAuthHeaders();
      console.log('Using JSON approach with data:', jsonData);
      
      response = await fetch(`${import.meta.env.VITE_API_URL}/employees`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(jsonData)
      });
    }

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    // Get detailed error information if available
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Failed to create employee: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    return data.data.employee;
  } catch (error) {
    console.error('Error creating employee:', error);
    return handleAuthError(error);
  }
};

// Update an employee
export const updateEmployee = async (id: string, employeeData: Partial<CreateEmployeeData>): Promise<Employee> => {
  try {
    const formData = new FormData();
    
    // Add all basic employee data
    Object.entries(employeeData).forEach(([key, value]) => {
      if (value !== undefined && key !== 'documents' && key !== 'profileImage' && key !== 'emergencyContact' && key !== 'skills') {
        formData.append(key, value as string);
      }
    });
    
    // Handle emergency contact if provided
    if (employeeData.emergencyContact) {
      formData.append('emergencyContact.name', employeeData.emergencyContact.name);
      formData.append('emergencyContact.phone', employeeData.emergencyContact.phone);
    }
    
    // Handle skills array if provided
    if (employeeData.skills) {
      employeeData.skills.forEach((skill, index) => {
        formData.append(`skills[${index}]`, skill);
      });
    }
    
    // Handle profile image if provided
    if (employeeData.profileImage) {
      formData.append('profileImage', employeeData.profileImage);
    }
    
    // Handle documents if provided
    if (employeeData.documents && employeeData.documents.length > 0) {
      employeeData.documents.forEach((doc) => {
        formData.append('documents', doc);
      });
    }
    
    const headers: Record<string, string> = getAuthHeaders();
    // Remove Content-Type as FormData will set it with the correct boundary
    delete headers['Content-Type'];
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/employees/${id}`, {
      method: 'PUT',
      headers: headers,
      body: formData
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to update employee');
    }

    const data = await response.json();
    return data.data.employee;
  } catch (error) {
    console.error(`Error updating employee with ID ${id}:`, error);
    return handleAuthError(error);
  }
};

// Delete an employee
export const deleteEmployee = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/employees/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to delete employee');
    }
  } catch (error) {
    console.error(`Error deleting employee with ID ${id}:`, error);
    handleAuthError(error);
  }
};
